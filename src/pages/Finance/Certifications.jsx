import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, User, Mail, Phone, Building, Briefcase, Euro, Clock, Calendar, Truck } from 'lucide-react';
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function GeneralInfoTab({ employee }) {
  const pendingData = [];
  if (!employee.employee_number) pendingData.push('Código de empleado');
  if (!employee.email) pendingData.push('Email');
  if (!employee.phone) pendingData.push('Teléfono');
  if (!employee.base_salary) pendingData.push('Salario base');

  const DataItem = ({ icon: Icon, label, value, isMissing = false }) => (
    <div>
      <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-400" />
        {label}
      </dt>
      <dd className={`mt-1 text-base font-semibold ${isMissing ? 'text-orange-500' : 'text-gray-900'}`}>
        {value || 'Pendiente'}
      </dd>
    </div>
  );

  return (
    <Card className="shadow-md border-0">
      <CardContent className="p-6 space-y-8">
        {pendingData.length > 0 && (
          <Alert variant="destructive" className="bg-yellow-50 border-yellow-200 text-yellow-800">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="font-semibold">Datos Pendientes</AlertTitle>
            <AlertDescription>
              Los siguientes datos se pueden completar posteriormente:
              <ul className="list-disc list-inside mt-2 text-sm">
                {pendingData.map(item => <li key={item}>{item}</li>)}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos Principales</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
            <DataItem icon={User} label="Código de Empleado" value={employee.employee_number} isMissing={!employee.employee_number} />
            <DataItem icon={Mail} label="Email" value={employee.email} isMissing={!employee.email} />
            <DataItem icon={Phone} label="Teléfono" value={employee.phone} isMissing={!employee.phone} />
            <DataItem icon={Briefcase} label="Puesto" value={employee.position} />
            <DataItem icon={Building} label="Departamento" value={employee.department} />
            <DataItem 
              icon={Calendar} 
              label="Fecha de Contratación" 
              value={employee.hire_date ? format(new Date(employee.hire_date), "d 'de' MMMM, yyyy", { locale: es }) : null} 
            />
            <DataItem icon={Truck} label="Vehículo Asignado" value={employee.assigned_vehicle} />
            <div className="md:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Dirección</dt>
              <dd className="mt-1 text-base text-gray-900">{employee.address || 'No registrada'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Estado</dt>
              <dd className="mt-1">
                <Badge className={employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {employee.status === 'active' ? 'Activo' : 'Inactivo'}
                </Badge>
              </dd>
            </div>
          </dl>
        </div>

        <div className="border-t pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tarifas Financieras</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
            <DataItem icon={Euro} label="Salario Base" value={employee.base_salary ? `€${employee.base_salary.toLocaleString()}`: null} isMissing={!employee.base_salary} />
            <DataItem icon={Clock} label="Hora Extra" value={`€${employee.overtime_rate}/h`} />
            <DataItem icon={Clock} label="Hora Festiva" value={`€${employee.holiday_rate}/h`} />
          </dl>
        </div>

      </CardContent>
    </Card>
  );
}