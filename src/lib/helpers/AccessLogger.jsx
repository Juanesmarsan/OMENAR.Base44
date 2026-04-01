import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Save, X } from 'lucide-react';
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function ProjectEditForm({ project, onSave, onCancel }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: project.code || '',
    name: project.name || '',
    description: project.description || '',
    project_type: project.project_type || '',
    client_name: project.client_name || '',
    location: project.location || '',
    start_date: project.start_date || '',
    end_date: project.end_date || '',
    status: project.status || 'active',
    hourly_rate: project.hourly_rate || '',
    total_budget: project.total_budget || '',
    include_iva: project.include_iva !== undefined ? project.include_iva : true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDateChange = (date, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: date ? date.toISOString().split('T')[0] : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const submitData = { ...formData };
      
      if (submitData.hourly_rate) {
        submitData.hourly_rate = parseFloat(submitData.hourly_rate);
      }
      if (submitData.total_budget) {
        submitData.total_budget = parseFloat(submitData.total_budget);
      }
      
      if (submitData.project_type !== 'administration') {
        delete submitData.hourly_rate;
      }
      if (submitData.project_type !== 'budget') {
        delete submitData.total_budget;
        delete submitData.include_iva;
      }

      await base44.entities.Project.update(project.id, submitData);
      onSave();
      
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Error al actualizar el proyecto. Por favor, inténtelo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold text-gray-900">
          Editar Proyecto
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-5 h-5" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Código del Proyecto *
              </label>
              <Input
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Nombre del Proyecto *
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Descripción
            </label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="h-24"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Cliente
              </label>
              <Input
                name="client_name"
                value={formData.client_name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Ubicación
              </label>
              <Input
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Tipo de Proyecto
              </label>
              <Select 
                value={formData.project_type} 
                onValueChange={(value) => setFormData(prev => ({...prev, project_type: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="administration">Por Administración</SelectItem>
                  <SelectItem value="budget">Por Presupuesto</SelectItem>
                  <SelectItem value="certification">Por Certificación</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Estado
              </label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData(prev => ({...prev, status: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="paused">Pausado</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.project_type === 'administration' && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Tarifa por Hora (€)
              </label>
              <Input
                name="hourly_rate"
                type="number"
                step="0.01"
                value={formData.hourly_rate}
                onChange={handleChange}
              />
            </div>
          )}

          {formData.project_type === 'budget' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Presupuesto Total (€)
                </label>
                <Input
                  name="total_budget"
                  type="number"
                  step="0.01"
                  value={formData.total_budget}
                  onChange={handleChange}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include_iva"
                  name="include_iva"
                  checked={formData.include_iva}
                  onCheckedChange={(checked) => setFormData(prev => ({...prev, include_iva: checked}))}
                />
                <label htmlFor="include_iva" className="text-sm text-gray-700">
                  Incluye IVA
                </label>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Fecha de Inicio
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date 
                      ? format(new Date(formData.start_date), 'PPP', { locale: es }) 
                      : 'Seleccionar fecha'
                    }
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
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Fecha de Fin
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.end_date 
                      ? format(new Date(formData.end_date), 'PPP', { locale: es }) 
                      : 'Sin fecha de fin'
                    }
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
              {formData.end_date && (
                <Button 
                  type="button" 
                  variant="link" 
                  className="text-xs text-red-600 p-0 h-auto mt-1"
                  onClick={() => setFormData(prev => ({...prev, end_date: ''}))}
                >
                  Quitar fecha de fin
                </Button>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}