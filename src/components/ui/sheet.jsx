import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Trash2, RefreshCw, Users } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Helper function moved inline to avoid import issues
const getMonthName = (monthNum) => {
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return months[monthNum - 1] || `Mes ${monthNum}`;
};

// Calculation function - uses WorkCalendar to get actual hours worked
const calculateProjectHours = async (projectId, month = null, year = null) => {
  console.log('🔍 INICIANDO CÁLCULO DE HORAS DESDE CALENDARIO');
  console.log('   Proyecto ID:', projectId);
  console.log('   Mes:', month, '| Año:', year);

  // Obtener todas las asignaciones del proyecto (activas y finalizadas)
  const allAssignments = await base44.entities.ProjectAssignment.filter({ 
    project_id: projectId
  });
  
  // Filtrar asignaciones que estuvieron activas durante el mes seleccionado
  const relevantAssignments = allAssignments.filter(a => {
    if (!month || !year) return a.status === 'active';
    
    const assignmentStart = new Date(a.start_date);
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);
    
    // La asignación debe haber empezado antes o durante el mes
    if (assignmentStart > monthEnd) return false;
    
    // Si tiene fecha de fin, debe ser después del inicio del mes
    if (a.end_date) {
      const assignmentEnd = new Date(a.end_date);
      if (assignmentEnd < monthStart) return false;
    }
    
    return true;
  });
  
  console.log('👥 ASIGNACIONES RELEVANTES PARA EL PERÍODO:', relevantAssignments.length);
  relevantAssignments.forEach((a, idx) => {
    console.log(`   ${idx + 1}. Empleado ID: ${a.employee_id}, Inicio: ${a.start_date}, Fin: ${a.end_date || 'Presente'}`);
  });
  
  if (relevantAssignments.length === 0) {
    return { 
      totalHours: 0, 
      totalDays: 0, 
      totalSalaries: 0, 
      employeeBreakdown: [], 
      error: 'No hay empleados asignados al proyecto para este período',
      diagnosticInfo: { activeAssignments: 0 }
    };
  }

  const allEmployees = await base44.entities.Employee.list();
  const allSalaries = await base44.entities.EmployeeSalary.list();

  let totalHours = 0;
  let totalDays = 0;
  let totalSalaries = 0;
  const employeeBreakdown = [];
  const diagnosticInfo = {
    assignmentsProcessed: 0,
    employeesWithHours: 0,
    employeesExcluded: [],
    calendarEntriesFound: 0
  };

  for (const assignment of relevantAssignments) {
    diagnosticInfo.assignmentsProcessed++;
    const employee = allEmployees.find(e => e.id === assignment.employee_id);
    
    if (!employee) {
      console.warn(`⚠️ EMPLEADO NO ENCONTRADO: ID ${assignment.employee_id}`);
      diagnosticInfo.employeesExcluded.push({
        employee_id: assignment.employee_id,
        reason: 'Empleado no existe en el sistema',
        assignment_start: assignment.start_date
      });
      continue;
    }

    console.log(`\n👤 PROCESANDO: ${employee.first_name} ${employee.last_name}`);
    console.log(`   Asignado desde: ${assignment.start_date}`);
    console.log(`   Fin asignación: ${assignment.end_date || 'Sin fecha de fin'}`);

    // Obtener calendario del empleado para el mes
    const rawCalendarData = await base44.entities.WorkCalendar.filter({
      employee_id: assignment.employee_id,
      year: year,
      month: month
    });

    // Eliminar duplicados: si hay múltiples entradas para la misma fecha, usar la más reciente
    const calendarByDate = {};
    rawCalendarData.forEach(day => {
      const dateKey = day.date;
      if (!calendarByDate[dateKey] || new Date(day.updated_date) > new Date(calendarByDate[dateKey].updated_date)) {
        calendarByDate[dateKey] = day;
      }
    });
    const calendarData = Object.values(calendarByDate);

    console.log(`   📅 Días en calendario: ${calendarData.length} (de ${rawCalendarData.length} registros)`);
    diagnosticInfo.calendarEntriesFound += calendarData.length;

    if (calendarData.length === 0) {
      diagnosticInfo.employeesExcluded.push({
        employee_id: assignment.employee_id,
        employee_name: `${employee.first_name} ${employee.last_name}`,
        reason: 'No hay calendario laboral para este mes',
        assignment_start: assignment.start_date
      });
      console.log(`   ⚠️ EXCLUIDO: Sin calendario para el mes`);
      continue;
    }

    const assignmentStartDate = new Date(assignment.start_date);
    assignmentStartDate.setHours(0, 0, 0, 0);
    
    const assignmentEndDate = assignment.end_date ? new Date(assignment.end_date) : null;
    if (assignmentEndDate) assignmentEndDate.setHours(0, 0, 0, 0);

    // Sumar las horas trabajadas (actual_hours) de cada día del calendario
    let empHours = 0;
    let empDays = 0;
    const workedDates = [];

    calendarData.forEach(day => {
      // Acceder correctamente a la fecha (puede estar en day.date o day.data.date)
      const dateStr = day.date || day.data?.date;
      const dayDate = new Date(dateStr);
      dayDate.setHours(0, 0, 0, 0);
      
      // Acceder correctamente a actual_hours y status
      const actualHours = day.actual_hours !== undefined ? day.actual_hours : day.data?.actual_hours;
      const dayStatus = day.status || day.data?.status || 'normal';
      
      // Verificar que el día esté dentro del período de asignación
      if (dayDate < assignmentStartDate) {
        console.log(`   ❌ ${dateStr}: Anterior a fecha de asignación (${assignment.start_date})`);
        return;
      }
      if (assignmentEndDate && dayDate > assignmentEndDate) {
        console.log(`   ❌ ${dateStr}: Posterior a fecha de fin de asignación`);
        return;
      }
      
      // Solo contar días con estado normal y horas trabajadas
      if (dayStatus === 'normal' && actualHours > 0) {
        empHours += parseFloat(actualHours);
        empDays++;
        workedDates.push(dateStr);
        console.log(`   ✅ ${dateStr}: ${actualHours}h trabajadas`);
      } else if (dayStatus !== 'normal') {
        console.log(`   ⏸️ ${dateStr}: Estado ${dayStatus} (no cuenta)`);
      } else {
        console.log(`   ⏹️ ${dateStr}: 0h o sin horas`);
      }
    });
    
    console.log(`   📊 RESULTADO: ${empHours}h en ${empDays} días`);

    if (empHours === 0) {
      diagnosticInfo.employeesExcluded.push({
        employee_id: assignment.employee_id,
        employee_name: `${employee.first_name} ${employee.last_name}`,
        reason: 'No hay horas trabajadas registradas en el calendario',
        assignment_start: assignment.start_date,
        calendar_days: calendarData.length
      });
      console.log(`   ⚠️ EXCLUIDO: Sin horas trabajadas`);
      continue;
    }

    diagnosticInfo.employeesWithHours++;

    // Calcular salario proporcional
    let empProportionalSalary = 0;
    const empSalary = allSalaries.find(s => 
      s.employee_id === assignment.employee_id && s.year === year && s.month === month
    );
    if (empSalary) {
      const daysInMonth = new Date(year, month, 0).getDate();
      empProportionalSalary = (empSalary.gross_salary / daysInMonth) * empDays;
    }

    employeeBreakdown.push({
      employee_id: assignment.employee_id,
      employee_name: `${employee.first_name} ${employee.last_name}`,
      position: employee.position,
      hours_worked: parseFloat(empHours.toFixed(2)),
      days_worked: empDays,
      proportional_salary: parseFloat(empProportionalSalary.toFixed(2)),
      assignment_start: assignment.start_date,
      worked_dates: workedDates
    });

    totalHours += empHours;
    totalDays += empDays;
    totalSalaries += empProportionalSalary;
  }

  console.log('\n📈 RESUMEN FINAL:');
  console.log(`   Total horas: ${totalHours.toFixed(2)}h`);
  console.log(`   Empleados incluidos: ${diagnosticInfo.employeesWithHours}`);
  console.log(`   Empleados excluidos: ${diagnosticInfo.employeesExcluded.length}`);

  return {
    totalHours: parseFloat(totalHours.toFixed(2)),
    totalDays,
    totalSalaries: parseFloat(totalSalaries.toFixed(2)),
    employeeBreakdown: employeeBreakdown.sort((a, b) => b.hours_worked - a.hours_worked),
    diagnosticInfo
  };
};

export default function CertificationForm({ certification, project, projects = [], onSubmit, onCancel }) {
  const [formData, setFormData] = useState(certification || {
    project_id: project?.id || '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    certified_hours: '',
    worked_hours: '',
    certified_amount: '',
    work_concepts: [{ concept: '', unit: '', quantity: '', unit_price: '', subtotal: 0 }],
    employee_breakdown: [],
    base_amount: '',
    has_iva: false,
    iva_rate: 0,
    iva_amount: '',
    total_amount: '',
    amount_collected: 0,
    payment_status: 'pending',
    notes: ''
  });
  
  const [currentProject, setCurrentProject] = useState(project);
  const [isCalculatingHours, setIsCalculatingHours] = useState(false);

  const availableProjects = projects && projects.length > 0 ? projects : (project ? [project] : []);

  useEffect(() => {
    if (project) {
        setCurrentProject(project);
    } else if (certification && availableProjects.length > 0) {
        const proj = availableProjects.find(p => p.id === certification.project_id);
        setCurrentProject(proj);
    }
  }, [project, certification, availableProjects]);
  
  useEffect(() => {
    setFormData(prev => ({
        ...prev,
        certified_hours: currentProject?.project_type === 'administration' ? prev.certified_hours : '',
        certified_amount: currentProject?.project_type === 'budget' ? prev.certified_amount : '',
        work_concepts: currentProject?.project_type === 'certification' ? (prev.work_concepts || [{ concept: '', unit: '', quantity: '', unit_price: '', subtotal: 0 }]) : [],
        employee_breakdown: currentProject?.project_type === 'administration' ? prev.employee_breakdown : [],
    }));
  }, [currentProject]);

  const calculateWorkedHours = async () => {
    if (!currentProject || currentProject.project_type !== 'administration' || !currentProject.id || !formData.month || !formData.year) {
      alert('⚠️ Faltan datos para calcular. Asegúrate de seleccionar proyecto, mes y año.');
      return;
    }
    
    setIsCalculatingHours(true);
    try {
      console.log('🔍 Calculando horas para:', currentProject.name, `(${formData.month}/${formData.year})`);
      
      const result = await calculateProjectHours(currentProject.id, formData.month, formData.year);

      if (result.error) {
        alert(`❌ ${result.error}`);
        return;
      }

      // Mostrar información de diagnóstico
      if (result.diagnosticInfo && result.diagnosticInfo.employeesExcluded.length > 0) {
        console.warn('⚠️ EMPLEADOS EXCLUIDOS:');
        result.diagnosticInfo.employeesExcluded.forEach((emp, idx) => {
          console.warn(`${idx + 1}. ${emp.employee_name || `ID: ${emp.employee_id}`}`);
          console.warn(`   Razón: ${emp.reason}`);
          console.warn(`   Asignado desde: ${emp.assignment_start}`);
          if (emp.total_reports_in_period !== undefined) {
            console.warn(`   Reportes en el período: ${emp.total_reports_in_period}`);
          }
        });
      }

      if (result.totalHours === 0) {
        let detailMessage = `❌ NO SE ENCONTRARON HORAS TRABAJADAS\n\n`;
        detailMessage += `No hay registros válidos de horas trabajadas en:\n`;
        detailMessage += `• Proyecto: ${currentProject.name}\n`;
        detailMessage += `• Mes: ${getMonthName(formData.month)} ${formData.year}\n\n`;
        
        if (result.diagnosticInfo) {
          detailMessage += `📊 DIAGNÓSTICO:\n`;
          detailMessage += `• Asignaciones activas: ${result.diagnosticInfo.assignmentsProcessed}\n`;
          detailMessage += `• Reportes en el mes: ${result.diagnosticInfo.monthlyReportsFound}\n`;
          detailMessage += `• Empleados con horas: ${result.diagnosticInfo.employeesWithHours}\n`;
          detailMessage += `• Empleados excluidos: ${result.diagnosticInfo.employeesExcluded.length}\n\n`;
          
          if (result.diagnosticInfo.employeesExcluded.length > 0) {
            detailMessage += `🔍 EMPLEADOS EXCLUIDOS:\n`;
            result.diagnosticInfo.employeesExcluded.forEach((emp, idx) => {
              detailMessage += `\n${idx + 1}. ${emp.employee_name || `ID: ${emp.employee_id}`}\n`;
              detailMessage += `   Motivo: ${emp.reason}\n`;
              detailMessage += `   Fecha asignación: ${emp.assignment_start}\n`;
              if (emp.total_reports_in_period !== undefined) {
                detailMessage += `   Reportes totales en período: ${emp.total_reports_in_period}\n`;
              }
            });
          }
        }
        
        detailMessage += `\n\n💡 POSIBLES SOLUCIONES:\n`;
        detailMessage += `1. Verifica que hay reportes de Control Diario para este período\n`;
        detailMessage += `2. Confirma que las fechas de asignación de los empleados son correctas\n`;
        detailMessage += `3. Asegúrate de que las horas trabajadas en los reportes son > 0\n`;
        detailMessage += `4. Revisa la consola del navegador (F12) para más detalles`;
        
        alert(detailMessage);
        return;
      }

      const hourlyRate = parseFloat(currentProject.hourly_rate) || 0;
      const certifiedAmount = result.totalHours * hourlyRate;

      setFormData(prev => {
        const updated = {
          ...prev,
          worked_hours: result.totalHours.toFixed(2),
          certified_hours: result.totalHours.toFixed(2),
          base_amount: certifiedAmount.toFixed(2),
          employee_breakdown: result.employeeBreakdown
        };
        return calculateTotals(updated);
      });

      const breakdownText = result.employeeBreakdown.map(emp => {
        const datesShort = emp.worked_dates.length <= 3 
          ? emp.worked_dates.join(', ')
          : `${emp.worked_dates.slice(0, 2).join(', ')} ... (+${emp.worked_dates.length - 2} más)`;
        return `• ${emp.employee_name}\n` +
               `  Asignado desde: ${emp.assignment_start}\n` +
               `  ${emp.hours_worked.toFixed(1)}h en ${emp.days_worked} días\n` +
               `  Fechas: ${datesShort}\n` +
               `  Salario proporcional: €${emp.proportional_salary.toFixed(2)}`;
      }).join('\n\n');
      
      let summaryMessage = `✅ CÁLCULO COMPLETADO\n\n`;
      summaryMessage += `📊 PROYECTO: ${currentProject.name}\n`;
      summaryMessage += `📅 PERÍODO: ${getMonthName(formData.month)} ${formData.year}\n\n`;
      summaryMessage += `⏰ TOTAL HORAS: ${result.totalHours.toFixed(2)}h\n`;
      summaryMessage += `💰 Tarifa: ${hourlyRate}€/h\n`;
      summaryMessage += `💵 Importe base: €${certifiedAmount.toFixed(2)}\n\n`;
      summaryMessage += `👷 DESGLOSE:\n${breakdownText}\n\n`;
      summaryMessage += `💰 Total salarios proporcionales: €${result.totalSalaries.toFixed(2)}\n\n`;
      
      if (result.diagnosticInfo && result.diagnosticInfo.employeesExcluded.length > 0) {
        summaryMessage += `\n⚠️ NOTA: ${result.diagnosticInfo.employeesExcluded.length} empleado(s) fueron excluidos del cálculo.\n`;
        summaryMessage += `Revisa la consola del navegador (F12) para ver los detalles.`;
      }
      
      alert(summaryMessage);

    } catch (error) {
      console.error('❌ ERROR:', error);
      alert(`❌ Error al calcular:\n\n${error.message}`);
    } finally {
      setIsCalculatingHours(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
        const newData = { ...prev, [name]: value };
        
        if (name === 'certified_hours' && currentProject?.project_type === 'administration') {
          const hours = parseFloat(value) || 0;
          const hourlyRate = parseFloat(currentProject.hourly_rate) || 0;
          newData.base_amount = (hours * hourlyRate).toFixed(2);
        } else if (name === 'certified_amount' && currentProject?.project_type === 'budget') {
          newData.base_amount = value;
        }

        return calculateTotals(newData);
    });
  };
  
  const handleSelectChange = (name, value) => {
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'project_id') {
        const newProject = availableProjects.find(p => p.id === value);
        setCurrentProject(newProject);
        if (newProject?.project_type === 'administration') {
            newData.certified_amount = '';
            newData.work_concepts = [];
            newData.employee_breakdown = [];
        } else if (newProject?.project_type === 'budget') {
            newData.certified_hours = '';
            newData.worked_hours = '';
            newData.work_concepts = [];
            newData.employee_breakdown = [];
        } else if (newProject?.project_type === 'certification') {
            newData.certified_hours = '';
            newData.worked_hours = '';
            newData.certified_amount = '';
            newData.employee_breakdown = [];
            if (!newData.work_concepts || newData.work_concepts.length === 0) {
              newData.work_concepts = [{ concept: '', unit: '', quantity: '', unit_price: '', subtotal: 0 }];
            }
        }
        return calculateTotals(newData);
      }
      return newData;
    });
  };
  
  const calculateTotals = (data) => {
    let baseAmount = parseFloat(data.base_amount) || 0;

    if (currentProject?.project_type === 'budget' && data.certified_amount !== undefined) {
      baseAmount = parseFloat(data.certified_amount) || 0;
    } else if (currentProject?.project_type === 'certification' && data.work_concepts?.length > 0) {
      baseAmount = data.work_concepts.reduce((sum, concept) => sum + (parseFloat(concept.subtotal) || 0), 0);
    } else if (currentProject?.project_type === 'administration' && data.certified_hours !== undefined && currentProject?.hourly_rate !== undefined) {
      baseAmount = (parseFloat(data.certified_hours) || 0) * (parseFloat(currentProject.hourly_rate) || 0);
    }
    
    // Si no tiene IVA, forzar a 0
    const ivaRate = data.has_iva ? (parseFloat(data.iva_rate) || 0) : 0;
    const ivaAmount = (baseAmount * ivaRate) / 100;
    data.iva_amount = ivaAmount.toFixed(2);
    data.total_amount = (baseAmount + ivaAmount).toFixed(2);
    data.base_amount = baseAmount.toFixed(2);
    return data;
  }

  const handleConceptChange = (index, field, value) => {
    const newConcepts = [...formData.work_concepts];
    newConcepts[index][field] = value;
    
    if (field === 'quantity' || field === 'unit_price') {
      const quantity = parseFloat(newConcepts[index].quantity) || 0;
      const unitPrice = parseFloat(newConcepts[index].unit_price) || 0;
      newConcepts[index].subtotal = (quantity * unitPrice).toFixed(2);
    }

    const totalBase = newConcepts.reduce((sum, concept) => sum + (parseFloat(concept.subtotal) || 0), 0);
    
    setFormData(prev => calculateTotals({
        ...prev,
        work_concepts: newConcepts,
        base_amount: totalBase.toFixed(2),
    }));
  };
  
  const addConcept = () => setFormData(prev => ({ ...prev, work_concepts: [...prev.work_concepts, { concept: '', unit: '', quantity: '', unit_price: '', subtotal: 0 }]}));
  const removeConcept = (index) => setFormData(prev => ({ ...prev, work_concepts: prev.work_concepts.filter((_, i) => i !== index) }));
  const months = Array.from({length: 12}, (_, i) => ({ value: i + 1, label: format(new Date(2023, i), 'LLLL', { locale: es }) }));
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dataToSubmit = {
      ...formData,
      year: parseInt(formData.year),
      month: parseInt(formData.month),
      certified_hours: formData.certified_hours ? parseFloat(formData.certified_hours) : undefined,
      worked_hours: formData.worked_hours ? parseFloat(formData.worked_hours) : undefined,
      certified_amount: formData.certified_amount ? parseFloat(formData.certified_amount) : undefined,
      base_amount: parseFloat(formData.base_amount) || 0,
      iva_rate: parseFloat(formData.iva_rate) || 0,
      iva_amount: parseFloat(formData.iva_amount) || 0,
      total_amount: parseFloat(formData.total_amount) || 0,
      amount_collected: parseFloat(formData.amount_collected) || 0,
      work_concepts: formData.work_concepts?.map(concept => ({
        ...concept,
        quantity: parseFloat(concept.quantity) || 0,
        unit_price: parseFloat(concept.unit_price) || 0,
        subtotal: parseFloat(concept.subtotal) || 0
      })),
      employee_breakdown: formData.employee_breakdown?.map(emp => ({
        ...emp,
        hours_worked: parseFloat(emp.hours_worked) || 0,
        days_worked: parseInt(emp.days_worked) || 0
      }))
    };
    
    Object.keys(dataToSubmit).forEach(key => {
      if (dataToSubmit[key] === undefined || dataToSubmit[key] === null || dataToSubmit[key] === '') {
        delete dataToSubmit[key];
      }
    });
    
    console.log('📤 Datos a enviar:', dataToSubmit);
    onSubmit(dataToSubmit);
  };
  
  const selectedProjectType = currentProject?.project_type;

  return (
    <Card className="w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{certification ? 'Editar' : 'Nueva'} Certificación</CardTitle>
            <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {availableProjects.length > 1 ? (
            <Select onValueChange={(value) => handleSelectChange('project_id', value)} value={formData.project_id}>
              <SelectTrigger><SelectValue placeholder="Seleccionar Proyecto *" /></SelectTrigger>
              <SelectContent>
                {availableProjects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          ) : (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900">Proyecto: {currentProject?.name}</p>
              <p className="text-xs text-blue-600">{currentProject?.code}</p>
              {currentProject?.project_type === 'administration' && (
                <p className="text-xs text-blue-600 mt-1">Tarifa: {currentProject.hourly_rate}€/hora</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Select value={formData.year.toString()} onValueChange={(v) => handleSelectChange('year', parseInt(v))}>
                <SelectTrigger><SelectValue placeholder="Año" /></SelectTrigger>
                <SelectContent>{years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={formData.month.toString()} onValueChange={(v) => handleSelectChange('month', parseInt(v))}>
                <SelectTrigger><SelectValue placeholder="Mes" /></SelectTrigger>
                <SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          {selectedProjectType === 'administration' && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-purple-900">Cálculo Automático de Horas</h4>
                  <Button 
                    type="button" 
                    onClick={calculateWorkedHours}
                    disabled={isCalculatingHours}
                    size="sm"
                    variant="outline"
                    className="border-purple-300"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isCalculatingHours ? 'animate-spin' : ''}`} />
                    {isCalculatingHours ? 'Calculando...' : 'Recalcular'}
                  </Button>
                </div>
                <p className="text-sm text-purple-700">
                  Las horas se calculan automáticamente sumando todas las horas trabajadas por los empleados asignados, 
                  filtrando por la fecha de inicio de su asignación al proyecto.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Horas Trabajadas (Total)</label>
                  <Input 
                    name="worked_hours" 
                    type="number" 
                    step="0.01"
                    placeholder="Calculado automáticamente" 
                    value={formData.worked_hours} 
                    onChange={handleChange}
                    className="bg-gray-50"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">Suma de horas de todos los empleados</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Horas Certificadas *</label>
                  <Input 
                    name="certified_hours" 
                    type="number" 
                    step="0.01"
                    placeholder="Horas a facturar" 
                    value={formData.certified_hours} 
                    onChange={handleChange} 
                    required 
                  />
                  <p className="text-xs text-gray-500 mt-1">Horas a facturar al cliente</p>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Cálculo:</strong> {formData.certified_hours || 0}h × {currentProject?.hourly_rate || 0}€/h = {formData.base_amount || 0}€
                </p>
              </div>

              {formData.employee_breakdown && formData.employee_breakdown.length > 0 && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Desglose por Empleado
                  </h4>
                  <div className="space-y-2">
                    {formData.employee_breakdown.map((emp, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm p-2 bg-white rounded border border-gray-100">
                        <span className="font-medium text-gray-700">{emp.employee_name}</span>
                        <div className="flex items-center gap-3 text-gray-600">
                          <span>{emp.days_worked} días</span>
                          <span className="font-semibold text-blue-600">{emp.hours_worked.toFixed(1)}h</span>
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-gray-200 flex justify-between items-center font-bold text-sm">
                      <span>TOTAL:</span>
                      <span className="text-blue-700">{formData.worked_hours}h</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedProjectType === 'budget' && (
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Importe Certificado *</label>
              <Input 
                name="certified_amount" 
                type="number" 
                step="0.01" 
                placeholder="Importe certificado *" 
                value={formData.certified_amount} 
                onChange={handleChange} 
                required 
              />
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Importe Base:</strong> {formData.certified_amount || 0}€
                </p>
              </div>
            </div>
          )}
          
          {selectedProjectType === 'certification' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center"><h4 className="font-semibold">Conceptos</h4><Button type="button" onClick={addConcept} size="sm"><Plus className="w-4 h-4 mr-1" /> Añadir</Button></div>
              {formData.work_concepts.map((concept, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <Input placeholder="Concepto" value={concept.concept} onChange={(e) => handleConceptChange(index, 'concept', e.target.value)} className="col-span-4"/>
                  <Input placeholder="Unidad" value={concept.unit} onChange={(e) => handleConceptChange(index, 'unit', e.target.value)} className="col-span-2"/>
                  <Input type="number" placeholder="Cant." value={concept.quantity} onChange={(e) => handleConceptChange(index, 'quantity', e.target.value)} className="col-span-2"/>
                  <Input type="number" step="0.01" placeholder="Precio/Ud." value={concept.unit_price} onChange={(e) => handleConceptChange(index, 'unit_price', e.target.value)} className="col-span-2"/>
                  <Input value={`€${concept.subtotal || 0}`} readOnly className="col-span-1 bg-gray-50"/>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeConcept(index)} className="col-span-1" disabled={formData.work_concepts.length === 1}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                </div>
              ))}
            </div>
          )}

          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_iva"
                checked={formData.has_iva}
                onCheckedChange={(checked) => {
                  setFormData(prev => calculateTotals({
                    ...prev,
                    has_iva: checked,
                    iva_rate: checked ? 21 : 0
                  }));
                }}
              />
              <label htmlFor="has_iva" className="text-sm font-medium text-gray-700 cursor-pointer">
                Incluye IVA
              </label>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <Input name="base_amount" type="number" step="0.01" placeholder="Base imponible *" value={formData.base_amount} onChange={handleChange} required />
              {formData.has_iva ? (
                <>
                  <Input name="iva_rate" type="number" placeholder="IVA (%)" value={formData.iva_rate} onChange={handleChange} />
                  <Input name="iva_amount" type="number" placeholder="Importe IVA" value={formData.iva_amount} readOnly className="bg-gray-100" />
                </>
              ) : (
                <div className="col-span-2 flex items-center text-sm text-gray-500">Sin IVA</div>
              )}
              <Input name="total_amount" type="number" placeholder="Total" value={formData.total_amount} readOnly className="bg-green-50 font-bold" />
            </div>
          </div>

           <div className="space-y-4">
              <h4 className="font-semibold">Información de Cobro</h4>
              <div className="grid grid-cols-2 gap-4">
                 <Input name="amount_collected" type="number" step="0.01" placeholder="Importe Cobrado" value={formData.amount_collected} onChange={handleChange} />
                 <Select value={formData.payment_status} onValueChange={(v) => handleSelectChange('payment_status', v)}>
                    <SelectTrigger><SelectValue placeholder="Estado de Pago" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="partially_paid">Parcialmente Pagado</SelectItem>
                      <SelectItem value="paid">Pagado</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                 </Select>
              </div>
               <Textarea name="notes" placeholder="Notas sobre la certificación o el cobro..." value={formData.notes} onChange={handleChange} />
           </div>

        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">{certification ? 'Guardar Cambios' : 'Crear Certificación'}</Button>
        </CardFooter>
      </form>
    </Card>
  );
}