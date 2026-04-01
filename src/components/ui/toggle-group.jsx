
import React, { useState, useEffect, useCallback } from 'react';
import { ProjectAssignment } from '@/entities/ProjectAssignment';
import { Employee } from '@/entities/Employee';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Users, Edit, Trash2, UserCheck, Clock, Calendar } from 'lucide-react';
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";

import EmployeeAssignmentForm from './EmployeeAssignmentForm';

export default function ProjectEmployees({ project }) {
  const [assignments, setAssignments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [showFinalized, setShowFinalized] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ active: 0, available: 0, finalized: 0 });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [assignmentsData, employeesData] = await Promise.all([
        ProjectAssignment.filter({ project_id: project.id }, '-created_date'),
        Employee.list()
      ]);
      
      console.log('📊 DEBUG - Asignaciones del proyecto:', project.name);
      console.log('   Total asignaciones:', assignmentsData.length);
      console.log('   Asignaciones activas:', assignmentsData.filter(a => a.status === 'active').length);
      
      setAssignments(assignmentsData);
      setEmployees(employeesData);

      // CAMBIO: Mostrar TODOS los empleados activos, no solo los no asignados
      const activeEmployees = employeesData.filter(emp => emp.status === 'active');
      
      console.log('👥 Total empleados activos en el sistema:', activeEmployees.length);
      console.log('   Nombres:', activeEmployees.map(e => `${e.first_name} ${e.last_name}`).join(', '));
      
      // Para las estadísticas, sí calculamos los no asignados
      const assignedEmployeeIds = assignmentsData
        .filter(a => a.status === 'active')
        .map(a => a.employee_id);
      
      const notAssignedYet = activeEmployees.filter(emp => !assignedEmployeeIds.includes(emp.id));
      
      console.log('   Empleados ya asignados al proyecto:', assignedEmployeeIds.length);
      console.log('   Empleados disponibles (no asignados):', notAssignedYet.length);
      
      // IMPORTANTE: Ahora mostramos TODOS los empleados activos en el formulario
      setAvailableEmployees(activeEmployees);

      // Calculate stats
      const activeAssignments = assignmentsData.filter(a => a.status === 'active');
      const finalizedAssignments = assignmentsData.filter(a => a.status === 'completed');
      
      setStats({
        active: activeAssignments.length,
        available: notAssignedYet.length, // Esta es la cantidad de empleados sin asignar aún
        finalized: finalizedAssignments.length
      });

    } catch (error) {
      console.error('Error loading project employees data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [project.id, project.name]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (assignmentData) => {
    try {
      const dataWithProject = { ...assignmentData, project_id: project.id };
      
      // Verificar si el empleado ya está asignado activamente
      const existingAssignment = assignments.find(
        a => a.employee_id === assignmentData.employee_id && a.status === 'active'
      );
      
      if (existingAssignment && !editingAssignment) {
        const employee = employees.find(e => e.id === assignmentData.employee_id);
        alert(`⚠️ ${employee?.first_name} ${employee?.last_name} ya está asignado a este proyecto.\n\nSi quieres modificar su asignación, edita la existente desde la tabla.`);
        return;
      }
      
      if (editingAssignment) {
        await ProjectAssignment.update(editingAssignment.id, dataWithProject);
      } else {
        await ProjectAssignment.create(dataWithProject);
      }
      
      setShowForm(false);
      setEditingAssignment(null);
      loadData();
    } catch (error) {
      console.error('Error saving assignment:', error);
      alert('Error al guardar la asignación. Por favor, inténtalo de nuevo.');
    }
  };

  const handleDelete = async (assignment) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta asignación?')) {
      try {
        await ProjectAssignment.delete(assignment.id);
        loadData();
      } catch (error) {
        console.error('Error deleting assignment:', error);
      }
    }
  };

  const handleFinalize = async (assignment) => {
    try {
      await ProjectAssignment.update(assignment.id, {
        ...assignment,
        status: 'completed',
        end_date: new Date().toISOString().split('T')[0]
      });
      loadData();
    } catch (error) {
      console.error('Error finalizing assignment:', error);
    }
  };

  const getEmployeeInfo = (employeeId) => {
    return employees.find(emp => emp.id === employeeId);
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: "bg-green-100 text-green-800 border-green-200",
      completed: "bg-gray-100 text-gray-800 border-gray-200",
      inactive: "bg-red-100 text-red-800 border-red-200"
    };
    const labels = { active: "Activo", completed: "Finalizado", inactive: "Inactivo" };
    return <Badge className={`${variants[status]} border text-xs`}>{labels[status]}</Badge>;
  };

  const filteredAssignments = assignments.filter(assignment => {
    const employee = getEmployeeInfo(assignment.employee_id);
    const matchesSearch = !searchTerm || 
      (employee && (
        employee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employee_number?.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    
    const matchesStatus = showFinalized || assignment.status !== 'completed';
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <Card className="shadow-md border-0">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Gestión de Empleados del Proyecto</CardTitle>
              <p className="text-gray-600 mt-1">Asigna y gestiona los empleados que trabajan en este proyecto.</p>
            </div>
            <Button onClick={() => { setEditingAssignment(null); setShowForm(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Nueva Asignación
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <UserCheck className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-900">{stats.active}</p>
                  <p className="text-sm text-green-700">Asignaciones Activas</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-900">{stats.available}</p>
                  <p className="text-sm text-blue-700">Sin Asignar Aún</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-gray-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.finalized}</p>
                  <p className="text-sm text-gray-700">Asignaciones Finalizadas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar empleados..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showFinalized"
                checked={showFinalized}
                onCheckedChange={setShowFinalized}
              />
              <label htmlFor="showFinalized" className="text-sm text-gray-600">
                Mostrar asignaciones finalizadas
              </label>
            </div>
          </div>

          {/* Assignments Table */}
          {isLoading ? (
            <p className="text-center text-gray-500 py-8">Cargando asignaciones...</p>
          ) : filteredAssignments.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay empleados asignados</h3>
              <p className="text-gray-500 mb-4">Comienza asignando empleados a este proyecto.</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Asignar Primer Empleado
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Empleado</TableHead>
                  <TableHead>Asignación</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => {
                  const employee = getEmployeeInfo(assignment.employee_id);
                  const duration = assignment.end_date 
                    ? differenceInDays(new Date(assignment.end_date), new Date(assignment.start_date))
                    : differenceInDays(new Date(), new Date(assignment.start_date));

                  return (
                    <TableRow key={assignment.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                              {employee ? getInitials(employee.first_name, employee.last_name) : '??'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {employee ? `${employee.first_name} ${employee.last_name}` : 'Empleado eliminado'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {employee?.employee_number && `#${employee.employee_number} • `}
                              {employee?.department} • {employee?.position}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span>{format(new Date(assignment.start_date), "d MMM yyyy", { locale: es })}</span>
                          {assignment.end_date && (
                            <>
                              <span className="text-gray-400">-</span>
                              <span>{format(new Date(assignment.end_date), "d MMM yyyy", { locale: es })}</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{duration} días</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">{assignment.role || 'No especificado'}</span>
                        {assignment.daily_rate && (
                          <div className="text-xs text-gray-500">€{assignment.daily_rate}/día</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(assignment.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {assignment.status === 'active' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFinalize(assignment)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              Finalizar
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setEditingAssignment(assignment); setShowForm(true); }}
                            className="hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(assignment)}
                            className="hover:bg-red-50 text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Assignment Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <EmployeeAssignmentForm
            assignment={editingAssignment}
            availableEmployees={availableEmployees}
            assignments={assignments}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingAssignment(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
