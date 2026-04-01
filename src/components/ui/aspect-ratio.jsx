import React, { useState, useEffect, useCallback } from 'react';
import { ProjectDirectExpense } from '@/entities/ProjectDirectExpense';
import { EmployeeVariableExpense } from '@/entities/EmployeeVariableExpense';
import { Employee } from '@/entities/Employee';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, FileText, Users, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ProjectExpenses({ project }) {
  const [directExpenses, setDirectExpenses] = useState([]);
  const [variableExpenses, setVariableExpenses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalDirect: 0,
    totalVariable: 0,
    total: 0,
    directCount: 0,
    variableCount: 0
  });

  const loadExpensesData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [directData, variableData, employeesData] = await Promise.all([
        ProjectDirectExpense.filter({ project_id: project.id }),
        EmployeeVariableExpense.filter({ project_id: project.id }),
        Employee.list()
      ]);

      setDirectExpenses(directData);
      setVariableExpenses(variableData);
      setEmployees(employeesData);

      // Calculate summary
      const totalDirect = directData.reduce((sum, exp) => sum + (exp.total_amount || 0), 0);
      const totalVariable = variableData.reduce((sum, exp) => sum + (exp.total_amount || 0), 0);

      setSummary({
        totalDirect,
        totalVariable,
        total: totalDirect + totalVariable,
        directCount: directData.length,
        variableCount: variableData.length
      });

    } catch (error) {
      console.error('Error loading expenses data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [project.id]);

  useEffect(() => {
    loadExpensesData();
  }, [loadExpensesData]);

  // Prepare chart data
  const getChartData = () => {
    const directByCategory = directExpenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.total_amount;
      return acc;
    }, {});

    const variableByType = variableExpenses.reduce((acc, exp) => {
      acc[exp.expense_type] = (acc[exp.expense_type] || 0) + exp.total_amount;
      return acc;
    }, {});

    const chartData = [
      ...Object.entries(directByCategory).map(([key, value]) => ({
        name: getCategoryLabel(key),
        value,
        type: 'Directo'
      })),
      ...Object.entries(variableByType).map(([key, value]) => ({
        name: getTypeLabel(key),
        value,
        type: 'Variable'
      }))
    ];

    return chartData.sort((a, b) => b.value - a.value);
  };

  const getCategoryLabel = (category) => {
    const labels = {
      materials: "Materiales",
      subcontracting: "Subcontratación",
      equipment: "Equipamiento",
      licenses: "Licencias",
      other: "Otros"
    };
    return labels[category] || category;
  };

  const getTypeLabel = (type) => {
    const labels = {
      travel: "Viajes",
      meals: "Comidas",
      fuel: "Combustible",
      accommodation: "Alojamiento",
      other: "Otros"
    };
    return labels[type] || type;
  };

  // Agrupar gastos variables por mes
  const getVariableExpensesByMonth = () => {
    const byMonth = {};
    
    variableExpenses.forEach(exp => {
      const date = new Date(exp.expense_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!byMonth[monthKey]) {
        byMonth[monthKey] = {
          month: monthKey,
          monthName: format(date, 'MMMM yyyy', { locale: es }),
          expenses: [],
          total: 0,
          byEmployee: {}
        };
      }
      
      byMonth[monthKey].expenses.push(exp);
      byMonth[monthKey].total += exp.total_amount || 0;
      
      // Agrupar por empleado dentro del mes
      const empId = exp.employee_id;
      if (!byMonth[monthKey].byEmployee[empId]) {
        const employee = employees.find(e => e.id === empId);
        byMonth[monthKey].byEmployee[empId] = {
          employee_name: employee ? `${employee.first_name} ${employee.last_name}` : 'Desconocido',
          expenses: [],
          total: 0
        };
      }
      byMonth[monthKey].byEmployee[empId].expenses.push(exp);
      byMonth[monthKey].byEmployee[empId].total += exp.total_amount || 0;
    });
    
    // Convertir a array y ordenar por mes (más reciente primero)
    return Object.values(byMonth).sort((a, b) => b.month.localeCompare(a.month));
  };

  const pieColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  const pieData = [
    { name: 'Gastos Directos', value: summary.totalDirect, color: '#3B82F6' },
    { name: 'Gastos Variables', value: summary.totalVariable, color: '#10B981' }
  ];

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando resumen de gastos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-md border-0">
        <CardHeader>
          <CardTitle>Resumen de Gastos del Proyecto</CardTitle>
          <p className="text-gray-600">Análisis completo de todos los gastos directos y variables del proyecto.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-900">€{summary.total.toLocaleString()}</p>
                  <p className="text-sm text-blue-700">Total General</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-900">€{summary.totalDirect.toLocaleString()}</p>
                  <p className="text-sm text-purple-700">Gastos Directos ({summary.directCount})</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-900">€{summary.totalVariable.toLocaleString()}</p>
                  <p className="text-sm text-green-700">Gastos Variables ({summary.variableCount})</p>
                </div>
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-lg font-bold text-orange-900">
                    {summary.total > 0 ? `${Math.round((summary.totalDirect/summary.total)*100)}%` : '0%'}
                  </p>
                  <p className="text-sm text-orange-700">Gastos Directos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Resumen General</TabsTrigger>
              <TabsTrigger value="breakdown">Desglose por Categoría</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Distribución de Gastos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `€${value.toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Comparativa</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Gastos Directos</span>
                        <Badge className="bg-blue-100 text-blue-800">€{summary.totalDirect.toLocaleString()}</Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${summary.total > 0 ? (summary.totalDirect/summary.total)*100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Gastos Variables</span>
                        <Badge className="bg-green-100 text-green-800">€{summary.totalVariable.toLocaleString()}</Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${summary.total > 0 ? (summary.totalVariable/summary.total)*100 : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total General</span>
                        <Badge className="bg-gray-800 text-white">€{summary.total.toLocaleString()}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="breakdown" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Desglose por Categorías</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getChartData().length > 0 ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={getChartData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="name" 
                            angle={-45}
                            textAnchor="end"
                            height={100}
                          />
                          <YAxis tickFormatter={(value) => `€${value.toLocaleString()}`} />
                          <Tooltip 
                            formatter={(value, name, props) => [
                              `€${value.toLocaleString()}`, 
                              `${props.payload.name} (${props.payload.type})`
                            ]}
                          />
                          <Bar 
                            dataKey="value" 
                            fill="#3B82F6"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No hay datos suficientes para mostrar el gráfico</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Gastos Variables por Mes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getVariableExpensesByMonth().length > 0 ? (
                      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                        {getVariableExpensesByMonth().map(monthData => (
                          <div key={monthData.month} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-semibold text-gray-900 capitalize">{monthData.monthName}</h4>
                              <Badge className="bg-green-600 text-white">€{monthData.total.toLocaleString()}</Badge>
                            </div>
                            <div className="space-y-2 pl-4">
                              {Object.values(monthData.byEmployee).map((empData, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm">
                                  <span className="text-gray-700">{empData.employee_name}</span>
                                  <span className="font-medium text-gray-900">€{empData.total.toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No hay gastos variables registrados</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}