import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, X, AlertCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function DirectExpenseForm({ expense, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(expense ? {
    ...expense,
    total_input: expense.total_amount || '',
    has_iva: expense.iva_rate > 0
  } : {
    category: 'materials',
    description: '',
    total_input: '',
    has_iva: false,
    iva_rate: 0,
    expense_date: new Date().toISOString().split('T')[0],
    receipt_url: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error cuando el usuario corrija
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, expense_date: date ? date.toISOString().split('T')[0] : '' }));
  };

  const handleCategoryChange = (value) => {
    setFormData(prev => ({ ...prev, category: value }));
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validación
    const newErrors = {};
    if (!formData.category) {
      newErrors.category = 'Debes seleccionar una categoría';
    }
    if (!formData.description || formData.description.trim() === '') {
      newErrors.description = 'La descripción es obligatoria';
    }
    if (!formData.total_input || parseFloat(formData.total_input) <= 0) {
      newErrors.amount = 'El importe debe ser mayor que 0';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Calcular base e IVA desde el total introducido
    const totalAmount = parseFloat(formData.total_input) || 0;
    const ivaRate = parseFloat(formData.iva_rate) || 0;
    
    // Si IVA es 0, la base es igual al total (sin recalcular)
    let baseAmount, ivaAmount;
    if (ivaRate === 0) {
      baseAmount = totalAmount;
      ivaAmount = 0;
    } else {
      // Fórmula: Base = Total / (1 + IVA/100)
      baseAmount = totalAmount / (1 + ivaRate / 100);
      ivaAmount = totalAmount - baseAmount;
    }
    
    const dataToSubmit = {
      category: formData.category,
      description: formData.description,
      amount: Math.round(baseAmount * 100) / 100,
      iva_rate: ivaRate,
      iva_amount: Math.round(ivaAmount * 100) / 100,
      total_amount: totalAmount,
      expense_date: formData.expense_date,
      receipt_url: formData.receipt_url || ''
    };
    
    console.log('📤 Datos de gasto directo a enviar:', dataToSubmit);
    onSubmit(dataToSubmit);
  };

  return (
    <Card className="w-full max-w-lg shadow-2xl">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{expense ? 'Editar Gasto Directo' : 'Nuevo Gasto Directo'}</CardTitle>
            <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Categoría *
            </label>
            <Select 
              value={formData.category} 
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="materials">Materiales</SelectItem>
                <SelectItem value="subcontracting">Subcontratación</SelectItem>
                <SelectItem value="equipment">Equipamiento</SelectItem>
                <SelectItem value="licenses">Licencias</SelectItem>
                <SelectItem value="other">Otros</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && (
              <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                <AlertCircle className="w-3 h-3" />
                {errors.category}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Descripción *
            </label>
            <Textarea 
              name="description" 
              placeholder="Descripción del gasto" 
              value={formData.description} 
              onChange={handleChange}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                <AlertCircle className="w-3 h-3" />
                {errors.description}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Importe TOTAL (€) *
              </label>
              <Input 
                name="total_input" 
                type="number" 
                step="0.01"
                placeholder="0.00" 
                value={formData.total_input} 
                onChange={handleChange}
                className={errors.amount ? 'border-red-500' : ''}
              />
              {errors.amount && (
                <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                  <AlertCircle className="w-3 h-3" />
                  {errors.amount}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_iva"
                checked={formData.has_iva}
                onCheckedChange={(checked) => setFormData(prev => ({
                  ...prev, 
                  has_iva: checked,
                  iva_rate: checked ? 21 : 0
                }))}
              />
              <label htmlFor="has_iva" className="text-sm font-medium text-gray-700 cursor-pointer">
                Incluye IVA
              </label>
            </div>

            {formData.has_iva && (
              <div className="w-32">
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  IVA (%)
                </label>
                <Input 
                  name="iva_rate" 
                  type="number" 
                  placeholder="21" 
                  value={formData.iva_rate} 
                  onChange={handleChange} 
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Fecha del gasto *
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.expense_date ? format(new Date(formData.expense_date), 'PPP', { locale: es }) : 'Seleccionar fecha'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar 
                  mode="single" 
                  selected={formData.expense_date ? new Date(formData.expense_date) : null} 
                  onSelect={handleDateChange} 
                  locale={es} 
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              URL del comprobante (opcional)
            </label>
            <Input 
              name="receipt_url" 
              placeholder="https://..." 
              value={formData.receipt_url} 
              onChange={handleChange} 
            />
          </div>

          {/* Preview de cálculos */}
          {formData.total_input && parseFloat(formData.total_input) > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-xs space-y-1">
                {(() => {
                  const total = parseFloat(formData.total_input);
                  const ivaRate = parseFloat(formData.iva_rate) || 0;
                  const base = ivaRate === 0 ? total : total / (1 + ivaRate / 100);
                  const iva = ivaRate === 0 ? 0 : total - base;
                  return (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Base {ivaRate > 0 ? '(calculada)' : ''}:</span>
                        <span className="font-semibold">€{base.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">IVA ({formData.iva_rate}%):</span>
                        <span className="font-semibold">€{iva.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-gray-300">
                        <span className="text-gray-900 font-semibold">Total:</span>
                        <span className="font-bold text-green-600">€{total.toFixed(2)}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            {expense ? 'Guardar Cambios' : 'Registrar Gasto'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}