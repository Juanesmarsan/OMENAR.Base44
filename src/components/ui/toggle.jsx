import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, CheckCircle, Activity, Users, FileText, Clock, ChevronLeft, ChevronRight, Save, Lock, Calendar as CalendarIcon } from 'lucide-react';
import FinancialReportPDF from './FinancialReportPDF';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const OPERARIO_POSITIONS = ["Peón", "Peón Especialista", "Oficial de 3ª", "Oficial de 2ª", "Oficial de 1ª"];

/**
 * Calcula el análisis financiero de un proyecto con lógica optimizada:
 * - Recopilación centralizada de datos (una sola consulta paralela)
 * - Atribución de horas via DailyWorkReport (horas extra/festivas al proyecto donde se hicieron)
 * - Prorrateo proporcional de salarios y gastos fijos según tiempo dedicado a cada proyecto
 * - Gastos variables vinculados directamente al proyecto donde se incurrieron
 */
const calculateProjectFinancialAnalysis = async (project, filterYear = null, filterMonth = null) => {
  console.log('🔍 INICIO CÁLCULO - Proyecto:', project.name, 'Mes:', filterYear, filterMonth);
  
  // PASO 1: Cargar TODOS los datos en paralelo
  const [
    certifications,
    directExpenses,
    allSalaries,
    workCalendars,
    allEmployees,
    fixedExpenses,
    projectAssignments,
    variableExpenses
  ] = await Promise.all([
    base44.entities.ProjectCertification.filter({ project_id: project.id }),
    base44.entities.ProjectDirectExpense.filter({ project_id: project.id }),
    base44.entities.EmployeeSalary.list(),
    base44.entities.WorkCalendar.filter({ project_id: project.id }),
    base44.entities.Employee.list(),
    base44.entities.FixedExpense.list(),
    base44.entities.ProjectAssignment.filter({ project_id: project.id }),
    base44.entities.EmployeeVariableExpense.filter({ project_id: project.id })
  ]);

  console.log('📊 DATOS CARGADOS:', {
    certifications: certifications.length,
    directExpenses: directExpenses.length,
    salaries: allSalaries.length,
    workCalendars: workCalendars.length,
    employees: allEmployees.length
  });

  // PASO 2: Filtrar datos del mes seleccionado
  const monthCertifications = filterYear && filterMonth
    ? certifications.filter(c => c.year === filterYear && c.month === filterMonth)
    : [];

  const monthDirectExpenses = filterYear && filterMonth
    ? directExpenses.filter(exp => {
        const date = new Date(exp.expense_date);
        return date.getFullYear() === filterYear && (date.getMonth() + 1) === filterMonth;
      })
    : [];

  const monthWorkCalendars = filterYear && filterMonth
    ? workCalendars.filter(day => day.year === filterYear && day.month === filterMonth && day.status === 'normal')
    : [];

  const monthSalaries = filterYear && filterMonth
    ? allSalaries.filter(s => s.year === filterYear && s.month === filterMonth)
    : [];

  const monthVariableExpenses = filterYear && filterMonth
    ? variableExpenses.filter(exp => {
        const date = new Date(exp.expense_date);
        return date.getFullYear() === filterYear && (date.getMonth() + 1) === filterMonth;
      })
    : [];

  console.log('📅 DATOS DEL MES:', {
    certificaciones: monthCertifications.length,
    gastosDirectos: monthDirectExpenses.length,
    diasCalendario: monthWorkCalendars.length,
    nominas: monthSalaries.length
  });

  // PASO 3: CALCULAR INGRESOS (solo certificaciones del mes)
  const revenue = monthCertifications.reduce((sum, cert) => sum + (cert.base_amount || 0), 0);
  console.log('💰 INGRESOS:', revenue);

  // PASO 4: CALCULAR GASTOS DIRECTOS (solo del mes)
  const totalDirectExpenses = monthDirectExpenses.reduce((sum, exp) => sum + (exp.total_amount || 0), 0);
  console.log('📝 GASTOS DIRECTOS:', totalDirectExpenses);

  // PASO 5: CALCULAR COSTES DE PERSONAL
  // Obtener empleados únicos del calendario
  const employeeIds = [...new Set(monthWorkCalendars.map(day => day.employee_id))];
  console.log('👷 EMPLEADOS EN PROYECTO:', employeeIds.length);

  let totalSalaries = 0;
  let totalOvertimePay = 0;
  let totalCompanySS = 0;
  let totalVariableExpenses = 0;
  const personnelBreakdown = [];

  for (const empId of employeeIds) {
    const employee = allEmployees.find(e => e.id === empId);
    if (!employee) continue;

    // Calcular horas extra y festivas del calendario
    let extraHours = 0;
    let holidayHours = 0;
    let totalHours = 0;
    let workedDays = 0;
    
    monthWorkCalendars.filter(day => day.employee_id === empId).forEach(day => {
      const hours = parseFloat(day.actual_hours) || 0;
      totalHours += hours;
      if (hours > 0) workedDays++;
      
      if (day.day_type === 'saturday') extraHours += hours;
      if (day.day_type === 'sunday' || day.day_type === 'holiday') holidayHours += hours;
    });

    // Obtener la nómina del empleado para este mes
    const salary = monthSalaries.find(s => s.employee_id === empId);
    
    const grossSalary = salary?.gross_salary || 0;
    const companySS = salary?.company_ss || 0;
    
    // Sumar gastos variables del proyecto para este empleado
    const empVariableExpenses = monthVariableExpenses
      .filter(exp => exp.employee_id === empId)
      .reduce((sum, exp) => sum + (exp.total_amount || 0), 0);
    
    totalSalaries += grossSalary;
    totalCompanySS += companySS;
    totalVariableExpenses += empVariableExpenses;
    
    const overtimeRate = employee.overtime_rate || 12;
    const holidayRate = employee.holiday_rate || 16;
    const overtimePay = (extraHours * overtimeRate) + (holidayHours * holidayRate);
    totalOvertimePay += overtimePay;
    
    const totalCostBeforeFixed = grossSalary + overtimePay + companySS + empVariableExpenses;
    
    personnelBreakdown.push({
      employee_id: empId,
      employee_name: `${employee.first_name} ${employee.last_name}`,
      position: employee.position,
      hours_worked: totalHours,
      worked_days: workedDays,
      extra_hours: extraHours,
      holiday_hours: holidayHours,
      proportional_salary: grossSalary,
      overtime_pay: overtimePay,
      company_ss: companySS,
      variable_expenses: empVariableExpenses,
      fixed_expenses_prorated: 0,
      total_cost: totalCostBeforeFixed,
      cost_per_hour: totalHours > 0 ? totalCostBeforeFixed / totalHours : 0
    });
  }

  console.log('💼 PERSONAL:', {
    salarios: totalSalaries,
    horasExtra: totalOvertimePay,
    segSocial: totalCompanySS,
    gastosVariables: totalVariableExpenses
  });

  // PASO 6: CALCULAR GASTOS FIJOS PRORRATEADOS
  const totalFixedExpenses = fixedExpenses.reduce((sum, exp) => sum + (exp.total_amount || 0), 0);
  const allOperarios = allEmployees.filter(emp => emp.status === 'active' && OPERARIO_POSITIONS.includes(emp.position));
  const fixedExpensePerOperario = allOperarios.length > 0 ? totalFixedExpenses / allOperarios.length : 0;
  
  const daysInMonth = filterYear && filterMonth ? new Date(filterYear, filterMonth, 0).getDate() : 30;
  const monthStart = new Date(filterYear, filterMonth - 1, 1);
  const monthEnd = new Date(filterYear, filterMonth, 0);
  
  // Calcular días naturales que cada empleado estuvo asignado al proyecto durante el mes
  const employeeNaturalDays = {};
  personnelBreakdown.forEach(emp => {
    const assignment = projectAssignments.find(a => a.employee_id === emp.employee_id && a.status === 'active');
    if (assignment) {
      const assignStart = new Date(assignment.start_date);
      const assignEnd = assignment.end_date ? new Date(assignment.end_date) : monthEnd;
      
      // Calcular días dentro del mes
      const effectiveStart = assignStart > monthStart ? assignStart : monthStart;
      const effectiveEnd = assignEnd < monthEnd ? assignEnd : monthEnd;
      
      if (effectiveStart <= effectiveEnd) {
        const daysDiff = Math.floor((effectiveEnd - effectiveStart) / (1000 * 60 * 60 * 24)) + 1;
        employeeNaturalDays[emp.employee_id] = daysDiff;
      }
    }
  });
  
  // Calcular gastos fijos prorrateados para cada empleado del proyecto
  let fixedExpensesProrated = 0;
  personnelBreakdown.forEach(emp => {
    const employee = allEmployees.find(e => e.id === emp.employee_id);
    if (employee && OPERARIO_POSITIONS.includes(employee.position)) {
      // Usar días naturales de asignación al proyecto
      const naturalDays = employeeNaturalDays[emp.employee_id] || 0;
      const proportion = naturalDays / daysInMonth;
      const empFixedExpense = proportion * fixedExpensePerOperario;
      emp.fixed_expenses_prorated = empFixedExpense;
      emp.natural_days = naturalDays;
      emp.total_cost += empFixedExpense;
      // Recalcular coste por hora incluyendo gastos fijos
      emp.cost_per_hour = emp.hours_worked > 0 ? emp.total_cost / emp.hours_worked : 0;
      fixedExpensesProrated += empFixedExpense;
    }
  });

  console.log('🏢 GASTOS FIJOS PRORRATEADOS:', fixedExpensesProrated);

  // PASO 7: CALCULAR TOTALES
  const totalPersonnelCosts = totalSalaries + totalOvertimePay + totalCompanySS + totalVariableExpenses + fixedExpensesProrated;
  const totalExpenses = totalDirectExpenses + totalPersonnelCosts;
  const margin = revenue - totalExpenses;
  const marginPercentage = revenue > 0 ? (margin / revenue) * 100 : 0;

  console.log('📊 RESUMEN:', {
    ingresos: revenue,
    gastosDirectos: totalDirectExpenses,
    costesPersonal: totalPersonnelCosts,
    gastosTotales: totalExpenses,
    margen: margin,
    margenPorcentaje: marginPercentage
  });

  // PASO 8: PREPARAR DATOS PARA RETORNO
  const fixedExpensesDetail = {
    totalFixedExpenses,
    totalOperarios: allOperarios.length,
    daysInMonth,
    fixedExpensePerOperario,
    projectHours: personnelBreakdown.reduce((sum, emp) => sum + emp.hours_worked, 0),
    proratedAmount: fixedExpensesProrated
  };

  return {
    revenue,
    totalExpenses,
    totalDirectExpenses,
    variableExpenses: totalVariableExpenses,
    personnelCosts: totalPersonnelCosts,
    salaries: totalSalaries,
    overtimePay: totalOvertimePay,
    companySS: totalCompanySS,
    fixedExpensesProrated,
    margin,
    marginPercentage,
    monthlyData: [],
    personnelBreakdown,
    fixedExpensesDetail,
    debugInfo: {
      certificationsFound: monthCertifications.length,
      workCalendarsFound: monthWorkCalendars.length,
      salariesFound: monthSalaries.length,
      directExpensesFound: monthDirectExpenses.length,
      employeesFound: employeeIds.length
    }
  };
};

export default function ProjectFinancialAnalysis({ project }) {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [viewMode, setViewMode] = useState('current'); // 'current' | 'historical'
  const [savedSnapshots, setSavedSnapshots] = useState([]);
  const [currentSnapshot, setCurrentSnapshot] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [analysisData, setAnalysisData] = useState({
    revenue: 0,
    revenueBreakdown: { fromCertifications: 0, certificationsCount: 0 },
    totalExpenses: 0,
    totalDirectExpenses: 0,
    variableExpenses: 0,
    personnelCosts: 0,
    salaries: 0,
    overtimePay: 0,
    companySS: 0,
    fixedExpensesProrated: 0,
    margin: 0,
    marginPercentage: 0,
    monthlyData: [],
    personnelBreakdown: [],
    fixedExpensesDetail: {},
    debugInfo: null
  });
  const [isLoading, setIsLoading] = useState(true);

  // Cargar snapshots guardados
  const loadSnapshots = useCallback(async () => {
    try {
      const snapshots = await base44.entities.ProjectFinancialSnapshot.filter({ project_id: project.id });
      setSavedSnapshots(snapshots.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      }));
    } catch (error) {
      console.error('Error loading snapshots:', error);
    }
  }, [project.id]);

  const loadFinancialData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Verificar si hay un snapshot guardado para el mes seleccionado
      const existingSnapshot = savedSnapshots.find(
        s => s.year === selectedYear && s.month === selectedMonth
      );
      
      if (existingSnapshot && existingSnapshot.status === 'authorized') {
        // Cargar desde snapshot autorizado
        setCurrentSnapshot(existingSnapshot);
        setAnalysisData({
          revenue: existingSnapshot.revenue || 0,
          totalExpenses: existingSnapshot.total_expenses || 0,
          totalDirectExpenses: existingSnapshot.total_direct_expenses || 0,
          variableExpenses: existingSnapshot.variable_expenses || 0,
          personnelCosts: existingSnapshot.personnel_costs || 0,
          salaries: existingSnapshot.salaries || 0,
          overtimePay: existingSnapshot.overtime_pay || 0,
          companySS: existingSnapshot.company_ss || 0,
          fixedExpensesProrated: existingSnapshot.fixed_expenses_prorated || 0,
          margin: existingSnapshot.margin || 0,
          marginPercentage: existingSnapshot.margin_percentage || 0,
          monthlyData: [],
          personnelBreakdown: existingSnapshot.personnel_breakdown || [],
          fixedExpensesDetail: existingSnapshot.fixed_expenses_detail || {}
        });
      } else {
        // Calcular datos en tiempo real
        setCurrentSnapshot(existingSnapshot || null);
        const data = await calculateProjectFinancialAnalysis(project, selectedYear, selectedMonth);
        setAnalysisData(data);
      }
    } catch (error) {
      console.error('Error loading financial analysis:', error);
    } finally {
      setIsLoading(false);
    }
  }, [project, selectedYear, selectedMonth, savedSnapshots]);

  useEffect(() => {
    loadSnapshots();
  }, [loadSnapshots]);

  useEffect(() => {
    if (savedSnapshots !== undefined) {
      loadFinancialData();
    }
  }, [loadFinancialData, savedSnapshots, selectedYear, selectedMonth]);

  const handleSaveSnapshot = async () => {
    setIsSaving(true);
    try {
      const snapshotData = {
        project_id: project.id,
        year: selectedYear,
        month: selectedMonth,
        revenue: analysisData.revenue,
        total_expenses: analysisData.totalExpenses,
        total_direct_expenses: analysisData.totalDirectExpenses,
        variable_expenses: analysisData.variableExpenses,
        personnel_costs: analysisData.personnelCosts,
        salaries: analysisData.salaries,
        overtime_pay: analysisData.overtimePay,
        company_ss: analysisData.companySS,
        fixed_expenses_prorated: analysisData.fixedExpensesProrated,
        margin: analysisData.margin,
        margin_percentage: analysisData.marginPercentage,
        personnel_breakdown: analysisData.personnelBreakdown,
        fixed_expenses_detail: analysisData.fixedExpensesDetail,
        status: 'draft'
      };

      if (currentSnapshot) {
        await base44.entities.ProjectFinancialSnapshot.update(currentSnapshot.id, snapshotData);
      } else {
        await base44.entities.ProjectFinancialSnapshot.create(snapshotData);
      }

      await loadSnapshots();
      alert('✅ Datos del mes guardados correctamente');
    } catch (error) {
      console.error('Error saving snapshot:', error);
      alert('❌ Error al guardar: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAuthorizeSnapshot = async () => {
    if (!currentSnapshot) {
      alert('⚠️ Primero debes guardar los datos del mes');
      return;
    }

    const confirmed = window.confirm(
      `¿Estás seguro de AUTORIZAR los datos financieros de ${getMonthName(selectedMonth)} ${selectedYear}?\n\n` +
      `Una vez autorizado, estos datos quedarán bloqueados y no se podrán modificar.`
    );

    if (!confirmed) return;

    setIsSaving(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.ProjectFinancialSnapshot.update(currentSnapshot.id, {
        status: 'authorized',
        authorized_by: user.email,
        authorized_at: new Date().toISOString()
      });

      await loadSnapshots();
      alert('✅ Mes autorizado correctamente. Los datos han quedado bloqueados.');
    } catch (error) {
      console.error('Error authorizing snapshot:', error);
      alert('❌ Error al autorizar: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      if (selectedMonth === 1) {
        setSelectedMonth(12);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 12) {
        setSelectedMonth(1);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

  const getMonthName = (month) => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[month - 1];
  };

  const isCurrentMonthAuthorized = currentSnapshot?.status === 'authorized';

  const getProjectTypeInfo = () => {
    const types = {
      administration: { label: "Por Administración", color: "bg-blue-100 text-blue-800" },
      budget: { label: "Por Presupuesto", color: "bg-purple-100 text-purple-800" },
      certification: { label: "Por Certificación", color: "bg-orange-100 text-orange-800" }
    };
    return types[project.project_type] || types.administration;
  };

  const getMarginStatus = () => {
    if (analysisData.marginPercentage >= 20) return { icon: CheckCircle, color: 'text-green-600', label: 'Excelente' };
    if (analysisData.marginPercentage >= 10) return { icon: TrendingUp, color: 'text-yellow-600', label: 'Bueno' };
    if (analysisData.marginPercentage >= 0) return { icon: Activity, color: 'text-orange-600', label: 'Ajustado' };
    return { icon: AlertTriangle, color: 'text-red-600', label: 'Pérdidas' };
  };

  const formatMonth = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando análisis financiero...</p>
      </div>
    );
  }

  const projectTypeInfo = getProjectTypeInfo();
  const marginStatus = getMarginStatus();
  const MarginIcon = marginStatus.icon;

  return (
    <div className="space-y-6">
      <Card className="shadow-md border-0">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Análisis Financiero del Proyecto</CardTitle>
                <p className="text-gray-600 mt-1">Análisis con prorrateo por dedicación real a cada obra.</p>
              </div>
              <div className="flex items-center gap-3">
                <FinancialReportPDF project={project} analysisData={analysisData} disabled={isLoading} />
                <Badge className={projectTypeInfo.color}>{projectTypeInfo.label}</Badge>
              </div>
            </div>
            
            {/* Selector de Mes */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-2 min-w-[180px] justify-center">
                  <CalendarIcon className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-lg text-blue-900">
                    {getMonthName(selectedMonth)} {selectedYear}
                  </span>
                </div>
                <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {isCurrentMonthAuthorized ? (
                  <Badge className="bg-green-100 text-green-800 border border-green-300 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Mes Autorizado
                  </Badge>
                ) : (
                  <>
                    <Button 
                      onClick={handleSaveSnapshot}
                      disabled={isSaving || isLoading}
                      variant="outline"
                      className="bg-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Mes
                    </Button>
                    <Button 
                      onClick={handleAuthorizeSnapshot}
                      disabled={isSaving || isLoading || !currentSnapshot}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Autorizar
                    </Button>
                  </>
                )}
              </div>

              {/* Selector rápido de meses guardados */}
              {savedSnapshots.length > 0 && (
                <div className="w-full mt-2">
                  <p className="text-xs text-gray-600 mb-2">Meses guardados:</p>
                  <div className="flex flex-wrap gap-2">
                    {savedSnapshots.map(snap => (
                      <Badge 
                        key={snap.id}
                        className={`cursor-pointer transition-all ${
                          snap.year === selectedYear && snap.month === selectedMonth
                            ? 'bg-blue-600 text-white'
                            : snap.status === 'authorized'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => {
                          setSelectedYear(snap.year);
                          setSelectedMonth(snap.month);
                        }}
                      >
                        {snap.status === 'authorized' && <Lock className="w-3 h-3 mr-1" />}
                        {getMonthName(snap.month).slice(0, 3)} {snap.year}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {isCurrentMonthAuthorized && currentSnapshot && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Datos autorizados por {currentSnapshot.authorized_by}</span>
                  <span className="text-green-600">
                    el {format(new Date(currentSnapshot.authorized_at), "d 'de' MMMM 'de' yyyy", { locale: es })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Panel de Debug */}
          {analysisData.debugInfo && (
            <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
              <h4 className="font-bold text-yellow-900 mb-2">🔍 Información de Debug - {getMonthName(selectedMonth)} {selectedYear}</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                <div><span className="font-semibold">Certificaciones:</span> {analysisData.debugInfo.certificationsFound}</div>
                <div><span className="font-semibold">WorkCalendars:</span> {analysisData.debugInfo.workCalendarsFound}</div>
                <div><span className="font-semibold">Nóminas:</span> {analysisData.debugInfo.salariesFound}</div>
                <div><span className="font-semibold">Empleados:</span> {analysisData.debugInfo.employeesFound}</div>
                <div><span className="font-semibold">Gastos Directos:</span> {analysisData.debugInfo.directExpensesFound}</div>
              </div>
            </div>
          )}
          
          {/* Resumen Principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-900">€{(analysisData.revenue || 0).toLocaleString()}</p>
                  <p className="text-sm text-blue-700">Ingresos Totales</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center gap-3">
                <TrendingDown className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-red-900">€{(analysisData.totalExpenses || 0).toLocaleString()}</p>
                  <p className="text-sm text-red-700">Gastos Totales</p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${(analysisData.margin || 0) >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-3">
                <MarginIcon className={`w-8 h-8 ${marginStatus.color}`} />
                <div>
                  <p className={`text-2xl font-bold ${(analysisData.margin || 0) >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                    €{(analysisData.margin || 0).toLocaleString()}
                  </p>
                  <p className={`text-sm ${(analysisData.margin || 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}>Margen Bruto</p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${(analysisData.marginPercentage || 0) >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-3">
                <DollarSign className={`w-8 h-8 ${marginStatus.color}`} />
                <div>
                  <p className={`text-2xl font-bold ${(analysisData.marginPercentage || 0) >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                    {(analysisData.marginPercentage || 0).toFixed(1)}%
                  </p>
                  <p className={`text-sm ${(analysisData.marginPercentage || 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    Margen (%) - {marginStatus.label}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="breakdown" className="w-full">
            <TabsList>
              <TabsTrigger value="breakdown">Desglose</TabsTrigger>
              <TabsTrigger value="personnel">Personal</TabsTrigger>
              <TabsTrigger value="evolution">Evolución</TabsTrigger>
            </TabsList>

            <TabsContent value="breakdown" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Desglose de Gastos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-600" />
                        <span className="text-purple-700 font-medium">Gastos Directos</span>
                      </div>
                      <span className="text-purple-900 font-bold">€{(analysisData.totalDirectExpenses || 0).toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-700 font-medium">Costes de Personal</span>
                      </div>
                      <span className="text-blue-900 font-bold">€{(analysisData.personnelCosts || 0).toLocaleString()}</span>
                    </div>
                    <div className="pl-6 text-xs space-y-1 text-gray-600">
                      <div className="flex justify-between">
                        <span>• Salarios Proporcionales:</span>
                        <span className="font-semibold">€{(analysisData.salaries || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Horas Extra y Festivas:</span>
                        <span className="font-semibold">€{(analysisData.overtimePay || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Seg. Social Empresa:</span>
                        <span className="font-semibold">€{(analysisData.companySS || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Gastos Variables:</span>
                        <span className="font-semibold">€{(analysisData.variableExpenses || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span className="text-amber-700 font-medium">Gastos Fijos Prorrateados</span>
                      </div>
                      <span className="text-amber-900 font-bold">€{(analysisData.fixedExpensesProrated || 0).toLocaleString()}</span>
                    </div>

                    <div className="pt-3 border-t border-gray-300">
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>TOTAL GASTOS</span>
                        <span className="text-red-600">€{(analysisData.totalExpenses || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Prorrateo de Gastos Fijos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-3">Gastos Fijos de la Empresa</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-700">Total Mensual:</span>
                          <span className="font-bold">€{(analysisData.fixedExpensesDetail?.totalFixedExpenses || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Operarios Activos:</span>
                          <span className="font-bold">{analysisData.fixedExpensesDetail?.totalOperarios || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <h4 className="font-semibold text-amber-900 mb-3">Este Proyecto</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-700">Días del Mes:</span>
                          <span className="font-bold">{analysisData.fixedExpensesDetail?.daysInMonth || 30} días naturales</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Coef. por Operario:</span>
                          <span className="font-bold">€{(analysisData.fixedExpensesDetail?.fixedExpensePerOperario || 0).toFixed(2)}/mes</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Horas Trabajadas:</span>
                          <span className="font-bold">{(analysisData.fixedExpensesDetail?.projectHours || 0).toFixed(1)}h</span>
                        </div>
                        <div className="pt-3 border-t border-amber-300 flex justify-between">
                          <span className="font-bold text-amber-900">Total Prorrateado:</span>
                          <span className="font-bold text-amber-900 text-lg">€{(analysisData.fixedExpensesProrated || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="personnel" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Desglose por Empleado (Proporcional)</CardTitle>
                </CardHeader>
                <CardContent>
                  {analysisData.personnelBreakdown && analysisData.personnelBreakdown.length > 0 ? (
                    <div className="space-y-3">
                      {analysisData.personnelBreakdown.map((emp, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-lg border">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{emp.employee_name}</h4>
                              <p className="text-sm text-gray-600">{emp.position} • {emp.hours_worked.toFixed(1)}h en proyecto</p>
                            </div>
                            <span className="text-lg font-bold text-gray-900">€{(emp.total_cost || 0).toLocaleString()}</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mt-3 text-sm">
                            <div className="bg-blue-50 p-2 rounded">
                              <p className="text-xs text-blue-600">Salario Prop.</p>
                              <p className="font-semibold text-blue-900">€{(emp.proportional_salary || 0).toFixed(0)}</p>
                            </div>
                            <div className="bg-purple-50 p-2 rounded">
                              <p className="text-xs text-purple-600">H. Extra/Fest.</p>
                              <p className="font-semibold text-purple-900">€{(emp.overtime_pay || 0).toFixed(0)}</p>
                              <p className="text-xs text-purple-500">{emp.extra_hours || 0}h + {emp.holiday_hours || 0}h</p>
                            </div>
                            <div className="bg-indigo-50 p-2 rounded">
                              <p className="text-xs text-indigo-600">SS Empresa</p>
                              <p className="font-semibold text-indigo-900">€{(emp.company_ss || 0).toFixed(0)}</p>
                            </div>
                            <div className="bg-green-50 p-2 rounded">
                              <p className="text-xs text-green-600">Gastos Var.</p>
                              <p className="font-semibold text-green-900">€{(emp.variable_expenses || 0).toFixed(0)}</p>
                              {emp.variable_expenses_full > 0 && emp.variable_expenses !== emp.variable_expenses_full && (
                                <p className="text-xs text-green-500">({emp.days_proportion}% de €{emp.variable_expenses_full})</p>
                              )}
                            </div>
                            <div className="bg-amber-50 p-2 rounded">
                              <p className="text-xs text-amber-600">Coef. Empresa</p>
                              <p className="font-semibold text-amber-900">€{(emp.fixed_expenses_prorated || 0).toFixed(0)}</p>
                              {emp.natural_days && <p className="text-xs text-amber-500">{emp.natural_days} días nat.</p>}
                            </div>
                            <div className="bg-red-50 p-2 rounded">
                              <p className="text-xs text-red-600">TOTAL</p>
                              <p className="font-semibold text-red-900">€{(emp.total_cost || 0).toFixed(0)}</p>
                            </div>
                            <div className="bg-cyan-50 p-2 rounded border-2 border-cyan-300">
                              <p className="text-xs text-cyan-600 font-bold">COSTE/HORA</p>
                              <p className="font-bold text-cyan-900">€{(emp.cost_per_hour || 0).toFixed(2)}/h</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="pt-4 border-t border-gray-300">
                        <div className="flex justify-between items-center font-bold text-lg">
                          <span>TOTAL COSTES PERSONAL</span>
                          <span className="text-blue-600">€{((analysisData.personnelCosts || 0) + (analysisData.fixedExpensesProrated || 0)).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>No hay empleados con horas registradas en este proyecto</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="evolution" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Umbral de Rentabilidad Mensual</CardTitle>
                </CardHeader>
                <CardContent>
                  {analysisData.monthlyData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={analysisData.monthlyData} barCategoryGap="20%">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="month" 
                            tickFormatter={formatMonth}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis tickFormatter={(value) => `€${(value/1000).toFixed(0)}k`} />
                          <Tooltip
                            formatter={(value, name) => [
                              `€${value.toLocaleString()}`,
                              name === 'Ingresos' ? 'Ingresos' : 'Gastos (Umbral)'
                            ]}
                            labelFormatter={(label) => formatMonth(label)}
                          />
                          <Legend />
                          <Bar dataKey="revenue" fill="#3B82F6" name="Ingresos" radius={[4, 4, 0, 0]} barSize={40} />
                          <Bar dataKey="expenses" fill="#EF4444" name="Gastos (Umbral)" radius={[4, 4, 0, 0]} barSize={40} opacity={0.3} />
                          {/* Línea de referencia para el umbral de gastos del mes actual */}
                          {analysisData.totalExpenses > 0 && (
                            <ReferenceLine 
                              y={analysisData.totalExpenses} 
                              stroke="#EF4444" 
                              strokeWidth={3}
                              strokeDasharray="8 4"
                              label={{ 
                                value: `Umbral: €${analysisData.totalExpenses.toLocaleString()}`, 
                                position: 'right',
                                fill: '#EF4444',
                                fontWeight: 'bold',
                                fontSize: 12
                              }}
                            />
                          )}
                        </BarChart>
                      </ResponsiveContainer>
                      
                      {/* Leyenda explicativa */}
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-3">📊 Cómo interpretar este gráfico:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-blue-500 rounded flex-shrink-0 mt-0.5"></div>
                            <div>
                              <p className="font-medium text-gray-800">Barras Azules (Ingresos)</p>
                              <p className="text-gray-600">Representan los ingresos certificados cada mes.</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-1 bg-red-500 flex-shrink-0 mt-3" style={{borderStyle: 'dashed', borderWidth: '2px', borderColor: '#EF4444', background: 'transparent'}}></div>
                            <div>
                              <p className="font-medium text-gray-800">Línea Roja (Umbral de Gastos)</p>
                              <p className="text-gray-600">Marca el nivel de gastos totales del mes seleccionado.</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-300">
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200 flex-1">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <span className="text-green-800 font-medium">Si la barra azul supera la línea roja = <strong>BENEFICIO</strong></span>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200 flex-1">
                              <AlertTriangle className="w-5 h-5 text-red-600" />
                              <span className="text-red-800 font-medium">Si la barra azul no alcanza la línea roja = <strong>PÉRDIDA</strong></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay datos suficientes</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}