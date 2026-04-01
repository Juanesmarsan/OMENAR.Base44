import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MaintenanceForm({ record, vehicles, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(record || {
    vehicle_id: '',
    maintenance_date: new Date().toISOString().split('T')[0],
    kilometers: '',
    action_type: '',
    workshop_provider: '',
    amount: '',
    invoice_number: '',
    vehicle_operative: true,
    responsible_signature: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>
          {record ? 'Editar' : 'Nuevo'} Registro de Mantenimiento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Vehículo *</Label>
              <Select
                value={formData.vehicle_id}
                onValueChange={(value) => setFormData({ ...formData, vehicle_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar vehículo" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map(v => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.license_plate} - {v.brand} {v.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Fecha *</Label>
              <Input
                type="date"
                value={formData.maintenance_date}
                onChange={(e) => setFormData({ ...formData, maintenance_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Kilómetros</Label>
              <Input
                type="number"
                value={formData.kilometers}
                onChange={(e) => setFormData({ ...formData, kilometers: parseInt(e.target.value) })}
                placeholder="KM del vehículo"
              />
            </div>

            <div>
              <Label>Tipo de Actuación *</Label>
              <Input
                value={formData.action_type}
                onChange={(e) => setFormData({ ...formData, action_type: e.target.value })}
                placeholder="Ej: Cambio de aceite, Revisión ITV..."
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Taller / Proveedor *</Label>
              <Input
                value={formData.workshop_provider}
                onChange={(e) => setFormData({ ...formData, workshop_provider: e.target.value })}
                placeholder="Nombre del taller"
                required
              />
            </div>

            <div>
              <Label>Importe (€) *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Número de Factura</Label>
              <Input
                value={formData.invoice_number}
                onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                placeholder="Nº factura"
              />
            </div>

            <div>
              <Label>Vehículo Operativo</Label>
              <Select
                value={formData.vehicle_operative ? 'true' : 'false'}
                onValueChange={(value) => setFormData({ ...formData, vehicle_operative: value === 'true' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Sí</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Responsable</Label>
            <Input
              value={formData.responsible_signature}
              onChange={(e) => setFormData({ ...formData, responsible_signature: e.target.value })}
              placeholder="Nombre del responsable"
            />
          </div>

          <div>
            <Label>Notas</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observaciones adicionales..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              Guardar Registro
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}