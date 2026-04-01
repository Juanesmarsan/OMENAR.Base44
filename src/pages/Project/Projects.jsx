
import React, { useState, useEffect, useCallback } from 'react';
import { EmployeeAdvance } from '@/entities/EmployeeAdvance';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Euro, Calendar, Info } from 'lucide-react';
import { format } from "date-fns";
import { es } from "date-fns/locale";

import AdvanceForm from '../AdvanceForm';

export default function AdvancesTab({ employee }) {
  const [advances, setAdvances] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAdvance, setEditingAdvance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    count: 0,
    average: 0
  });

  const loadAdvances = useCallback(async () => {
    try {
      const data = await EmployeeAdvance.filter({ employee_id: employee.id }, '-advance_date');
      setAdvances(data);
      
      // Calculate stats
      const total = data.reduce((sum, advance) => sum + (advance.amount || 0), 0);
      const count = data.length;
      const average = count > 0 ? total / count : 0;
      
      setStats({ total, count, average });
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading advances:', error);
      setIsLoading(false);
    }
  }, [employee.id]); // Dependency on employee.id ensures loadAdvances is re-created if employee changes

  useEffect(() => {
    loadAdvances();
  }, [loadAdvances]); // Effect now depends on the memoized loadAdvances function

  const handleSubmit = async (advanceData) => {
    try {
      const dataWithEmployee = { ...advanceData, employee_id: employee.id };
      
      if (editingAdvance) {
        await EmployeeAdvance.update(editingAdvance.id, dataWithEmployee);
      } else {
        await EmployeeAdvance.create(dataWithEmployee);
      }
      
      setShowForm(false);
      setEditingAdvance(null);
      loadAdvances();
    } catch (error) {
      console.error('Error saving advance:', error);
    }
  };

  const handleDelete = async (advance) => {
    if (confirm('¿Estás seguro de que quieres eliminar este adelanto?')) {
      try {
        await EmployeeAdvance.delete(advance.id);
        loadAdvances();
      } catch (error) {
        console.error('Error deleting advance:', error);
      }
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      deducted: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-gray-100 text-gray-800 border-gray-200"
    };

    const labels = {
      pending: "Pendiente",
      deducted: "Deducido",
      cancelled: "Cancelado"
    };

    return (
      <Badge className={`${variants[status]} border`}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-md border-0">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gestión de Adelantos de {employee.first_name}</CardTitle>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Adelanto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Adelantos</p>
                    <p className="text-2xl font-bold text-blue-900">€{stats.total.toLocaleString()}</p>
                  </div>
                  <Euro className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Número de Adelantos</p>
                    <p className="text-2xl font-bold text-green-900">{stats.count}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Promedio por Adelanto</p>
                    <p className="text-2xl font-bold text-purple-900">€{stats.average.toFixed(2)}</p>
                  </div>
                  <Euro className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Alert */}
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Los adelantos se descontarán automáticamente del salario neto mensual del empleado.
            </AlertDescription>
          </Alert>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando adelantos...</p>
            </div>
          ) : advances.length === 0 ? (
            <div className="text-center py-12">
              <Euro className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay adelantos registrados
              </h3>
              <p className="text-gray-600 mb-6">
                Este empleado no tiene adelantos de nómina registrados
              </p>
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Registrar Primer Adelanto
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Importe</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha de Registro</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {advances.map((advance) => (
                  <TableRow key={advance.id}>
                    <TableCell className="font-medium">
                      {format(new Date(advance.advance_date), "d 'de' MMM, yyyy", { locale: es })}
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-green-600">
                        €{advance.amount.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>{advance.concept}</TableCell>
                    <TableCell>{getStatusBadge(advance.status)}</TableCell>
                    <TableCell className="text-gray-500">
                      {format(new Date(advance.created_date), "d 'de' MMM, yyyy", { locale: es })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingAdvance(advance);
                            setShowForm(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(advance)}
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

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <AdvanceForm
              advance={editingAdvance}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingAdvance(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
