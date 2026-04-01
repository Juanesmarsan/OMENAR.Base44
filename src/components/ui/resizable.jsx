import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, Clock, Euro, TrendingUp } from "lucide-react";

export default function MonthlyStats({ stats, employee, hasChanges }) {
  const extraHourRate = employee?.overtime_rate || 12;
  const holidayHourRate = employee?.holiday_rate || 16;
  
  const extraAmount = stats.extraHours * extraHourRate;
  const holidayAmount = stats.holidayHours * holidayHourRate;
  const totalExtraAmount = extraAmount + holidayAmount;

  const formatHours = (hours) => {
    if (hours === 0) return '0h';
    return `${hours > 0 ? '+' : ''}${hours}h`;
  };

  const formatCurrency = (amount) => {
    return `€${amount.toFixed(2)}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* Horas Laborales */}
      <Card className="shadow-md border-0 bg-gradient-to-br from-blue-50 to-blue-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Horas Laborales</p>
              <p className="text-3xl font-bold text-blue-900">{stats.laborHours}h</p>
              <p className="text-xs text-blue-600">FIJAS del mes</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      {/* Horas Reales */}
      <Card className="shadow-md border-0 bg-gradient-to-br from-green-50 to-green-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Horas Reales</p>
              <p className="text-3xl font-bold text-green-900">{stats.realHours}h</p>
              <p className="text-xs text-green-600">Laborales + Sábados</p>
            </div>
            <Calculator className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      {/* Horas Extra */}
      <Card className="shadow-md border-0 bg-gradient-to-br from-orange-50 to-orange-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 mb-1">Horas Extra</p>
              <p className={`text-3xl font-bold ${stats.extraHours >= 0 ? 'text-orange-900' : 'text-red-900'}`}>
                {formatHours(stats.extraHours)}
              </p>
              <p className="text-xs text-orange-600">
                {stats.extraHours >= 0 ? 'Trabajo más' : 'Trabajo menos'}
              </p>
              <p className="text-xs font-medium text-orange-700 mt-1">
                {formatCurrency(extraAmount)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>

      {/* Horas Festivas */}
      <Card className="shadow-md border-0 bg-gradient-to-br from-purple-50 to-purple-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 mb-1">Horas Festivas</p>
              <p className="text-3xl font-bold text-purple-900">{stats.holidayHours}h</p>
              <p className="text-xs text-purple-600">Domingos y Festivos</p>
              <p className="text-xs font-medium text-purple-700 mt-1">
                {formatCurrency(holidayAmount)}
              </p>
            </div>
            <Euro className="w-8 h-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      {/* Calculation Summary */}
      <Card className="lg:col-span-4 shadow-md border-0 bg-gradient-to-r from-gray-50 to-gray-100">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              Cálculo Salarial del Mes - CORRECTO
            </CardTitle>
            {hasChanges && (
              <Badge variant="outline" className="text-amber-600 border-amber-300">
                Cálculo Provisional
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700 mb-3">Horas Extra:</h4>
              <div className="text-sm space-y-1">
                <p>{formatHours(stats.extraHours)} × {formatCurrency(extraHourRate)} = <span className="font-semibold">{formatCurrency(extraAmount)}</span></p>
                <p className="text-xs text-gray-600">Trabajó {stats.extraHours >= 0 ? 'más' : 'menos'} horas (suma)</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700 mb-3">Horas Festivas:</h4>
              <div className="text-sm space-y-1">
                <p>{stats.holidayHours}h × {formatCurrency(holidayHourRate)} = <span className="font-semibold">{formatCurrency(holidayAmount)}</span></p>
                <p className="text-xs text-gray-600">Solo domingos y festivos oficiales</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700 mb-3">Total Extra:</h4>
              <div className="text-lg">
                <p className={`font-bold ${totalExtraAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalExtraAmount >= 0 ? '+' : ''}{formatCurrency(totalExtraAmount)}
                </p>
                <p className="text-xs text-gray-600">Se suma al salario</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <p><span className="font-semibold">FÓRMULA CORRECTA:</span> Horas Extra = ({stats.realHours} - {stats.laborHours}) × {formatCurrency(extraHourRate)} = {formatCurrency(extraAmount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}