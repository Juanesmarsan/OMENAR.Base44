import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function CalendarGrid({ calendarData, onDayUpdate, currentDate, projects = [] }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDayBackgroundColor = (day) => {
    const dayDate = new Date(day.date);
    dayDate.setHours(0, 0, 0, 0);
    const isPastOrToday = dayDate <= today;
    
    let baseClasses = "border-2 rounded-lg p-3 transition-all duration-200 ";
    
    if (!day.is_editable) {
      return baseClasses + "bg-gray-100 border-gray-300";
    }

    // BORDE SEGÚN EL DÍA Y ESTADO (solo días cumplidos)
    if (isPastOrToday) {
      // Status-based borders
      if (day.status === 'vacation') {
        baseClasses += "bg-blue-50 border-blue-500"; // Borde azul para vacaciones
      } else if (day.status === 'sick_leave') {
        baseClasses += "bg-green-50 border-green-500"; // Borde verde para bajas
      } else if (day.status === 'absence') {
        baseClasses += "bg-red-50 border-red-500"; // Borde rojo para ausencias
      } else if (day.status === 'personal_matters') {
        baseClasses += "bg-yellow-50 border-yellow-500"; // Borde amarillo para asuntos propios
      } else {
        // Día normal trabajado - BORDE ROJO INTENSO
        if (day.day_type === 'holiday') {
          baseClasses += "bg-purple-50 border-purple-500";
        } else if (day.day_type === 'sunday') {
          baseClasses += "bg-red-50 border-red-600";
        } else if (day.day_type === 'saturday') {
          baseClasses += "bg-blue-50 border-blue-500";
        } else {
          baseClasses += "bg-white border-red-600"; // ⭐ BORDE ROJO INTENSO para días trabajados
        }
      }
    } else {
      // Días futuros - sin borde destacado
      if (day.day_type === 'holiday') {
        baseClasses += "bg-purple-50 border-purple-200";
      } else if (day.day_type === 'sunday') {
        baseClasses += "bg-red-50 border-red-200";
      } else if (day.day_type === 'saturday') {
        baseClasses += "bg-blue-50 border-blue-200";
      } else {
        baseClasses += "bg-white border-gray-200 hover:border-gray-300";
      }
    }

    return baseClasses;
  };

  const getStatusBadge = (status) => {
    const statusLabels = {
      normal: 'Normal',
      vacation: 'Vacaciones',
      sick_leave: 'Baja Médica',
      absence: 'Ausencia',
      personal_matters: 'Asuntos Propios'
    };
    return statusLabels[status];
  };

  const getDayHeader = (day) => {
    const date = new Date(day.date);
    const dayNumber = date.getDate();
    const dayName = format(date, 'EEE', { locale: es });
    const dayDate = new Date(day.date);
    dayDate.setHours(0, 0, 0, 0);
    const isPastOrToday = dayDate <= today;
    
    let headerClass = "font-semibold ";
    if (day.day_type === 'sunday' || day.day_type === 'holiday') {
      headerClass += "text-red-600";
    } else if (day.day_type === 'saturday') {
      headerClass += "text-blue-600";
    } else {
      headerClass += isPastOrToday ? "text-gray-900" : "text-gray-400";
    }

    return (
      <div className="flex justify-between items-center mb-2">
        <div>
          <div className={headerClass}>{dayNumber}</div>
          <div className={`text-xs capitalize ${isPastOrToday ? 'text-gray-500' : 'text-gray-400'}`}>
            {dayName}
          </div>
        </div>
        {day.holiday_info && (
          <div className="text-xs text-purple-600 font-medium">
            Festivo
          </div>
        )}
        {isPastOrToday && day.status === 'normal' && day.day_type === 'workday' && (
          <div className="text-xs text-red-600 font-bold">
            ✓
          </div>
        )}
      </div>
    );
  };

  // Group days by weeks
  const weeks = [];
  let currentWeek = [];
  
  calendarData.forEach((day, index) => {
    const date = new Date(day.date);
    const dayOfWeek = (date.getDay() + 6) % 7; // Monday = 0, Sunday = 6

    // Fill empty days at start of first week
    if (index === 0 && dayOfWeek > 0) {
      for (let i = 0; i < dayOfWeek; i++) {
        currentWeek.push(null);
      }
    }

    currentWeek.push({ ...day, index });

    // End of week or last day
    if (currentWeek.length === 7 || index === calendarData.length - 1) {
      // Fill empty days at end of last week
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  return (
    <Card className="shadow-md border-0">
      <CardContent className="p-6">
        <div className="mb-4">
          <div className="grid grid-cols-7 gap-4 mb-2">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, index) => (
              <div key={day} className={`text-center font-semibold text-sm py-2 ${
                index === 5 ? 'text-blue-600' : index === 6 ? 'text-red-600' : 'text-gray-700'
              }`}>
                {day}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-4">
              {week.map((day, dayIndex) => (
                <div key={dayIndex}>
                  {day ? (
                    <div className={getDayBackgroundColor(day)}>
                      {getDayHeader(day)}
                      
                      <div className="space-y-2">
                        <div className="text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Std:</span>
                            <span className="font-mono">{day.standard_hours}h</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Real:</span>
                            <Input
                              type="number"
                              step="0.5"
                              min="0"
                              max="24"
                              value={day.actual_hours}
                              onChange={(e) => onDayUpdate(day.index, 'actual_hours', parseFloat(e.target.value) || 0)}
                              className="w-12 h-6 text-xs px-1 text-right"
                              disabled={!day.is_editable}
                            />
                          </div>
                        </div>

                        <Select
                          value={day.status}
                          onValueChange={(value) => onDayUpdate(day.index, 'status', value)}
                          disabled={!day.is_editable}
                        >
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="vacation">Vacaciones</SelectItem>
                            <SelectItem value="sick_leave">Baja Médica</SelectItem>
                            <SelectItem value="absence">Ausencia</SelectItem>
                            <SelectItem value="personal_matters">Asuntos Propios</SelectItem>
                          </SelectContent>
                        </Select>

                        {day.status === 'normal' && (
                          <Select
                            value={day.project_id || ""}
                            onValueChange={(value) => onDayUpdate(day.index, 'project_id', value)}
                            disabled={!day.is_editable}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue placeholder="Proyecto" />
                            </SelectTrigger>
                            <SelectContent>
                              {projects.map(project => (
                                <SelectItem key={project.id} value={project.id}>
                                  {project.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        {(day.actual_hours > 0 && ['saturday', 'sunday', 'holiday'].includes(day.day_type)) && (
                          <div className="text-xs font-medium text-purple-600">
                            Festiva: {day.actual_hours}h
                          </div>
                        )}

                        {day.holiday_info && (
                          <div className="text-xs text-purple-600">
                            {day.holiday_info.name}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="h-32"></div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}