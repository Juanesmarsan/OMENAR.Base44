import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FuelForm({ record, vehicles, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(record || {
    vehicle_id: '',
    refuel_date: new Date().toISOString().split('T')[0],
    kilometers: '',
    liters: '',
    amount: '',
    service_station: '',
    invoice_ticket: '',
    responsible_signature: '',
    receipt_url: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const pricePerLiter = formData.liters && formData.amount
    ? (parseFloat(formData.amount) / parseFloat(formData.liters)).toFixed(3)
    : '0.000';

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>
          {record ? 'Editar' : 'Nuevo'} Registro de Repostaje
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
                value={formData.refuel_date}
                onChange={(e) => setFormData({ ...formData, refuel_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Kilómetros</Label>
              <Input
                type="number"
                value={formData.kilometers}
                onChange={(e) => setFormData({ ...formData, kilometers: parseInt(e.target.value) })}
                placeholder="KM en repostaje"
              />
            </div>

            <div>
              <Label>Litros *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.liters}
                onChange={(e) => setFormData({ ...formData, liters: parseFloat(e.target.value) })}
                placeholder="0.00"
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

          {formData.liters && formData.amount && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
              <span className="font-medium">Precio por litro:</span> €{pricePerLiter}/L
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Estación de Servicio *</Label>
              <Input
                value={formData.service_station}
                onChange={(e) => setFormData({ ...formData, service_station: e.target.value })}
                placeholder="Nombre de la gasolinera"
                required
              />
            </div>

            <div>
              <Label>Factura / Ticket</Label>
              <Input
                value={formData.invoice_ticket}
                onChange={(e) => setFormData({ ...formData, invoice_ticket: e.target.value })}
                placeholder="Nº ticket"
              />
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