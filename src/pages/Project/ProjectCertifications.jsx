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

export default function VehicleForm({ vehicle, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(vehicle || {
    license_plate: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    vehicle_type: "car",
    status: "available",
    assigned_employee: "",
    current_mileage: 0,
    fuel_level: 100,
    next_maintenance: "",
    insurance_expiry: "",
    itv_expiry: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>{vehicle ? "Editar Vehículo" : "Nuevo Vehículo"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Matrícula *</Label>
              <Input
                required
                value={formData.license_plate}
                onChange={(e) => setFormData({...formData, license_plate: e.target.value})}
                placeholder="1234ABC"
              />
            </div>

            <div>
              <Label>Marca *</Label>
              <Input
                required
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                placeholder="Renault"
              />
            </div>

            <div>
              <Label>Modelo *</Label>
              <Input
                required
                value={formData.model}
                onChange={(e) => setFormData({...formData, model: e.target.value})}
                placeholder="Kangoo"
              />
            </div>

            <div>
              <Label>Año *</Label>
              <Input
                type="number"
                required
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
              />
            </div>

            <div>
              <Label>Tipo de Vehículo *</Label>
              <Select
                value={formData.vehicle_type}
                onValueChange={(value) => setFormData({...formData, vehicle_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="car">Coche</SelectItem>
                  <SelectItem value="van">Furgoneta</SelectItem>
                  <SelectItem value="truck">Camión</SelectItem>
                  <SelectItem value="motorcycle">Moto</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({...formData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="assigned">Asignado</SelectItem>
                  <SelectItem value="maintenance">Mantenimiento</SelectItem>
                  <SelectItem value="out_of_service">Fuera de Servicio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Kilometraje Actual</Label>
              <Input
                type="number"
                value={formData.current_mileage || 0}
                onChange={(e) => setFormData({...formData, current_mileage: parseInt(e.target.value)})}
              />
            </div>

            <div>
              <Label>Nivel de Combustible (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.fuel_level || 100}
                onChange={(e) => setFormData({...formData, fuel_level: parseInt(e.target.value)})}
              />
            </div>

            <div>
              <Label>Próximo Mantenimiento</Label>
              <Input
                type="date"
                value={formData.next_maintenance || ""}
                onChange={(e) => setFormData({...formData, next_maintenance: e.target.value})}
              />
            </div>

            <div>
              <Label>Vencimiento Seguro</Label>
              <Input
                type="date"
                value={formData.insurance_expiry || ""}
                onChange={(e) => setFormData({...formData, insurance_expiry: e.target.value})}
              />
            </div>

            <div>
              <Label>Vencimiento ITV</Label>
              <Input
                type="date"
                value={formData.itv_expiry || ""}
                onChange={(e) => setFormData({...formData, itv_expiry: e.target.value})}
              />
            </div>

            <div>
              <Label>Empleado Asignado</Label>
              <Input
                value={formData.assigned_employee || ""}
                onChange={(e) => setFormData({...formData, assigned_employee: e.target.value})}
                placeholder="Nombre del empleado"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              {vehicle ? "Actualizar" : "Crear"} Vehículo
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}