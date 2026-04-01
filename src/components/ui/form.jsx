import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function PhaseForm({ phase, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(phase || {
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'pending'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date, field) => {
    setFormData(prev => ({ ...prev, [field]: date ? date.toISOString().split('T')[0] : '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="w-full max-w-lg shadow-2xl">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{phase ? 'Editar Fase' : 'Nueva Fase'}</CardTitle>
            <Button type="button" variant="ghost" size="icon" onClick={onCancel}><X className="w-4 h-4" /></Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input name="name" placeholder="Nombre de la fase" value={formData.name} onChange={handleChange} required />
          <Textarea name="description" placeholder="Descripción" value={formData.description} onChange={handleChange} />
          <div className="grid grid-cols-2 gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.start_date ? format(new Date(formData.start_date), 'PPP', { locale: es }) : 'Fecha de inicio'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.start_date ? new Date(formData.start_date) : null} onSelect={(d) => handleDateChange(d, 'start_date')} locale={es} /></PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.end_date ? format(new Date(formData.end_date), 'PPP', { locale: es }) : 'Fecha de fin'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.end_date ? new Date(formData.end_date) : null} onSelect={(d) => handleDateChange(d, 'end_date')} locale={es} /></PopoverContent>
            </Popover>
          </div>
          <Select name="status" value={formData.status} onValueChange={(value) => setFormData(prev => ({...prev, status: value}))}>
            <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="in_progress">En Progreso</SelectItem>
              <SelectItem value="paused">Pausada</SelectItem>
              <SelectItem value="completed">Completada</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">{phase ? 'Guardar Cambios' : 'Crear Fase'}</Button>
        </CardFooter>
      </form>
    </Card>
  );
}