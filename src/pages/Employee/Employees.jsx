
import React, { useState, useEffect, useCallback } from 'react';
import { EmployeeVariableExpense } from '@/entities/EmployeeVariableExpense';
import { Project } from '@/entities/Project';
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
import { Plus, Edit, Trash2, Euro, Filter, Info, Car, UtensilsCrossed, Fuel, Bed } from 'lucide-react';
import { format } from "date-fns";
import { es } from "date-fns/locale";

import VariableExpenseForm from '../VariableExpenseForm';

export default function VariableExpensesTab({ employee }) {
  const [expenses, setExpenses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [stats, setStats] = useState({
    travel: 0,
    meals: 0,
    fuel: 0,
    accommodation: 0,
    other: 0,
    total: 0
  });

  const calculateStats = useCallback((expensesData) => {
    const statsCalc = {
      travel: 0,
      meals: 0,
      fuel: 0,
      accommodation: 0,
      other: 0,
      total: 0
    };

    expensesData.forEach(expense => {
      const amount = expense.total_amount || 0;
      statsCalc[expense.expense_type] += amount;
      statsCalc.total += amount;
    });

    setStats(statsCalc);
  }, []); // setStats is stable, so no dependencies are needed here

  const loadData = useCallback(async () => {
    try {
      const [expensesData, projectsData] = await Promise.all([
        EmployeeVariableExpense.filter({ employee_id: employee.id }, '-expense_date'),
        Project.list()
      ]);
      
      setExpenses(expensesData);
      setProjects(projectsData);
      calculateStats(expensesData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading expenses:', error);
      setIsLoading(false);
    }
  }, [employee.id, calculateStats]); // employee.id and calculateStats are dependencies

  const filterExpenses = useCallback(() => {
    let filtered = expenses;
    
    if (typeFilter !== "all") {
      filtered = expenses.filter(expense => expense.expense_type === typeFilter);
    }

    setFilteredExpenses(filtered);
  }, [expenses, typeFilter]); // expenses and typeFilter are dependencies

  useEffect(() => {
    loadData();
  }, [loadData]); // loadData is now a useCallback and its dependencies are handled within it

  useEffect(() => {
    filterExpenses();
  }, [filterExpenses]); // filterExpenses is now a useCallback and its dependencies are handled within it

  const handleSubmit = async (expenseData) => {
    try {
      const dataWithEmployee = { ...expenseData, employee_id: employee.id };
      
      // Calculate IVA if not provided
      if (dataWithEmployee.amount && dataWithEmployee.iva_rate) {
        dataWithEmployee.iva_amount = (dataWithEmployee.amount * dataWithEmployee.iva_rate) / 100;
        dataWithEmployee.total_amount = dataWithEmployee.amount + dataWithEmployee.iva_amount;
      }
      
      if (editingExpense) {
        await EmployeeVariableExpense.update(editingExpense.id, dataWithEmployee);
      } else {
        await EmployeeVariableExpense.create(dataWithEmployee);
      }
      
      setShowForm(false);
      setEditingExpense(null);
      loadData();
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const handleDelete = async (expense) => {
    if (confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
      try {
        await EmployeeVariableExpense.delete(expense.id);
        loadData();
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const getExpenseTypeIcon = (type) => {
    const icons = {
      travel: Car,
      meals: UtensilsCrossed,
      fuel: Fuel,
      accommodation: Bed,
      other: Euro
    };
    return icons[type] || Euro;
  };

  const getExpenseTypeBadge = (type) => {
    const variants = {
      travel: "bg-blue-100 text-blue-800 border-blue-200",
      meals: "bg-green-100 text-green-800 border-green-200",
      fuel: "bg-red-100 text-red-800 border-red-200",
      accommodation: "bg-purple-100 text-purple-800 border-purple-200",
      other: "bg-gray-100 text-gray-800 border-gray-200"
    };

    const labels = {
      travel: "Viajes",
      meals: "Dietas",
      fuel: "Combustible",
      accommodation: "Alojamiento",
      other: "Otros"
    };

    const Icon = getExpenseTypeIcon(type);

    return (
      <Badge className={`${variants[type]} border flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {labels[type]}
      </Badge>
    );
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Sin asignar';
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-md border-0">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gestión de Gastos Variables de {employee.first_name}</CardTitle>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Gasto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-4">
                <div className="text-center">
                  <Car className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs font-medium text-blue-600">Viajes</p>
                  <p className="text-lg font-bold text-blue-900">€{stats.travel.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-4">
                <div className="text-center">
                  <UtensilsCrossed className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-xs font-medium text-green-600">Dietas</p>
                  <p className="text-lg font-bold text-green-900">€{stats.meals.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100">
              <CardContent className="p-4">
                <div className="text-center">
                  <Fuel className="w-6 h-6 text-red-600 mx-auto mb-1" />
                  <p className="text-xs font-medium text-red-600">Combustible</p>
                  <p className="text-lg font-bold text-red-900">€{stats.fuel.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-4">
                <div className="text-center">
                  <Bed className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                  <p className="text-xs font-medium text-purple-600">Alojamiento</p>
                  <p className="text-lg font-bold text-purple-900">€{stats.accommodation.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
              <CardContent className="p-4">
                <div className="text-center">
                  <Euro className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                  <p className="text-xs font-medium text-gray-600">Otros</p>
                  <p className="text-lg font-bold text-gray-900">€{stats.other.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100">
              <CardContent className="p-4">
                <div className="text-center">
                  <Euro className="w-6 h-6 text-indigo-600 mx-auto mb-1" />
                  <p className="text-xs font-medium text-indigo-600">Total</p>
                  <p className="text-lg font-bold text-indigo-900">€{stats.total.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-4 mb-6">
            <Filter className="w-4 h-4 text-gray-400" />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="travel">Viajes</SelectItem>
                <SelectItem value="meals">Dietas</SelectItem>
                <SelectItem value="fuel">Combustible</SelectItem>
                <SelectItem value="accommodation">Alojamiento</SelectItem>
                <SelectItem value="other">Otros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Info Alert */}
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Los gastos variables se asignan automáticamente a proyectos según la fecha y se suman al coste total del empleado para ese proyecto.
            </AlertDescription>
          </Alert>

          {/* Expenses Table */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando gastos...</p>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-12">
              <Euro className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {expenses.length === 0 ? "No hay gastos registrados" : "No se encontraron gastos"}
              </h3>
              <p className="text-gray-600 mb-6">
                {expenses.length === 0 
                  ? "Este empleado no tiene gastos variables registrados"
                  : "Intenta cambiar los filtros de búsqueda"
                }
              </p>
              {expenses.length === 0 && (
                <Button 
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Primer Gasto
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Importe</TableHead>
                  <TableHead>Proyecto</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">
                      {format(new Date(expense.expense_date), "d 'de' MMM, yyyy", { locale: es })}
                    </TableCell>
                    <TableCell>
                      {getExpenseTypeBadge(expense.expense_type)}
                    </TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>
                      <div>
                        <span className="font-bold text-green-600">
                          €{expense.total_amount.toLocaleString()}
                        </span>
                        {expense.iva_amount > 0 && (
                          <p className="text-xs text-gray-500">
                            (Base: €{expense.amount.toFixed(2)} + IVA: €{expense.iva_amount.toFixed(2)})
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {getProjectName(expense.project_id)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingExpense(expense);
                            setShowForm(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(expense)}
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

      {/* Expense Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <VariableExpenseForm
              expense={editingExpense}
              projects={projects}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingExpense(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
