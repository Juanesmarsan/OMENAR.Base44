import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from 'lucide-react';

export default function KanbanView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vista Kanban</CardTitle>
      </CardHeader>
      <CardContent className="text-center py-20">
        <Construction className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold">Módulo en Construcción</h3>
        <p className="text-gray-500">La vista Kanban estará disponible en breve.</p>
      </CardContent>
    </Card>
  );
}