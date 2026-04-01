import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calendar,
  AlertTriangle, 
  CheckCircle,
  Clock,
  Euro
} from "lucide-react";

export default function PaymentStats({ stats, onFilterChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
      <Card 
        className="shadow-md border-0 bg-gradient-to-br from-blue-50 to-blue-100 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => onFilterChange('all')}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Total Vencimientos</p>
              <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card 
        className="shadow-md border-0 bg-gradient-to-br from-yellow-50 to-yellow-100 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => onFilterChange('pending')}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600 mb-1">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-900">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </CardContent>
      </Card>

      <Card 
        className="shadow-md border-0 bg-gradient-to-br from-red-50 to-red-100 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => onFilterChange('overdue')}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600 mb-1">Vencidos</p>
              <p className="text-3xl font-bold text-red-900">{stats.overdue}</p>
              <p className="text-xs text-red-600 mt-1">
                €{stats.overdueAmount.toLocaleString()}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </CardContent>
      </Card>

      <Card 
        className="shadow-md border-0 bg-gradient-to-br from-green-50 to-green-100 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => onFilterChange('paid')}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Pagados</p>
              <p className="text-3xl font-bold text-green-900">{stats.paid}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md border-0 bg-gradient-to-br from-purple-50 to-purple-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 mb-1">Importe Total</p>
              <p className="text-2xl font-bold text-purple-900">
                €{stats.totalAmount.toLocaleString()}
              </p>
            </div>
            <Euro className="w-8 h-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}