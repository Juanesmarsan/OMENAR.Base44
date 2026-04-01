import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Car,
  Wrench,
  Fuel,
  Plus,
  Download,
  Edit,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import MaintenanceForm from "./vehicle/MaintenanceForm";
import FuelForm from "./vehicle/FuelForm";
import VehicleForm from "./vehicle/VehicleForm";

export default function VehicleControlTab() {
  const [vehicles, setVehicles] = useState([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [fuelRecords, setFuelRecords] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [showFuelForm, setShowFuelForm] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editingVehicle, setEditingVehicle] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [vehiclesData, maintenanceData, fuelData] = await Promise.all([
        base44.entities.Vehicle.list(),
        base44.entities.VehicleMaintenanceRecord.list('-maintenance_date'),
        base44.entities.VehicleFuelRecord.list('-refuel_date')
      ]);
      
      setVehicles(vehiclesData);
      setMaintenanceRecords(maintenanceData);
      setFuelRecords(fuelData);
    } catch (error) {
      console.error('Error loading vehicle data:', error);
    }
  };

  const handleDeleteMaintenance = async (record) => {
    if (confirm('¿Eliminar este registro de mantenimiento?')) {
      try {
        await base44.entities.VehicleMaintenanceRecord.delete(record.id);
        loadData();
      } catch (error) {
        console.error('Error deleting maintenance record:', error);
      }
    }
  };

  const handleDeleteFuel = async (record) => {
    if (confirm('¿Eliminar este registro de repostaje?')) {
      try {
        await base44.entities.VehicleFuelRecord.delete(record.id);
        loadData();
      } catch (error) {
        console.error('Error deleting fuel record:', error);
      }
    }
  };

  const getVehicleName = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.license_plate} - ${vehicle.brand} ${vehicle.model}` : 'Desconocido';
  };

  const handleDeleteVehicle = async (vehicle) => {
    if (confirm('¿Eliminar este vehículo?')) {
      try {
        await base44.entities.Vehicle.delete(vehicle.id);
        loadData();
      } catch (error) {
        console.error('Error deleting vehicle:', error);
      }
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      available: { label: 'Disponible', class: 'bg-green-100 text-green-800' },
      assigned: { label: 'Asignado', class: 'bg-blue-100 text-blue-800' },
      maintenance: { label: 'Mantenimiento', class: 'bg-yellow-100 text-yellow-800' },
      out_of_service: { label: 'Fuera de Servicio', class: 'bg-red-100 text-red-800' }
    };
    const variant = variants[status] || variants.available;
    return <Badge className={variant.class}>{variant.label}</Badge>;
  };

  const filteredMaintenance = selectedVehicle
    ? maintenanceRecords.filter(r => r.vehicle_id === selectedVehicle)
    : maintenanceRecords;

  const filteredFuel = selectedVehicle
    ? fuelRecords.filter(r => r.vehicle_id === selectedVehicle)
    : fuelRecords;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Control de Vehículos</h2>
          <p className="text-gray-600">Gestión de vehículos, mantenimiento y repostajes para deducción de IVA</p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Generar Dossier Completo
        </Button>
      </div>

      {/* Vehicles List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Vehículos de la Empresa</CardTitle>
          <Button onClick={() => setShowVehicleForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Añadir Vehículo
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matrícula</TableHead>
                <TableHead>Marca/Modelo</TableHead>
                <TableHead>Año</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Kilometraje</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Asignado a</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No hay vehículos registrados. Añade el primer vehículo.
                  </TableCell>
                </TableRow>
              ) : (
                vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-bold">{vehicle.license_plate}</TableCell>
                    <TableCell>{vehicle.brand} {vehicle.model}</TableCell>
                    <TableCell>{vehicle.year}</TableCell>
                    <TableCell className="capitalize">{vehicle.vehicle_type}</TableCell>
                    <TableCell>{vehicle.current_mileage?.toLocaleString()} km</TableCell>
                    <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                    <TableCell>{vehicle.assigned_employee || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingVehicle(vehicle);
                            setShowVehicleForm(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteVehicle(vehicle)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Vehicle Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Car className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium">Filtrar por vehículo:</span>
            <select
              value={selectedVehicle || ''}
              onChange={(e) => setSelectedVehicle(e.target.value || null)}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="">Todos los vehículos</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.license_plate} - {v.brand} {v.model}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="maintenance" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="maintenance" className="gap-2">
            <Wrench className="w-4 h-4" />
            Reparaciones y Mantenimiento
          </TabsTrigger>
          <TabsTrigger value="fuel" className="gap-2">
            <Fuel className="w-4 h-4" />
            Repostajes
          </TabsTrigger>
        </TabsList>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Registros de Mantenimiento</h3>
            <Button onClick={() => setShowMaintenanceForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Registro
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Vehículo</TableHead>
                    <TableHead>KM</TableHead>
                    <TableHead>Tipo Actuación</TableHead>
                    <TableHead>Taller</TableHead>
                    <TableHead>Importe</TableHead>
                    <TableHead>Factura</TableHead>
                    <TableHead>Operativo</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMaintenance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                        No hay registros de mantenimiento
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMaintenance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {format(new Date(record.maintenance_date), 'dd/MM/yyyy', { locale: es })}
                        </TableCell>
                        <TableCell className="font-medium">
                          {getVehicleName(record.vehicle_id)}
                        </TableCell>
                        <TableCell>{record.kilometers?.toLocaleString()} km</TableCell>
                        <TableCell>{record.action_type}</TableCell>
                        <TableCell>{record.workshop_provider}</TableCell>
                        <TableCell className="font-semibold">€{record.amount.toFixed(2)}</TableCell>
                        <TableCell>{record.invoice_number || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={record.vehicle_operative ? 'default' : 'destructive'}>
                            {record.vehicle_operative ? 'Sí' : 'No'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingRecord(record);
                                setShowMaintenanceForm(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteMaintenance(record)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fuel Tab */}
        <TabsContent value="fuel" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Registros de Repostaje</h3>
            <Button onClick={() => setShowFuelForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Registro
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Vehículo</TableHead>
                    <TableHead>KM</TableHead>
                    <TableHead>Litros</TableHead>
                    <TableHead>Importe</TableHead>
                    <TableHead>€/Litro</TableHead>
                    <TableHead>Estación</TableHead>
                    <TableHead>Ticket</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFuel.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                        No hay registros de repostaje
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFuel.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {format(new Date(record.refuel_date), 'dd/MM/yyyy', { locale: es })}
                        </TableCell>
                        <TableCell className="font-medium">
                          {getVehicleName(record.vehicle_id)}
                        </TableCell>
                        <TableCell>{record.kilometers?.toLocaleString()} km</TableCell>
                        <TableCell>{record.liters.toFixed(2)} L</TableCell>
                        <TableCell className="font-semibold">€{record.amount.toFixed(2)}</TableCell>
                        <TableCell>€{(record.amount / record.liters).toFixed(3)}</TableCell>
                        <TableCell>{record.service_station}</TableCell>
                        <TableCell>{record.invoice_ticket || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingRecord(record);
                                setShowFuelForm(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteFuel(record)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Vehicle Form */}
      {showVehicleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl">
            <VehicleForm
              vehicle={editingVehicle}
              onSubmit={async (data) => {
                try {
                  if (editingVehicle) {
                    await base44.entities.Vehicle.update(editingVehicle.id, data);
                  } else {
                    await base44.entities.Vehicle.create(data);
                  }
                  setShowVehicleForm(false);
                  setEditingVehicle(null);
                  loadData();
                } catch (error) {
                  console.error('Error saving vehicle:', error);
                }
              }}
              onCancel={() => {
                setShowVehicleForm(false);
                setEditingVehicle(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Forms */}
      {showMaintenanceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <MaintenanceForm
              record={editingRecord}
              vehicles={vehicles}
              onSubmit={async (data) => {
                try {
                  if (editingRecord) {
                    await base44.entities.VehicleMaintenanceRecord.update(editingRecord.id, data);
                  } else {
                    await base44.entities.VehicleMaintenanceRecord.create(data);
                  }
                  setShowMaintenanceForm(false);
                  setEditingRecord(null);
                  loadData();
                } catch (error) {
                  console.error('Error saving maintenance record:', error);
                }
              }}
              onCancel={() => {
                setShowMaintenanceForm(false);
                setEditingRecord(null);
              }}
            />
          </div>
        </div>
      )}

      {showFuelForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <FuelForm
              record={editingRecord}
              vehicles={vehicles}
              onSubmit={async (data) => {
                try {
                  if (editingRecord) {
                    await base44.entities.VehicleFuelRecord.update(editingRecord.id, data);
                  } else {
                    await base44.entities.VehicleFuelRecord.create(data);
                  }
                  setShowFuelForm(false);
                  setEditingRecord(null);
                  loadData();
                } catch (error) {
                  console.error('Error saving fuel record:', error);
                }
              }}
              onCancel={() => {
                setShowFuelForm(false);
                setEditingRecord(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}