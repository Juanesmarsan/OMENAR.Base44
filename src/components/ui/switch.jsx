import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, X, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function EmployeeAssignmentForm({ assignment, availableEmployees, assignments = [], onSubmit, onCancel }) {
  const [formData, setFormData] = useState(assignment || {
    employee_id: '',
    start_date: '',
    end_date: '',
    role: '',
    status: 'active',
    daily_rate: ''
  });

  const handleDateChange = (date, field) => {
    setFormData(prev => ({ ...prev, [field]: date ? date.toISOString().split('T')[0] : '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Preparar los datos para envío
    const submitData = { ...formData };
    
    // Convertir daily_rate vacío a null o eliminar el campo
    if (submitData.daily_rate === '' || submitData.daily_rate === null) {
      delete submitData.daily_rate;
    } else {
      submitData.daily_rate = parseFloat(submitData.daily_rate);
    }
    
    // Si end_date está vacío, eliminarlo
    if (!submitData.end_date || submitData.end_date === '') {
      delete submitData.end_date;
    }
    
    onSubmit(submitData);
  };

  // Identificar empleados ya asignados activamente (solo si NO estamos editando)
  const assignedEmployeeIds = !assignment 
    ? new Set(assignments.filter(a => a.status === 'active').map(a => a.employee_id))
    : new Set();

  return (
    <Card className="w-full max-w-lg shadow-2xl">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{assignment ? 'Editar Asignación' : 'Nueva Asignación de Empleado'}</CardTitle>
            <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Select 
              value={formData.employee_id} 
              onValueChange={(value) => setFormData(prev => ({...prev, employee_id: value}))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar empleado *" />
              </SelectTrigger>
              <SelectContent>
                {availableEmployees.map((employee) => {
                  const isAlreadyAssigned = assignedEmployeeIds.has(employee.id);
                  
                  return (
                    <SelectItem 
                      key={employee.id} 
                      value={employee.id}
                      className={isAlreadyAssigned ? 'text-orange-600 font-medium' : ''}
                    >
                      {employee.first_name} {employee.last_name} - {employee.position}
                      {isAlreadyAssigned && ' ⚠️ Ya asignado'}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            
            {!assignment && assignedEmployeeIds.size > 0 && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Los empleados marcados con ⚠️ ya están asignados a este proyecto. El sistema evitará duplicados.</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal" type="button">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.start_date ? format(new Date(formData.start_date), 'PPP', { locale: es }) : 'Fecha de inicio *'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar 
                  mode="single" 
                  selected={formData.start_date ? new Date(formData.start_date) : null} 
                  onSelect={(d) => handleDateChange(d, 'start_date')} 
                  locale={es} 
                />
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal" type="button">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.end_date ? format(new Date(formData.end_date), 'PPP', { locale: es }) : 'Fecha de fin (opcional)'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar 
                  mode="single" 
                  selected={formData.end_date ? new Date(formData.end_date) : null} 
                  onSelect={(d) => handleDateChange(d, 'end_date')} 
                  locale={es} 
                />
              </PopoverContent>
            </Popover>
          </div>

          <Input 
            placeholder="Rol en el proyecto (ej: Técnico, Supervisor)"
            value={formData.role}
            onChange={(e) => setFormData(prev => ({...prev, role: e.target.value}))}
          />

          <Input 
            type="number"
            step="0.01"
            placeholder="Tarifa diaria en € (opcional)"
            value={formData.daily_rate}
            onChange={(e) => setFormData(prev => ({...prev, daily_rate: e.target.value}))}
          />

          <Select 
            value={formData.status} 
            onValueChange={(value) => setFormData(prev => ({...prev, status: value}))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="inactive">Inactivo</SelectItem>
              <SelectItem value="completed">Completado</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">{assignment ? 'Guardar Cambios' : 'Crear Asignación'}</Button>
        </CardFooter>
      </form>
    </Card>
  );
}