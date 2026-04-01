import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, UserX, Building } from "lucide-react";

export default function EmployeeStatsCards({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card className="shadow-md border-0 bg-gradient-to-br from-blue-50 to-blue-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Total Empleados</p>
              <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md border-0 bg-gradient-to-br from-green-50 to-green-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Empleados Activos</p>
              <p className="text-3xl font-bold text-green-900">{stats.active}</p>
            </div>
            <UserCheck className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md border-0 bg-gradient-to-br from-gray-50 to-gray-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Empleados Inactivos</p>
              <p className="text-3xl font-bold text-gray-900">{stats.inactive}</p>
            </div>
            <UserX className="w-8 h-8 text-gray-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md border-0 bg-gradient-to-br from-purple-50 to-purple-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 mb-1">Departamentos</p>
              <p className="text-3xl font-bold text-purple-900">{stats.departments}</p>
            </div>
            <Building className="w-8 h-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}