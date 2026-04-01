import React, { useState, useEffect } from 'react';
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
import { Calendar as CalendarIcon, X, Upload } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function VariableExpenseForm({ expense, projects, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    expense_date: expense?.expense_date || new Date().toISOString().split('T')[0],
    expense_type: expense?.expense_type || 'travel',
    description: expense?.description || '',
    total_input: expense?.total_amount || '',
    has_iva: expense ? (expense.iva_rate > 0) : false,
    iva_rate: expense?.iva_rate || 0,
    iva_amount: expense?.iva_amount || 0,
    total_amount: expense?.total_amount || 0,
    amount: expense?.amount || 0,
    project_id: expense?.project_id || '',
    receipt_url: expense?.receipt_url || '',
    status: expense?.status || 'pending'
  });

  useEffect(() => {
    // Auto-calculate base and IVA from total input
    if (formData.total_input) {
      const total = parseFloat(formData.total_input) || 0;
      const ivaRate = formData.has_iva ? (parseFloat(formData.iva_rate) || 0) : 0;
      
      let base, iva;
      if (ivaRate === 0) {
        base = total;
        iva = 0;
      } else {
        base = total / (1 + ivaRate / 100);
        iva = total - base;
      }
      
      setFormData(prev => ({
        ...prev,
        amount: Math.round(base * 100) / 100,
        iva_amount: Math.round(iva * 100) / 100,
        total_amount: total
      }));
    }
  }, [formData.total_input, formData.iva_rate, formData.has_iva]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const expenseTypes = [
    { value: 'travel', label: 'Viajes' },
    { value: 'meals', label: 'Dietas' },
    { value: 'fuel', label: 'Combustible' },
    { value: 'accommodation', label: 'Alojamiento' },
    { value: 'other', label: 'Otros' }
  ];

  return (
    <Card className="w-full shadow-2xl border-0">
      <CardHeader className="border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            {expense ? 'Editar Gasto Variable' : 'Nuevo Gasto Variable'}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha del Gasto *
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.expense_date ? format(new Date(formData.expense_date), 'dd/MM/yyyy') : 'Seleccionar fecha'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.expense_date ? new Date(formData.expense_date) : new Date()}
                    onSelect={(date) => setFormData({
                      ...formData, 
                      expense_date: date ? date.toISOString().split('T')[0] : ''
                    })}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Gasto *
              </label>
              <Select
                value={formData.expense_type}
                onValueChange={(value) => setFormData({...formData, expense_type: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {expenseTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proyecto
              </label>
              <Select
                value={formData.project_id}
                onValueChange={(value) => setFormData({...formData, project_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proyecto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Sin asignar</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name} ({project.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="approved">Aprobado</SelectItem>
                  <SelectItem value="reimbursed">Reembolsado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <Textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Descripción detallada del gasto"
              className="h-20"
            />
          </div>

          {/* Financial Data */}
          <div className="bg-gray-50 p-6 rounded-xl space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Importe TOTAL (€) *
              </label>
              <Input
                type="number"
                required
                step="0.01"
                value={formData.total_input}
                onChange={(e) => setFormData({...formData, total_input: e.target.value})}
                placeholder="0.00"
                className="text-lg"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_iva_var"
                checked={formData.has_iva}
                onCheckedChange={(checked) => setFormData(prev => ({
                  ...prev, 
                  has_iva: checked,
                  iva_rate: checked ? 21 : 0
                }))}
              />
              <label htmlFor="has_iva_var" className="text-sm font-medium text-gray-700 cursor-pointer">
                Incluye IVA
              </label>
            </div>

            {formData.has_iva && (
              <div className="w-32">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IVA (%)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.iva_rate}
                  onChange={(e) => setFormData({...formData, iva_rate: parseFloat(e.target.value) || 0})}
                />
              </div>
            )}

            {/* Preview de cálculos */}
            {formData.total_input && parseFloat(formData.total_input) > 0 && (
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base {formData.has_iva ? '(calculada)' : ''}:</span>
                    <span className="font-semibold">€{(formData.amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">IVA ({formData.iva_rate}%):</span>
                    <span className="font-semibold">€{(formData.iva_amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-gray-300">
                    <span className="text-gray-900 font-semibold">Total:</span>
                    <span className="font-bold text-green-600">€{(formData.total_amount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Receipt Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comprobante
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Arrastra y suelta el comprobante aquí, o haz clic para seleccionar
                </p>
                <Button type="button" variant="outline" size="sm">
                  Seleccionar archivo
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {expense ? 'Actualizar Gasto' : 'Crear Gasto'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}