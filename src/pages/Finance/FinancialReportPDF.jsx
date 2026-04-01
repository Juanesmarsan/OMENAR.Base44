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
import { Plus, X } from "lucide-react";

export default function AccommodationForm({ accommodation, employees, projects, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(accommodation || {
    accommodation_address: '',
    accommodation_type: 'piso',
    occupation_start: new Date().toISOString().split('T')[0],
    occupation_end: '',
    workers: [],
    project_id: '',
    status: 'active',
    commitment_signed: false,
    notes: ''
  });

  const [newWorker, setNewWorker] = useState({
    employee_id: '',
    employee_name: '',
    dni: '',
    position: '',
    home_residence: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addWorker = () => {
    if (!newWorker.employee_id) return;
    
    const employee = employees.find(e => e.id === newWorker.employee_id);
    if (employee) {
      const worker = {
        employee_id: employee.id,
        employee_name: `${employee.first_name} ${employee.last_name}`,
        dni: employee.nif || '',
        position: employee.position || '',
        home_residence: newWorker.home_residence
      };
      
      setFormData({
        ...formData,
        workers: [...(formData.workers || []), worker]
      });
      
      setNewWorker({
        employee_id: '',
        employee_name: '',
        dni: '',
        position: '',
        home_residence: ''
      });
    }
  };

  const removeWorker = (index) => {
    const updatedWorkers = [...formData.workers];
    updatedWorkers.splice(index, 1);
    setFormData({ ...formData, workers: updatedWorkers });
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>
          {accommodation ? 'Editar' : 'Nuevo'} Alojamiento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos del Alojamiento */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Datos del Alojamiento</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Dirección (Municipio) *</Label>
                <Input
                  value={formData.accommodation_address}
                  onChange={(e) => setFormData({ ...formData, accommodation_address: e.target.value })}
                  placeholder="Ej: Lugo, Galicia"
                  required
                />
              </div>

              <div>
                <Label>Tipo de Alojamiento *</Label>
                <Select
                  value={formData.accommodation_type}
                  onValueChange={(value) => setFormData({ ...formData, accommodation_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="piso">Piso</SelectItem>
                    <SelectItem value="apartamento">Apartamento</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Proyecto Relacionado</Label>
                <Select
                  value={formData.project_id}
                  onValueChange={(value) => setFormData({ ...formData, project_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar proyecto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Sin proyecto</SelectItem>
                    {projects.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Fecha Inicio *</Label>
                <Input
                  type="date"
                  value={formData.occupation_start}
                  onChange={(e) => setFormData({ ...formData, occupation_start: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Fecha Fin</Label>
                <Input
                  type="date"
                  value={formData.occupation_end}
                  onChange={(e) => setFormData({ ...formData, occupation_end: e.target.value })}
                />
              </div>

              <div>
                <Label>Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="finished">Finalizado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Compromiso Firmado</Label>
                <Select
                  value={formData.commitment_signed ? 'true' : 'false'}
                  onValueChange={(value) => setFormData({ ...formData, commitment_signed: value === 'true' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">No</SelectItem>
                    <SelectItem value="true">Sí</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Trabajadores Alojados */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Trabajadores Alojados</h3>
            
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="col-span-2">
                <Label>Empleado</Label>
                <Select
                  value={newWorker.employee_id}
                  onValueChange={(value) => setNewWorker({ ...newWorker, employee_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar empleado" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(e => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.first_name} {e.last_name} - {e.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label>Residencia Habitual</Label>
                <Input
                  value={newWorker.home_residence}
                  onChange={(e) => setNewWorker({ ...newWorker, home_residence: e.target.value })}
                  placeholder="Municipio de residencia habitual"
                />
              </div>

              <div className="col-span-2">
                <Button type="button" onClick={addWorker} className="w-full gap-2">
                  <Plus className="w-4 h-4" />
                  Añadir Trabajador
                </Button>
              </div>
            </div>

            {/* Lista de Trabajadores */}
            {formData.workers && formData.workers.length > 0 && (
              <div className="space-y-2">
                {formData.workers.map((worker, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white border rounded">
                    <div>
                      <p className="font-medium">{worker.employee_name}</p>
                      <p className="text-sm text-gray-500">
                        {worker.position} - {worker.home_residence}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeWorker(index)}
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notas */}
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
              Guardar Alojamiento
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}