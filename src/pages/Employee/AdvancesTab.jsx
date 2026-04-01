import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction, X } from 'lucide-react';

export default function NotificationCenter({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Centro de Notificaciones</CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
            </CardHeader>
            <CardContent className="text-center py-12">
                <Construction className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold">Módulo en Construcción</h3>
                <p className="text-gray-500">Este componente estará disponible en breve.</p>
            </CardContent>
        </Card>
    </div>
  );
}