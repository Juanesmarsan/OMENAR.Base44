import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

export default function CalendarLegend() {
  return (
    <Card className="shadow-md border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-600" />
          Convenio del Metal de Valencia
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Estados:</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
              <span className="text-sm">Normal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
              <span className="text-sm">Vacaciones</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
              <span className="text-sm">Baja Médica</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
              <span className="text-sm">Ausencia</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 rounded"></div>
              <span className="text-sm">Asuntos Propios</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Tipos de Día:</h4>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Día laboral (8h estándar)</span></p>
            <p><span className="font-medium text-blue-600">Sábado (0h estándar)</span></p>
            <p><span className="font-medium text-red-600">Domingo (0h estándar)</span></p>
            <p><span className="font-medium text-purple-600">Festivo (0h estándar)</span></p>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-200">
          <h4 className="font-semibold text-gray-700 mb-2">Cálculo CORRECTO:</h4>
          <div className="space-y-1 text-xs text-gray-600">
            <p><span className="font-medium">Horas Laborales:</span> FIJAS según días laborables del mes</p>
            <p><span className="font-medium">Horas Reales:</span> Laborales + Sábados (SIN festivas)</p>
            <p><span className="font-medium">Horas Extra:</span> Reales - Laborales × €12</p>
            <p><span className="font-medium">Horas Festivas:</span> Solo domingos y festivos × €16</p>
          </div>
        </div>

        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
          <p className="text-xs text-amber-800">
            <span className="font-semibold">Nota:</span> Las horas de sábado SÍ se incluyen en las horas reales para el cálculo de extras
          </p>
        </div>
      </CardContent>
    </Card>
  );
}