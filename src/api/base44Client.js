import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from 'lucide-react';

export default function EquipmentTab({ employee }) {
  return (
    <Card className="shadow-md border-0">
      <CardHeader>
        <CardTitle>Gestión de EPIs y Herramientas de {employee.first_name}</CardTitle>
      </CardHeader>
      <CardContent className="text-center py-12">
        <Construction className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Módulo en Construcción
        </h3>
        <p className="text-gray-600">
          Esta sección para gestionar los equipos estará disponible próximamente.
        </p>
      </CardContent>
    </Card>
  );
}