import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Calculator, AlertCircle } from 'lucide-react';

export default function SalaryForm({ salary, employee, onSubmit, onCancel }) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [formData, setFormData] = useState(salary || {
    employee_id: employee.id,
    year: currentYear,
    month: currentMonth,
    gross_salary: employee.base_salary || 0,
    employee_ss: 0,
    employee_retention: 0,
    employee_garnishments: 0,
    net_salary: 0,
    extra_hours: 0,
    holiday_hours: 0,
    extra_amount: 0,
    holiday_amount: 0,
    advances_amount: 0,
    final_payment: 0,
    company_ss: 0,
    variable_expenses: 0,
    fixed_expenses_share: 0,
    total_company_cost: 0,
    calendar_found: false
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationInfo, setCalculationInfo] = useState(null);

  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  const months = [
    { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' }, { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' }, { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' }, { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' }
  ];

  const calculateSalary = async () => {
    setIsCalculating(true);
    try {
      // 1. Obtener gastos fijos de la empresa, empleados activos, asignaciones, gastos variables y calendario del empleado
      const [fixedExpenses, activeEmployees, projectAssignments, employeeVariableExpenses, workCalendarData] = await Promise.all([
        base44.entities.FixedExpense.list(),
        base44.entities.Employee.filter({ status: 'active' }),
        base44.entities.ProjectAssignment.filter({ employee_id: employee.id }),
        base44.entities.EmployeeVariableExpense.filter({ employee_id: employee.id }),
        base44.entities.WorkCalendar.filter({ employee_id: employee.id, year: formData.year, month: formData.month })
      ]);

      // 1.1 Calcular horas extra y festivas desde el calendario laboral
      let extraHoursFromCalendar = 0;
      let holidayHoursFromCalendar = 0;

      workCalendarData.forEach(day => {
        const actualHours = parseFloat(day.actual_hours) || 0;
        const standardHours = parseFloat(day.standard_hours) || 0;
        const dayType = day.day_type;
        const dayStatus = day.status || 'normal';

        // Solo contar días con estado normal
        if (dayStatus !== 'normal') return;

        if (dayType === 'sunday' || dayType === 'holiday') {
          // Todas las horas trabajadas en domingos o festivos son horas festivas
          holidayHoursFromCalendar += actualHours;
        } else if (dayType === 'saturday') {
          // Todas las horas trabajadas en sábados son horas extra
          extraHoursFromCalendar += actualHours;
        } else if (dayType === 'workday' && actualHours > standardHours) {
          // En días laborables, solo las horas por encima del estándar son extra
          extraHoursFromCalendar += (actualHours - standardHours);
        }
      });

      // Calcular suma de gastos variables del mes seleccionado
      const monthVariableExpenses = employeeVariableExpenses.filter(exp => {
        const expenseDate = exp.expense_date || exp.data?.expense_date;
        if (!expenseDate) return false;
        const date = new Date(expenseDate);
        return date.getFullYear() === formData.year && (date.getMonth() + 1) === formData.month;
      });
      const totalVariableExpensesMonth = monthVariableExpenses.reduce((sum, exp) => {
        const amount = exp.total_amount || exp.data?.total_amount || 0;
        return sum + amount;
      }, 0);

      const totalFixedExpenses = fixedExpenses.reduce((sum, exp) => sum + (exp.total_amount || 0), 0);
      const daysInMonth = new Date(formData.year, formData.month, 0).getDate();
      const monthStart = new Date(formData.year, formData.month - 1, 1);
      const monthEnd = new Date(formData.year, formData.month, 0);

      // 2. Calcular días naturales que el empleado estuvo asignado a proyectos este mes
      let employeeDaysInProjects = 0;
      const projectDetails = [];

      for (const assignment of projectAssignments) {
        if (!assignment.start_date) continue;
        
        let assignmentStart = new Date(assignment.start_date);
        let assignmentEnd = assignment.end_date ? new Date(assignment.end_date) : monthEnd;
        
        // Ajustar al rango del mes seleccionado
        if (assignmentStart < monthStart) assignmentStart = monthStart;
        if (assignmentEnd > monthEnd) assignmentEnd = monthEnd;
        
        // Si la asignación está fuera del mes, saltar
        if (assignmentStart > monthEnd || assignmentEnd < monthStart) continue;
        
        // Días naturales en este proyecto durante el mes
        const naturalDays = Math.ceil((assignmentEnd - assignmentStart) / (1000 * 60 * 60 * 24)) + 1;
        employeeDaysInProjects = Math.max(employeeDaysInProjects, naturalDays); // Usar el máximo si hay solapamiento
        
        // Obtener nombre del proyecto
        const project = await base44.entities.Project.filter({ id: assignment.project_id });
        projectDetails.push({
          name: project[0]?.name || 'Proyecto desconocido',
          days: naturalDays,
          start: assignmentStart.toISOString().split('T')[0],
          end: assignmentEnd.toISOString().split('T')[0]
        });
      }

      // Si no hay asignaciones, usar días del mes completo
      if (employeeDaysInProjects === 0) {
        employeeDaysInProjects = daysInMonth;
      }

      const employeeWorkRatio = employeeDaysInProjects / daysInMonth;

      // 3. Calcular coeficiente de gastos fijos prorrateado
      const OPERARIO_POSITIONS = ["Peón", "Peón Especialista", "Oficial de 3ª", "Oficial de 2ª", "Oficial de 1ª"];
      const activeOperarios = activeEmployees.filter(emp => OPERARIO_POSITIONS.includes(emp.position));
      
      const fixedExpensePerOperario = activeOperarios.length > 0 
        ? totalFixedExpenses / activeOperarios.length 
        : 0;
      
      const isOperario = OPERARIO_POSITIONS.includes(employee.position);
      // El coeficiente de gastos fijos es el total dividido entre operarios (sin prorratear por días)
      const fixedExpenseForEmployee = isOperario 
        ? fixedExpensePerOperario 
        : 0;

      // 4. Calcular salario y SS prorrateados según días trabajados
      const baseSalary = parseFloat(employee.base_salary) || 0;
      
      // Salario bruto prorrateado: (salario mensual / días del mes) * días trabajados
      const proratedGrossSalary = (baseSalary / daysInMonth) * employeeDaysInProjects;
      
      // SS Empresa prorrateada (aproximación 30% del salario base prorrateado)
      const proratedCompanySS = proratedGrossSalary * 0.30;
      
      // SS Trabajador prorrateada (aproximación 6.35% del salario base prorrateado)
      const proratedEmployeeSS = proratedGrossSalary * 0.0635;
      
      // Retención prorrateada (aproximación 15% del salario base prorrateado)
      const proratedRetention = proratedGrossSalary * 0.15;

      // Obtener valores del formulario para el cálculo
      const grossSalary = parseFloat(formData.gross_salary) || 0;
      const companySS = parseFloat(formData.company_ss) || 0;
      // Usar los gastos variables calculados automáticamente del mes
      const variableExpensesTotal = totalVariableExpensesMonth;
      
      // Calcular importes de horas extra y festivas
      const overtimeRate = employee.overtime_rate || 12;
      const holidayRate = employee.holiday_rate || 16;
      const calculatedExtraAmount = extraHoursFromCalendar * overtimeRate;
      const calculatedHolidayAmount = holidayHoursFromCalendar * holidayRate;
      
      // Obtener deducciones del trabajador
      const employeeSS = parseFloat(formData.employee_ss) || 0;
      const employeeRetention = parseFloat(formData.employee_retention) || 0;

      // COSTE TOTAL = Salario Bruto + Extras + Festivas + SS Empresa + Gastos Variables + Gastos Fijos
      const totalCompanyCost = grossSalary + calculatedExtraAmount + calculatedHolidayAmount + companySS + variableExpensesTotal + fixedExpenseForEmployee;

      // Calcular salario neto y pago final con las nuevas horas
      const netSalary = grossSalary + calculatedExtraAmount + calculatedHolidayAmount - employeeSS - employeeRetention - (parseFloat(formData.employee_garnishments) || 0);
      const finalPayment = netSalary - (parseFloat(formData.advances_amount) || 0);

      setFormData(prev => ({
        ...prev,
        extra_hours: parseFloat(extraHoursFromCalendar.toFixed(2)),
        holiday_hours: parseFloat(holidayHoursFromCalendar.toFixed(2)),
        extra_amount: parseFloat(calculatedExtraAmount.toFixed(2)),
        holiday_amount: parseFloat(calculatedHolidayAmount.toFixed(2)),
        variable_expenses: parseFloat(totalVariableExpensesMonth.toFixed(2)),
        fixed_expenses_share: parseFloat(fixedExpenseForEmployee.toFixed(2)),
        total_company_cost: parseFloat(totalCompanyCost.toFixed(2)),
        net_salary: parseFloat(netSalary.toFixed(2)),
        final_payment: parseFloat(finalPayment.toFixed(2)),
        calendar_found: workCalendarData.length > 0
      }));

      setCalculationInfo({
        daysInMonth,
        daysWorked: employeeDaysInProjects,
        workRatio: employeeWorkRatio,
        isProrated: employeeWorkRatio < 1,
        totalFixedExpenses,
        activeOperarios: activeOperarios.length,
        fixedPerOperario: fixedExpensePerOperario,
        isOperario,
        projectDetails,
        proratedGrossSalary,
        proratedCompanySS,
        proratedEmployeeSS,
        proratedRetention,
        variableExpensesTotal,
        extraHoursFromCalendar,
        holidayHoursFromCalendar,
        calculatedExtraAmount,
        calculatedHolidayAmount
      });

      let projectInfo = '';
      if (projectDetails.length > 0) {
        projectInfo = projectDetails.map(p => `  • ${p.name}: ${p.days} días (${p.start} - ${p.end})`).join('\n');
      } else {
        projectInfo = '  • Sin asignaciones a proyectos (mes completo)';
      }

      alert(
        `✅ CÁLCULO COMPLETADO\n\n` +
        `📅 ${months.find(m => m.value === formData.month)?.label} ${formData.year}\n\n` +
        `📊 DÍAS EN PROYECTOS:\n${projectInfo}\n\n` +
        `📊 PROPORCIÓN:\n` +
        `• Días del mes: ${daysInMonth}\n` +
        `• Días trabajados en obra: ${employeeDaysInProjects}\n` +
        `• Proporción: ${(employeeWorkRatio * 100).toFixed(1)}%\n\n` +
        `💰 VALORES PRORRATEADOS (referencia):\n` +
        `• Salario base mensual: €${baseSalary.toFixed(2)}\n` +
        `• Salario bruto prorrateado: €${proratedGrossSalary.toFixed(2)}\n` +
        `• SS Empresa prorrateada: €${proratedCompanySS.toFixed(2)}\n` +
        `• SS Trabajador prorrateada: €${proratedEmployeeSS.toFixed(2)}\n` +
        `• Retención prorrateada: €${proratedRetention.toFixed(2)}\n\n` +
        `🏢 GASTOS FIJOS:\n` +
        `• Total gastos fijos empresa: €${totalFixedExpenses.toFixed(2)}\n` +
        `• Operarios activos: ${activeOperarios.length}\n` +
        `• COEF. GASTOS FIJOS (Total/Operarios): €${fixedExpenseForEmployee.toFixed(2)}\n\n` +
        `📦 GASTOS VARIABLES: €${variableExpensesTotal.toFixed(2)}\n\n` +
        `⏱️ HORAS EXTRA Y FESTIVAS (desde calendario):\n` +
        `• Horas extra: ${extraHoursFromCalendar.toFixed(2)}h × €${overtimeRate}/h = €${calculatedExtraAmount.toFixed(2)}\n` +
        `• Horas festivas: ${holidayHoursFromCalendar.toFixed(2)}h × €${holidayRate}/h = €${calculatedHolidayAmount.toFixed(2)}\n\n` +
        `💵 COSTE TOTAL EMPRESA: €${totalCompanyCost.toFixed(2)}\n\n` +
        `⚠️ Los valores de salario, SS y retención son de referencia.\nIntroduce los valores reales manualmente.\n\n` +
        `✅ Las horas extra y festivas se han rellenado automáticamente.\nPuedes modificarlas manualmente si es necesario.`
      );

    } catch (error) {
      console.error('Error calculating salary:', error);
      alert(`❌ Error al calcular:\n\n${error.message}`);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    setFormData(prev => {
      const newData = { ...prev, [name]: numValue };
      
      // Recalcular importe de horas extra cuando cambien las horas
      if (name === 'extra_hours') {
        const extraAmount = numValue * (employee.overtime_rate || 12);
        newData.extra_amount = parseFloat(extraAmount.toFixed(2));
      }
      
      // Recalcular importe de horas festivas cuando cambien las horas
      if (name === 'holiday_hours') {
        const holidayAmount = numValue * (employee.holiday_rate || 16);
        newData.holiday_amount = parseFloat(holidayAmount.toFixed(2));
      }
      
      // Recalcular automáticamente totales cuando cambien ciertos campos
      if (['gross_salary', 'extra_hours', 'extra_amount', 'holiday_hours', 'holiday_amount', 'employee_ss', 'employee_retention', 'employee_garnishments', 'advances_amount'].includes(name)) {
        const gross = name === 'gross_salary' ? numValue : (prev.gross_salary || 0);
        const extra = name === 'extra_amount' ? numValue : (name === 'extra_hours' ? numValue * (employee.overtime_rate || 12) : (prev.extra_amount || 0));
        const holiday = name === 'holiday_amount' ? numValue : (name === 'holiday_hours' ? numValue * (employee.holiday_rate || 16) : (prev.holiday_amount || 0));
        const ss = name === 'employee_ss' ? numValue : (prev.employee_ss || 0);
        const retention = name === 'employee_retention' ? numValue : (prev.employee_retention || 0);
        const garnishments = name === 'employee_garnishments' ? numValue : (prev.employee_garnishments || 0);
        const advances = name === 'advances_amount' ? numValue : (prev.advances_amount || 0);
        
        const netSalary = gross + extra + holiday - ss - retention - garnishments;
        const finalPayment = netSalary - advances;
        
        newData.net_salary = parseFloat(netSalary.toFixed(2));
        newData.final_payment = parseFloat(finalPayment.toFixed(2));
      }
      
      // Recalcular coste empresa: Salario Neto + SS Empresa + SS Trabajador + Retención + Gastos Variables + Gastos Fijos
      if (['net_salary', 'company_ss', 'employee_ss', 'employee_retention', 'variable_expenses', 'gross_salary', 'extra_hours', 'extra_amount', 'holiday_hours', 'holiday_amount', 'advances_amount', 'employee_garnishments'].includes(name)) {
        // Recalcular net_salary primero si es necesario
        const gross = name === 'gross_salary' ? numValue : (prev.gross_salary || 0);
        const extra = name === 'extra_amount' ? numValue : (name === 'extra_hours' ? numValue * (employee.overtime_rate || 12) : (prev.extra_amount || 0));
        const holiday = name === 'holiday_amount' ? numValue : (name === 'holiday_hours' ? numValue * (employee.holiday_rate || 16) : (prev.holiday_amount || 0));
        const ss = name === 'employee_ss' ? numValue : (prev.employee_ss || 0);
        const retention = name === 'employee_retention' ? numValue : (prev.employee_retention || 0);
        const garnishments = name === 'employee_garnishments' ? numValue : (prev.employee_garnishments || 0);
        
        const netSalary = gross + extra + holiday - ss - retention - garnishments;
        newData.net_salary = parseFloat(netSalary.toFixed(2));
        
        // Ahora calcular coste empresa
        const companySS = name === 'company_ss' ? numValue : (prev.company_ss || 0);
        const varExpenses = name === 'variable_expenses' ? numValue : (prev.variable_expenses || 0);
        const fixedShare = prev.fixed_expenses_share || 0;
        
        // COSTE TOTAL = Salario Bruto + Extras + Festivas + SS Empresa + Gastos Variables + Gastos Fijos
        const totalCost = gross + extra + holiday + companySS + varExpenses + fixedShare;
        newData.total_company_cost = parseFloat(totalCost.toFixed(2));
      }
      
      return newData;
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: parseInt(value) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="w-full max-w-4xl shadow-2xl">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{salary ? 'Editar' : 'Nueva'} Nómina - {employee.first_name} {employee.last_name}</CardTitle>
            <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Período */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Año *</label>
              <Select value={formData.year.toString()} onValueChange={(v) => handleSelectChange('year', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Mes *</label>
              <Select value={formData.month.toString()} onValueChange={(v) => handleSelectChange('month', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {months.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botón de cálculo automático */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h4 className="font-semibold text-blue-900">Calcular Gastos Fijos Prorrateados</h4>
                <p className="text-sm text-blue-700">
                  Calcula el coeficiente de gastos fijos en función de los días que ha estado asignado a proyectos este mes. Los demás conceptos (salario, SS, retenciones, etc.) se introducen manualmente.
                </p>
              </div>
              <Button 
                type="button" 
                onClick={calculateSalary}
                disabled={isCalculating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Calculator className={`w-4 h-4 mr-2 ${isCalculating ? 'animate-spin' : ''}`} />
                {isCalculating ? 'Calculando...' : 'Calcular'}
              </Button>
            </div>
            {calculationInfo && (
              <div className="text-xs text-blue-800 mt-2 space-y-1">
                <p>✓ Días en proyectos: {calculationInfo.daysWorked} de {calculationInfo.daysInMonth} días del mes ({(calculationInfo.workRatio * 100).toFixed(1)}%)</p>
                <p>✓ Gastos fijos prorrateados: €{(formData.fixed_expenses_share || 0).toFixed(2)}</p>
                {calculationInfo.proratedGrossSalary && (
                  <p>💡 Salario bruto prorrateado (referencia): €{calculationInfo.proratedGrossSalary.toFixed(2)}</p>
                )}
                {calculationInfo.proratedCompanySS && (
                  <p>💡 SS Empresa prorrateada (referencia): €{calculationInfo.proratedCompanySS.toFixed(2)}</p>
                )}
                {calculationInfo.isProrated && (
                  <p className="text-amber-700 font-medium">⚠️ Valores prorrateados al {(calculationInfo.workRatio * 100).toFixed(0)}% del mes</p>
                )}
              </div>
            )}
          </div>

          {!formData.calendar_found && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                No se encontró calendario para este mes. Ve a la pestaña "Calendario" del empleado para crearlo.
              </AlertDescription>
            </Alert>
          )}

          {/* Datos salariales - TODOS EDITABLES */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Datos Salariales</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Salario Bruto *</label>
                <Input name="gross_salary" type="number" step="0.01" value={formData.gross_salary} onChange={handleChange} required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Adelantos del Mes</label>
                <Input name="advances_amount" type="number" step="0.01" value={formData.advances_amount} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Horas Extra y Festivas - Destacado */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-4">
            <h4 className="font-semibold text-amber-900 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Horas Extra y Festivas (calculadas desde calendario)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-amber-700 mb-1 block">Horas Extra</label>
                <Input name="extra_hours" type="number" step="0.01" value={formData.extra_hours} onChange={handleChange} className="bg-white" />
                <p className="text-xs text-amber-600 mt-1">Tarifa: €{employee.overtime_rate || 12}/h</p>
              </div>
              <div>
                <label className="text-sm font-medium text-amber-700 mb-1 block">Importe Extra</label>
                <div className="text-xl font-bold text-amber-900 bg-white p-2 rounded border border-amber-300">
                  €{(formData.extra_amount || 0).toFixed(2)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-amber-700 mb-1 block">Horas Festivas</label>
                <Input name="holiday_hours" type="number" step="0.01" value={formData.holiday_hours} onChange={handleChange} className="bg-white" />
                <p className="text-xs text-amber-600 mt-1">Tarifa: €{employee.holiday_rate || 16}/h</p>
              </div>
              <div>
                <label className="text-sm font-medium text-amber-700 mb-1 block">Importe Festivas</label>
                <div className="text-xl font-bold text-amber-900 bg-white p-2 rounded border border-amber-300">
                  €{(formData.holiday_amount || 0).toFixed(2)}
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-amber-300">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-amber-800">TOTAL HORAS EXTRA + FESTIVAS:</span>
                <span className="text-xl font-bold text-amber-900">
                  €{((formData.extra_amount || 0) + (formData.holiday_amount || 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Deducciones */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Deducciones del Empleado</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Seguridad Social</label>
                <Input name="employee_ss" type="number" step="0.01" value={formData.employee_ss} onChange={handleChange} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Retención IRPF</label>
                <Input name="employee_retention" type="number" step="0.01" value={formData.employee_retention} onChange={handleChange} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Embargos</label>
                <Input name="employee_garnishments" type="number" step="0.01" value={formData.employee_garnishments} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Resumen - con indicador de cálculo automático */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div>
              <label className="text-sm font-medium text-green-700">Salario Neto</label>
              <p className="text-2xl font-bold text-green-900">€{formData.net_salary.toFixed(2)}</p>
              <p className="text-xs text-green-600 mt-1">Calculado automáticamente</p>
            </div>
            <div>
              <label className="text-sm font-medium text-green-700">Pago Final (Neto - Adelantos)</label>
              <p className="text-2xl font-bold text-green-900">€{formData.final_payment.toFixed(2)}</p>
              <p className="text-xs text-green-600 mt-1">Calculado automáticamente</p>
            </div>
          </div>

          {/* Costes empresa - TODOS EDITABLES */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Costes de la Empresa</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Seg. Social Empresa</label>
                <Input name="company_ss" type="number" step="0.01" value={formData.company_ss} onChange={handleChange} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Gastos Variables</label>
                <Input name="variable_expenses" type="number" step="0.01" value={formData.variable_expenses} onChange={handleChange} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Gastos Fijos (prorrateados)</label>
                <div className="text-lg font-bold text-gray-900 bg-gray-100 p-2 rounded border">
                  €{(formData.fixed_expenses_share || 0).toFixed(2)}
                </div>
                <p className="text-xs text-gray-500 mt-1">Total fijos / empleados activos</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <label className="text-sm font-medium text-red-700">Coste Total Empresa</label>
                <p className="text-xl font-bold text-red-900">€{formData.total_company_cost.toFixed(2)}</p>
                <p className="text-xs text-red-600 mt-1">Calculado automáticamente</p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" className="bg-green-600 hover:bg-green-700">
            {salary ? 'Guardar Cambios' : 'Crear Nómina'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}