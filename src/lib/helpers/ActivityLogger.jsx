import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  RefreshCw, Save, TrendingUp, AlertCircle, CheckCircle, 
  DollarSign, Users, Calendar, FileText
} from 'lucide-react';
import { format } from 'date-fns';

export default function FinancialPlanGeneratorTab() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculatedPlan, setCalculatedPlan] = useState(null);
  const [existingPlans, setExistingPlans] = useState([]);
  const [calculationLog, setCalculationLog] = useState([]);

  useEffect(() => {
    loadExistingPlans();
  }, []);

  const loadExistingPlans = async () => {
    try {
      const plans = await base44.entities.FinancialPlan.list('-year');
      setExistingPlans(plans);
    } catch (error) {
      console.error('Error loading financial plans:', error);
    }
  };

  const addLog = (message, type = 'info') => {
    setCalculationLog(prev => [...prev, { message, type, timestamp: new Date() }]);
  };

  const calculateFinancialPlan = async () => {
    setIsCalculating(true);
    setCalculationLog([]);
    addLog('🚀 Iniciando cálculo del plan financiero...', 'info');

    try {
      // 1. Cargar datos de certificaciones (ingresos)
      addLog('📊 Cargando certificaciones del año...', 'info');
      const certifications = await base44.entities.ProjectCertification.list();
      const yearCertifications = certifications.filter(cert => cert.year === selectedYear);
      
      const totalSales = yearCertifications.reduce((sum, cert) => sum + (cert.total_amount || 0), 0);
      addLog(`✅ Ingresos totales: €${totalSales.toLocaleString()}`, 'success');

      // Ventas mensuales
      const monthlySales = Array(12).fill(0);
      yearCertifications.forEach(cert => {
        if (cert.month >= 1 && cert.month <= 12) {
          monthlySales[cert.month - 1] += cert.total_amount || 0;
        }
      });

      // 2. Cargar gastos directos
      addLog('💸 Cargando gastos directos de proyectos...', 'info');
      const directExpenses = await base44.entities.ProjectDirectExpense.list();
      const yearDirectExpenses = directExpenses.filter(exp => {
        const expenseYear = new Date(exp.expense_date).getFullYear();
        return expenseYear === selectedYear;
      });
      const totalDirectExpenses = yearDirectExpenses.reduce((sum, exp) => sum + (exp.total_amount || 0), 0);
      addLog(`✅ Gastos directos: €${totalDirectExpenses.toLocaleString()}`, 'success');

      // 3. Cargar gastos variables de empleados
      addLog('👤 Cargando gastos variables de empleados...', 'info');
      const variableExpenses = await base44.entities.EmployeeVariableExpense.list();
      const yearVariableExpenses = variableExpenses.filter(exp => {
        const expenseYear = new Date(exp.expense_date).getFullYear();
        return expenseYear === selectedYear;
      });
      const totalVariableExpenses = yearVariableExpenses.reduce((sum, exp) => sum + (exp.total_amount || 0), 0);
      addLog(`✅ Gastos variables: €${totalVariableExpenses.toLocaleString()}`, 'success');

      const totalVariableCosts = totalDirectExpenses + totalVariableExpenses;

      // 4. Cargar salarios (costes de personal)
      addLog('💼 Cargando costes de personal...', 'info');
      const salaries = await base44.entities.EmployeeSalary.list();
      const yearSalaries = salaries.filter(sal => sal.year === selectedYear);
      const totalPersonnelCosts = yearSalaries.reduce((sum, sal) => sum + (sal.total_company_cost || 0), 0);
      addLog(`✅ Costes de personal: €${totalPersonnelCosts.toLocaleString()}`, 'success');

      // 5. Cargar gastos fijos
      addLog('🏢 Cargando gastos fijos...', 'info');
      const fixedExpenses = await base44.entities.FixedExpense.list();
      const monthlyFixedExpenses = fixedExpenses.reduce((sum, exp) => sum + (exp.total_amount || 0), 0);
      const totalFixedCosts = monthlyFixedExpenses * 12;
      addLog(`✅ Gastos fijos anuales: €${totalFixedCosts.toLocaleString()}`, 'success');

      // 6. Cargar empleados
      addLog('👥 Cargando información de empleados...', 'info');
      const employees = await base44.entities.Employee.list();
      const activeEmployees = employees.filter(emp => emp.status === 'active');
      addLog(`✅ Empleados activos: ${activeEmployees.length}`, 'success');

      // 7. Calcular deuda desde PaymentDue
      addLog('💳 Calculando deuda desde pagos pendientes...', 'info');
      const paymentsDue = await base44.entities.PaymentDue.list();
      const pendingPayments = paymentsDue.filter(p => p.status === 'pending' || p.status === 'overdue');
      
      const shortTermDebt = pendingPayments
        .filter(p => {
          const dueDate = new Date(p.due_date);
          const monthsUntilDue = (dueDate - new Date()) / (1000 * 60 * 60 * 24 * 30);
          return monthsUntilDue <= 12;
        })
        .reduce((sum, p) => sum + (p.total_amount || 0), 0);

      const longTermDebt = pendingPayments
        .filter(p => {
          const dueDate = new Date(p.due_date);
          const monthsUntilDue = (dueDate - new Date()) / (1000 * 60 * 60 * 24 * 30);
          return monthsUntilDue > 12;
        })
        .reduce((sum, p) => sum + (p.total_amount || 0), 0);

      // Calcular días medios de pago
      const paidPayments = paymentsDue.filter(p => p.status === 'paid' && p.payment_date && p.invoice_date);
      let averagePaymentDays = 0;
      if (paidPayments.length > 0) {
        const totalDays = paidPayments.reduce((sum, p) => {
          const invoiceDate = new Date(p.invoice_date);
          const paymentDate = new Date(p.payment_date);
          const days = Math.floor((paymentDate - invoiceDate) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0);
        averagePaymentDays = Math.round(totalDays / paidPayments.length);
      }

      addLog(`✅ Deuda corto plazo: €${shortTermDebt.toLocaleString()}`, 'success');
      addLog(`✅ Deuda largo plazo: €${longTermDebt.toLocaleString()}`, 'success');

      // 8. Cálculos financieros
      addLog('🧮 Calculando métricas financieras...', 'info');
      
      const grossMargin = totalSales - totalVariableCosts;
      const ebitda = grossMargin - totalFixedCosts - totalPersonnelCosts;
      const interestExpenses = (shortTermDebt + longTermDebt) * 0.05; // Estimado al 5%
      const netProfit = ebitda - interestExpenses;
      const cashFlow = netProfit + (totalFixedCosts * 0.1); // Estimado: 10% de gastos fijos son amortizaciones

      const financialDebt = shortTermDebt + longTermDebt;
      const equity = netProfit * 5; // Estimado: beneficios acumulados
      const debtToEquityRatio = equity > 0 ? financialDebt / equity : 0;
      const debtServiceCoverageRatio = (interestExpenses + shortTermDebt * 0.1) > 0 
        ? ebitda / (interestExpenses + shortTermDebt * 0.1) 
        : 0;

      const breakEvenPoint = totalFixedCosts + totalPersonnelCosts + totalVariableCosts;
      const safetyCoefficient = totalSales > 0 ? totalSales / breakEvenPoint : 0;

      // Costes mensuales (estimado proporcionalmente)
      const monthlyCosts = monthlySales.map(sales => (sales / totalSales) * totalVariableCosts);
      const monthlyMargins = monthlySales.map((sales, idx) => sales - monthlyCosts[idx]);

      const plan = {
        year: selectedYear,
        company_name: 'OMENAR SOLUTIONS SL',
        plan_date: format(new Date(), 'yyyy-MM-dd'),
        tax_rate: 25,
        iva_rate: 21,
        total_sales: Math.round(totalSales),
        total_variable_costs: Math.round(totalVariableCosts),
        total_personnel_costs: Math.round(totalPersonnelCosts),
        total_fixed_costs: Math.round(totalFixedCosts),
        gross_margin: Math.round(grossMargin),
        ebitda: Math.round(ebitda),
        net_profit: Math.round(netProfit),
        cash_flow: Math.round(cashFlow),
        total_assets: Math.round(totalSales * 0.55), // Estimado
        equity: Math.round(equity),
        short_term_debt: Math.round(shortTermDebt),
        long_term_debt: Math.round(longTermDebt),
        financial_debt: Math.round(financialDebt),
        interest_expenses: Math.round(interestExpenses),
        debt_to_equity_ratio: Math.round(debtToEquityRatio * 100) / 100,
        debt_service_coverage_ratio: Math.round(debtServiceCoverageRatio * 100) / 100,
        average_payment_days_suppliers: averagePaymentDays,
        working_capital: Math.round(equity * 0.9), // Estimado
        employees_count: activeEmployees.length,
        monthly_sales: monthlySales.map(v => Math.round(v)),
        monthly_costs: monthlyCosts.map(v => Math.round(v)),
        monthly_margins: monthlyMargins.map(v => Math.round(v)),
        break_even_point: Math.round(breakEvenPoint),
        safety_coefficient: Math.round(safetyCoefficient * 100) / 100,
        calculation_metadata: {
          calculation_date: new Date().toISOString(),
          certifications_processed: yearCertifications.length,
          direct_expenses_processed: yearDirectExpenses.length,
          variable_expenses_processed: yearVariableExpenses.length,
          salaries_processed: yearSalaries.length
        },
        status: 'draft'
      };

      setCalculatedPlan(plan);
      addLog('✅ ¡Plan financiero calculado correctamente!', 'success');
    } catch (error) {
      console.error('Error calculating financial plan:', error);
      addLog(`❌ Error: ${error.message}`, 'error');
    } finally {
      setIsCalculating(false);
    }
  };

  const savePlan = async () => {
    if (!calculatedPlan) return;
    
    try {
      addLog('💾 Guardando plan financiero...', 'info');
      
      // Verificar si ya existe un plan para este año
      const existingPlan = existingPlans.find(p => p.year === selectedYear);
      
      if (existingPlan) {
        await base44.entities.FinancialPlan.update(existingPlan.id, calculatedPlan);
        addLog('✅ Plan financiero actualizado correctamente', 'success');
      } else {
        await base44.entities.FinancialPlan.create(calculatedPlan);
        addLog('✅ Plan financiero guardado correctamente', 'success');
      }
      
      await loadExistingPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
      addLog(`❌ Error al guardar: ${error.message}`, 'error');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.draft;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-md border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <RefreshCw className="w-6 h-6 text-blue-600" />
            Generador Automático de Plan Financiero
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Genera automáticamente el plan financiero anual desde los datos reales del sistema: 
            certificaciones, gastos, salarios, gastos fijos y deuda.
          </p>
        </CardHeader>
      </Card>

      {/* Selector de año y acciones */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Año del Plan Financiero
              </label>
              <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={calculateFinancialPlan} 
                disabled={isCalculating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isCalculating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Calculando...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Calcular Plan {selectedYear}
                  </>
                )}
              </Button>

              {calculatedPlan && (
                <Button onClick={savePlan} className="bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Plan
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log de cálculo */}
      {calculationLog.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Log de Cálculo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm max-h-60 overflow-y-auto">
              {calculationLog.map((log, idx) => (
                <div key={idx} className={`mb-1 ${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : 'text-gray-300'}`}>
                  {log.message}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumen del plan calculado */}
      {calculatedPlan && (
        <Card className="shadow-md border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Plan Financiero {selectedYear} - Calculado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Ingresos Totales</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">€{calculatedPlan.total_sales.toLocaleString()}</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">EBITDA</span>
                </div>
                <p className="text-2xl font-bold text-green-900">€{calculatedPlan.ebitda.toLocaleString()}</p>
                <p className="text-xs text-green-700">{((calculatedPlan.ebitda / calculatedPlan.total_sales) * 100).toFixed(1)}% s/ventas</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Beneficio Neto</span>
                </div>
                <p className="text-2xl font-bold text-purple-900">€{calculatedPlan.net_profit.toLocaleString()}</p>
                <p className="text-xs text-purple-700">{((calculatedPlan.net_profit / calculatedPlan.total_sales) * 100).toFixed(1)}% s/ventas</p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">Empleados</span>
                </div>
                <p className="text-2xl font-bold text-orange-900">{calculatedPlan.employees_count}</p>
                <p className="text-xs text-orange-700">€{Math.round(calculatedPlan.total_sales / calculatedPlan.employees_count).toLocaleString()}/empleado</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Desglose de Costes</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Costes Variables:</span>
                    <span className="font-bold">€{calculatedPlan.total_variable_costs.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Costes Personal:</span>
                    <span className="font-bold">€{calculatedPlan.total_personnel_costs.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gastos Fijos:</span>
                    <span className="font-bold">€{calculatedPlan.total_fixed_costs.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-red-800">Análisis de Deuda</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Deuda C.P.:</span>
                    <span className="font-bold">€{calculatedPlan.short_term_debt.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deuda L.P.:</span>
                    <span className="font-bold">€{calculatedPlan.long_term_debt.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ratio Deuda/Patrimonio:</span>
                    <span className="font-bold">{calculatedPlan.debt_to_equity_ratio.toFixed(2)}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Días medio pago:</span>
                    <span className="font-bold">{calculatedPlan.average_payment_days_suppliers} días</span>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${calculatedPlan.safety_coefficient >= 1.2 ? 'bg-green-50' : calculatedPlan.safety_coefficient >= 1.1 ? 'bg-yellow-50' : 'bg-red-50'}`}>
                <h4 className="font-semibold mb-2">Coeficiente de Seguridad</h4>
                <p className="text-3xl font-bold mb-2">{calculatedPlan.safety_coefficient.toFixed(2)}</p>
                <p className="text-xs">
                  {calculatedPlan.safety_coefficient >= 1.2 ? '✅ Saludable' : 
                   calculatedPlan.safety_coefficient >= 1.1 ? '⚠️ Ajustado' : 
                   '❌ Crítico'}
                </p>
                <p className="text-xs mt-1">Punto equilibrio: €{calculatedPlan.break_even_point.toLocaleString()}</p>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Metadatos del Cálculo</AlertTitle>
              <AlertDescription>
                <div className="text-sm space-y-1 mt-2">
                  <div>📅 Fecha de cálculo: {format(new Date(calculatedPlan.calculation_metadata.calculation_date), 'dd/MM/yyyy HH:mm')}</div>
                  <div>📊 Certificaciones procesadas: {calculatedPlan.calculation_metadata.certifications_processed}</div>
                  <div>💸 Gastos directos procesados: {calculatedPlan.calculation_metadata.direct_expenses_processed}</div>
                  <div>👤 Gastos variables procesados: {calculatedPlan.calculation_metadata.variable_expenses_processed}</div>
                  <div>💼 Salarios procesados: {calculatedPlan.calculation_metadata.salaries_processed}</div>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Planes existentes */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Planes Financieros Guardados</CardTitle>
        </CardHeader>
        <CardContent>
          {existingPlans.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay planes financieros guardados todavía</p>
          ) : (
            <div className="space-y-3">
              {existingPlans.map(plan => (
                <div key={plan.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                    <div>
                      <div className="font-semibold text-lg">Plan Financiero {plan.year}</div>
                      <div className="text-sm text-gray-600">
                        Creado: {format(new Date(plan.created_date), 'dd/MM/yyyy')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Ventas</div>
                      <div className="font-bold">€{plan.total_sales.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">EBITDA</div>
                      <div className="font-bold">€{plan.ebitda.toLocaleString()}</div>
                    </div>
                    <Badge className={getStatusColor(plan.status)}>
                      {plan.status === 'draft' ? 'Borrador' : plan.status === 'approved' ? 'Aprobado' : 'Archivado'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}