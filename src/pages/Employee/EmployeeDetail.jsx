
import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Euro, Calendar, TrendingUp, TrendingDown, Info } from 'lucide-react';

import SalaryForm from '../SalaryForm';

export default function SalariesTab({ employee }) {
  const [salaries, setSalaries] = useState([]);
  const [filteredSalaries, setFilteredSalaries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSalary, setEditingSalary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState('all');
  const [stats, setStats] = useState({
    totalPaid: 0,
    totalCompanyCost: 0,
    avgNetSalary: 0,
    avgCompanyCost: 0,
    count: 0
  });

  const loadSalaries = useCallback(async () => {
    try {
      const data = await base44.entities.EmployeeSalary.filter({ employee_id: employee.id }, '-created_date');
      
      // Sort manually by year and month descending
      const sortedData = data.sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year;
        return b.month - a.month;
      });
      
      setSalaries(sortedData);
      
      // Calculate stats
      const totalPaid = sortedData.reduce((sum, sal) => sum + (sal.final_payment || 0), 0);
      const totalCompanyCost = sortedData.reduce((sum, sal) => sum + (sal.total_company_cost || 0), 0);
      const count = sortedData.length;
      
      setStats({
        totalPaid,
        totalCompanyCost,
        avgNetSalary: count > 0 ? totalPaid / count : 0,
        avgCompanyCost: count > 0 ? totalCompanyCost / count : 0,
        count
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading salaries:', error);
      setIsLoading(false);
    }
  }, [employee.id]);

  const filterSalaries = useCallback(() => {
    let filtered = salaries;
    
    if (yearFilter !== "all") {
      filtered = salaries.filter(sal => sal.year === parseInt(yearFilter));
    }

    setFilteredSalaries(filtered);
  }, [salaries, yearFilter]);

  useEffect(() => {
    loadSalaries();
  }, [loadSalaries]);

  useEffect(() => {
    filterSalaries();
  }, [filterSalaries]);

  const handleSubmit = async (salaryData) => {
    try {
      if (editingSalary) {
        await base44.entities.EmployeeSalary.update(editingSalary.id, salaryData);
      } else {
        await base44.entities.EmployeeSalary.create(salaryData);
      }
      
      setShowForm(false);
      setEditingSalary(null);
      loadSalaries();
    } catch (error) {
      console.error('Error saving salary:', error);
      alert('Error al guardar la nómina. Por favor, inténtalo de nuevo.');
    }
  };

  const handleDelete = async (salary) => {
    if (confirm(`¿Estás seguro de que quieres eliminar la nómina de ${getMonthName(salary.month)} ${salary.year}?`)) {
      try {
        await base44.entities.EmployeeSalary.delete(salary.id);
        loadSalaries();
      } catch (error) {
        console.error('Error deleting salary:', error);
        alert('Error al eliminar la nómina.');
      }
    }
  };

  const getMonthName = (monthNum) => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[monthNum - 1] || `Mes ${monthNum}`;
  };

  const years = [...new Set(salaries.map(sal => sal.year))].sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      <Card className="shadow-md border-0">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gestión de Nóminas de {employee.first_name}</CardTitle>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Nómina
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Total Pagado</p>
                    <p className="text-2xl font-bold text-green-900">€{stats.totalPaid.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">Coste Empresa</p>
                    <p className="text-2xl font-bold text-red-900">€{stats.totalCompanyCost.toLocaleString()}</p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Promedio Neto</p>
                    <p className="text-2xl font-bold text-blue-900">€{stats.avgNetSalary.toFixed(0)}</p>
                  </div>
                  <Euro className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Nóminas</p>
                    <p className="text-2xl font-bold text-purple-900">{stats.count}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-4 mb-6">
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por año" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los años</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Info Alert */}
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Las nóminas se calculan automáticamente basándose en el calendario laboral, horas extra/festivas, adelantos y gastos variables del mes.
            </AlertDescription>
          </Alert>

          {/* Salaries Table */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando nóminas...</p>
            </div>
          ) : filteredSalaries.length === 0 ? (
            <div className="text-center py-12">
              <Euro className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {salaries.length === 0 ? "No hay nóminas registradas" : "No se encontraron nóminas"}
              </h3>
              <p className="text-gray-600 mb-6">
                {salaries.length === 0 
                  ? "Este empleado no tiene nóminas registradas"
                  : "Intenta cambiar los filtros de búsqueda"
                }
              </p>
              {salaries.length === 0 && (
                <Button 
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Primera Nómina
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead>Salario Bruto</TableHead>
                  <TableHead>Horas Extra</TableHead>
                  <TableHead>Adelantos</TableHead>
                  <TableHead>Salario Neto</TableHead>
                  <TableHead>Pago Final</TableHead>
                  <TableHead>Coste Empresa</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSalaries.map((salary) => (
                  <TableRow key={salary.id}>
                    <TableCell className="font-medium">
                      {getMonthName(salary.month)} {salary.year}
                      {!salary.calendar_found && (
                        <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-700 border-yellow-300">
                          Sin calendario
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>€{salary.gross_salary.toLocaleString()}</TableCell>
                    <TableCell>
                      {salary.extra_hours > 0 || salary.holiday_hours > 0 ? (
                        <div className="text-sm">
                          <div>Extra: {salary.extra_hours}h (€{salary.extra_amount.toFixed(0)})</div>
                          <div className="text-gray-500">Fest.: {salary.holiday_hours}h (€{salary.holiday_amount.toFixed(0)})</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {salary.advances_amount > 0 ? (
                        <span className="text-red-600 font-semibold">-€{salary.advances_amount.toLocaleString()}</span>
                      ) : (
                        <span className="text-gray-400">€0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-green-600">
                        €{salary.net_salary.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-blue-600">
                        €{salary.final_payment.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-red-600">
                        €{salary.total_company_cost.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingSalary(salary);
                            setShowForm(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(salary)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Salary Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <SalaryForm
              salary={editingSalary}
              employee={employee}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingSalary(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
