import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Project } from '@/entities/Project';
import { X } from "lucide-react";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

const ALL_MODULES = [
    "Dashboard", "WorkAgenda", "Projects", "HumanResources", 
    "Fleet", "Inventory", "Billing", "Administration", "Management"
];

const MODULE_TRANSLATIONS = {
    "Dashboard": "Dashboard Ejecutivo",
    "WorkAgenda": "Agenda de Trabajo",
    "Projects": "Gestión de Proyectos",
    "HumanResources": "Recursos Humanos",
    "Fleet": "Flota de Vehículos",
    "Inventory": "Inventario",
    "Billing": "Facturación",
    "Administration": "Administración",
    "Management": "Gerencia"
};

export default function UserForm({ user, employees, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    email: user?.email || '',
    full_name: user?.full_name || '',
    role: user?.role || 'user',
    employee_id: user?.employee_id || '',
    permissions: user?.permissions || { is_guest: false, allowed_projects: [], allowed_modules: [] }
  });
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    async function fetchProjects() {
        if (formData.permissions.is_guest) {
            const projectData = await Project.list();
            setProjects(projectData);
        }
    }
    fetchProjects();
  }, [formData.permissions.is_guest]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handlePermissionChange = (field, value) => {
    setFormData(prev => ({
        ...prev,
        permissions: { ...prev.permissions, [field]: value }
    }));
  };

  const handleProjectSelect = (projectId) => {
      const currentProjects = formData.permissions.allowed_projects || [];
      if (currentProjects.includes(projectId)) {
          handlePermissionChange('allowed_projects', currentProjects.filter(id => id !== projectId));
      } else {
          handlePermissionChange('allowed_projects', [...currentProjects, projectId]);
      }
  };

  const handleModuleSelect = (moduleName) => {
      const currentModules = formData.permissions.allowed_modules || [];
      if (currentModules.includes(moduleName)) {
          handlePermissionChange('allowed_modules', currentModules.filter(name => name !== moduleName));
      } else {
          handlePermissionChange('allowed_modules', [...currentModules, moduleName]);
      }
  };

  const toggleSelectAllModules = () => {
      const allSelected = (formData.permissions.allowed_modules || []).length === ALL_MODULES.length;
      if (allSelected) {
          handlePermissionChange('allowed_modules', []);
      } else {
          handlePermissionChange('allowed_modules', ALL_MODULES);
      }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl border-0">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              {user ? 'Editar Usuario y Permisos' : 'Invitar Nuevo Usuario'}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <ScrollArea className="h-[70vh] pr-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <Input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@ejemplo.com"
                  disabled={!!user}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo *</label>
                <Input
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Nombre completo del usuario"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rol *</label>
                    <Select
                      required
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Usuario</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vincular a Empleado</label>
                    <Select
                      value={formData.employee_id}
                      onValueChange={(value) => setFormData({ ...formData, employee_id: value || '' })}
                    >
                      <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>No vincular</SelectItem>
                        {employees.map(employee => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.first_name} {employee.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
              </div>
              
              <div className="pt-4 border-t">
                  <h3 className="text-lg font-semibold mb-2">Gestión de Permisos</h3>
                  <div className="flex items-center space-x-2 mb-4">
                      <Checkbox
                          id="is_guest"
                          checked={formData.permissions.is_guest}
                          onCheckedChange={(checked) => handlePermissionChange('is_guest', checked)}
                      />
                      <label htmlFor="is_guest" className="text-sm font-medium leading-none">
                          Marcar como Usuario Invitado (permisos restringidos)
                      </label>
                  </div>

                  {formData.permissions.is_guest && (
                      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                          <h4 className="font-medium">Permisos para Invitado</h4>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Proyectos Permitidos</label>
                              <ScrollArea className="h-40 border rounded-md p-2">
                                  {projects.map(project => (
                                      <div key={project.id} className="flex items-center space-x-2 p-1">
                                          <Checkbox
                                              id={`project-${project.id}`}
                                              checked={(formData.permissions.allowed_projects || []).includes(project.id)}
                                              onCheckedChange={() => handleProjectSelect(project.id)}
                                          />
                                          <label htmlFor={`project-${project.id}`} className="text-sm">{project.name} ({project.code})</label>
                                      </div>
                                  ))}
                              </ScrollArea>
                          </div>
                      </div>
                  )}

                  {!formData.permissions.is_guest && formData.role !== 'admin' && (
                    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                        <div className="flex justify-between items-center">
                            <h4 className="font-medium">Módulos Permitidos para rol 'Usuario'</h4>
                            <Button type="button" variant="link" onClick={toggleSelectAllModules}>
                                { (formData.permissions.allowed_modules || []).length === ALL_MODULES.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {ALL_MODULES.map(moduleName => (
                                <div key={moduleName} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`module-${moduleName}`}
                                        checked={(formData.permissions.allowed_modules || []).includes(moduleName)}
                                        onCheckedChange={() => handleModuleSelect(moduleName)}
                                    />
                                    <label htmlFor={`module-${moduleName}`} className="text-sm">{MODULE_TRANSLATIONS[moduleName]}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                  )}
                  {formData.role === 'admin' && (
                    <Badge variant="destructive">Los administradores tienen acceso a todos los módulos por defecto.</Badge>
                  )}
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {user ? 'Guardar Cambios' : 'Enviar Invitación'}
                </Button>
              </div>
            </form>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}