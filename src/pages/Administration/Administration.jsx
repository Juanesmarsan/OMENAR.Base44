import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, X } from "lucide-react";

export default function EmployeeForm({ employee, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    employee_number: '',
    first_name: '',
    last_name: '',
    position: '',
    department: '',
    hire_date: '',
    phone: '',
    email: '',
    address: '',
    emergency_contact: '',
    emergency_phone: '',
    base_salary: 0,
    overtime_rate: 12,
    holiday_rate: 16,
    status: 'active',
    assigned_vehicle: '',
    social_security: '',
    nif: '',
    company_coefficient: 1.35,
    ...employee
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const positions = [
    "Peón",
    "Peón Especialista", 
    "Oficial de 3ª",
    "Oficial de 2ª",
    "Oficial de 1ª",
    "Encargado",
    "Capataz",
    "Jefe de Obra",
    "Administrativo",
    "Técnico",
    "Gerencia"
  ];

  const departments = [
    "Operario",
    "Administración",
    "Técnico",
    "Gerencia"
  ];

  return (
    <Card className="w-full shadow-2xl border-0">
      <CardHeader className="border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">
            {employee ? 'Editar Empleado' : 'Nuevo Empleado'}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información Personal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Empleado *
                </label>
                <Input
                  required
                  value={formData.employee_number}
                  onChange={(e) => setFormData({...formData, employee_number: e.target.value})}
                  placeholder="Ej: EMP001"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({...formData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                    <SelectItem value="vacation">Vacaciones</SelectItem>
                    <SelectItem value="sick_leave">Baja médica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <Input
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  placeholder="Nombre del empleado"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellidos *
                </label>
                <Input
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  placeholder="Apellidos del empleado"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="600 000 000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NIF
                </label>
                <Input
                  value={formData.nif}
                  onChange={(e) => setFormData({...formData, nif: e.target.value})}
                  placeholder="12345678A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Seguridad Social
                </label>
                <Input
                  value={formData.social_security}
                  onChange={(e) => setFormData({...formData, social_security: e.target.value})}
                  placeholder="12 1234567890"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección
              </label>
              <Textarea
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Dirección completa del empleado"
                className="h-20"
              />
            </div>
          </div>

          {/* Información Laboral */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Información Laboral</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Puesto *
                </label>
                <Select
                  value={formData.position}
                  onValueChange={(value) => setFormData({...formData, position: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar puesto" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((position) => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departamento
                </label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({...formData, department: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Contratación
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.hire_date 
                        ? format(new Date(formData.hire_date), 'dd/MM/yyyy')
                        : 'Seleccionar fecha'
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.hire_date ? new Date(formData.hire_date) : undefined}
                      onSelect={(date) => setFormData({
                        ...formData, 
                        hire_date: date ? date.toISOString().split('T')[0] : ''
                      })}
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Baja/Finalización
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.termination_date 
                        ? format(new Date(formData.termination_date), 'dd/MM/yyyy')
                        : 'Seleccionar fecha (opcional)'
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.termination_date ? new Date(formData.termination_date) : undefined}
                      onSelect={(date) => setFormData({
                        ...formData, 
                        termination_date: date ? date.toISOString().split('T')[0] : ''
                      })}
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehículo Asignado
                </label>
                <Input
                  value={formData.assigned_vehicle}
                  onChange={(e) => setFormData({...formData, assigned_vehicle: e.target.value})}
                  placeholder="Matrícula del vehículo"
                />
              </div>
            </div>
          </div>

          {/* Información Salarial */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Información Salarial</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-gray-50 p-6 rounded-xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salario Base (€)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.base_salary}
                  onChange={(e) => setFormData({...formData, base_salary: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora Extra (€)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.overtime_rate}
                  onChange={(e) => setFormData({...formData, overtime_rate: parseFloat(e.target.value) || 0})}
                  placeholder="12.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora Festiva (€)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.holiday_rate}
                  onChange={(e) => setFormData({...formData, holiday_rate: parseFloat(e.target.value) || 0})}
                  placeholder="16.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coeficiente Empresa
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.company_coefficient}
                  onChange={(e) => setFormData({...formData, company_coefficient: parseFloat(e.target.value) || 0})}
                  placeholder="1.35"
                />
              </div>
            </div>
          </div>

          {/* Contacto de Emergencia */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Contacto de Emergencia</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Contacto
                </label>
                <Input
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})}
                  placeholder="Nombre del contacto de emergencia"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono de Emergencia
                </label>
                <Input
                  value={formData.emergency_phone}
                  onChange={(e) => setFormData({...formData, emergency_phone: e.target.value})}
                  placeholder="600 000 000"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel} className="px-8">
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 px-8">
              {employee ? 'Actualizar Empleado' : 'Crear Empleado'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}