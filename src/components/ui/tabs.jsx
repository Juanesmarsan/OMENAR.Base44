import React, { useState, useEffect, useCallback } from 'react';
import { ProjectDirectExpense } from '@/entities/ProjectDirectExpense';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, DollarSign, Edit, Trash2, FileText, Calendar, Receipt } from 'lucide-react';
import { format } from "date-fns";
import { es } from "date-fns/locale";

import DirectExpenseForm from './DirectExpenseForm';

export default function ProjectDirectExpenses({ project }) {
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, totalAmount: 0, byCategory: {} });

  const loadExpenses = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await ProjectDirectExpense.filter({ project_id: project.id }, '-expense_date');
      setExpenses(data);

      // Calculate stats
      const totalAmount = data.reduce((sum, exp) => sum + (exp.total_amount || 0), 0);
      const byCategory = data.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + (exp.total_amount || 0);
        return acc;
      }, {});

      setStats({
        total: data.length,
        totalAmount,
        byCategory
      });

    } catch (error) {
      console.error('Error loading direct expenses:', error);
    } finally {
      setIsLoading(false);
    }
  }, [project.id]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const handleSubmit = async (expenseData) => {
    try {
      const dataWithProject = { ...expenseData, project_id: project.id };
      
      // Calculate IVA and total if not provided
      if (dataWithProject.amount && dataWithProject.iva_rate) {
        dataWithProject.iva_amount = (dataWithProject.amount * dataWithProject.iva_rate) / 100;
        dataWithProject.total_amount = dataWithProject.amount + dataWithProject.iva_amount;
      }
      
      if (editingExpense) {
        await ProjectDirectExpense.update(editingExpense.id, dataWithProject);
      } else {
        await ProjectDirectExpense.create(dataWithProject);
      }
      
      setShowForm(false);
      setEditingExpense(null);
      loadExpenses();
    } catch (error) {
      console.error('Error saving direct expense:', error);
    }
  };

  const handleDelete = async (expense) => {
    if (confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
      try {
        await ProjectDirectExpense.delete(expense.id);
        loadExpenses();
      } catch (error) {
        console.error('Error deleting direct expense:', error);
      }
    }
  };

  const getCategoryBadge = (category) => {
    const variants = {
      materials: "bg-blue-100 text-blue-800",
      subcontracting: "bg-purple-100 text-purple-800",
      equipment: "bg-green-100 text-green-800",
      licenses: "bg-yellow-100 text-yellow-800",
      other: "bg-gray-100 text-gray-800"
    };
    
    const labels = {
      materials: "Materiales",
      subcontracting: "Subcontratación",
      equipment: "Equipamiento",
      licenses: "Licencias",
      other: "Otros"
    };

    return <Badge className={`${variants[category]} text-xs`}>{labels[category]}</Badge>;
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = !searchTerm || 
      expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <Card className="shadow-md border-0">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Gastos Directos del Proyecto</CardTitle>
              <p className="text-gray-600 mt-1">Registra y gestiona todos los gastos directos asociados al proyecto.</p>
            </div>
            <Button onClick={() => { setEditingExpense(null); setShowForm(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Nuevo Gasto
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-900">€{stats.totalAmount.toLocaleString()}</p>
                  <p className="text-sm text-blue-700">Total Gastos</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-900">{stats.total}</p>
                  <p className="text-sm text-green-700">Total Registros</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3">
                <Receipt className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-lg font-bold text-purple-900">€{(stats.byCategory.materials || 0).toLocaleString()}</p>
                  <p className="text-sm text-purple-700">Materiales</p>
                </div>
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center gap-3">
                <Receipt className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-lg font-bold text-orange-900">€{(stats.byCategory.subcontracting || 0).toLocaleString()}</p>
                  <p className="text-sm text-orange-700">Subcontratación</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar gastos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                <SelectItem value="materials">Materiales</SelectItem>
                <SelectItem value="subcontracting">Subcontratación</SelectItem>
                <SelectItem value="equipment">Equipamiento</SelectItem>
                <SelectItem value="licenses">Licencias</SelectItem>
                <SelectItem value="other">Otros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Expenses Table */}
          {isLoading ? (
            <p className="text-center text-gray-500 py-8">Cargando gastos...</p>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay gastos directos registrados</h3>
              <p className="text-gray-500 mb-4">Comienza registrando los gastos directos del proyecto.</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Registrar Primer Gasto
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Fecha</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Base</TableHead>
                  <TableHead>IVA</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => (
                  <TableRow key={expense.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {format(new Date(expense.expense_date), "d MMM yyyy", { locale: es })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getCategoryBadge(expense.category)}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="font-medium text-gray-900 truncate">{expense.description}</p>
                        {expense.receipt_url && (
                          <a 
                            href={expense.receipt_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" />
                            Ver comprobante
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">€{expense.amount.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        €{(expense.iva_amount || 0).toLocaleString()} ({expense.iva_rate}%)
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-green-600">€{expense.total_amount.toLocaleString()}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setEditingExpense(expense); setShowForm(true); }}
                          className="hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(expense)}
                          className="hover:bg-red-50 text-red-600"
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

      {/* Direct Expense Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <DirectExpenseForm
            expense={editingExpense}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingExpense(null);
            }}
          />
        </div>
      )}
    </div>
  );
}