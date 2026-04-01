import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Save,
  RotateCcw,
  Info,
  CheckCircle,
  Lock
} from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from "date-fns";
import { es } from "date-fns/locale";

import CalendarGrid from "../../calendar/CalendarGrid";
import MonthlyStats from "../../calendar/MonthlyStats";
import CalendarLegend from "../../calendar/CalendarLegend";
import { getHolidayInfo, calculateMonthlyHours } from "../../calendar/CalendarUtils";

export default function CalendarTab({ employee }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState({
    laborHours: 0,
    realHours: 0,
    extraHours: 0,
    holidayHours: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState([]);
  const [isMonthConfirmed, setIsMonthConfirmed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (e) {}
    };
    const fetchProjects = async () => {
      try {
        const allProjects = await base44.entities.Project.filter({ status: 'active' });
        setProjects(allProjects);
      } catch (e) {
        console.error('Error loading projects:', e);
      }
    };
    fetchUser();
    fetchProjects();
  }, []);

  const currentMonth = format(currentDate, 'MMMM yyyy', { locale: es });
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const generateMonthCalendar = useCallback((employeeId, date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const days = eachDayOfInterval({ start, end });

    return days.map(day => {
      console.log('DEBUG: Procesando día:', day);
      const dayOfWeek = day.getDay();
      const holidayInfo = getHolidayInfo(day);
      console.log('DEBUG: holidayInfo para el día:', day, holidayInfo);
      
      let dayType = 'workday';
      let standardHours = 8;

      if (holidayInfo) {
        dayType = 'holiday';
        standardHours = 0;
      } else if (dayOfWeek === 0) {
        dayType = 'sunday';
        standardHours = 0;
      } else if (dayOfWeek === 6) {
        dayType = 'saturday';
        standardHours = 0;
      }

      // Usar el mismo formato que CalendarUtils para evitar problemas de timezone
      const year = day.getFullYear();
      const month = day.getMonth() + 1;
      const dayNum = day.getDate();
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

      return {
        employee_id: employeeId,
        year: year,
        month: month,
        date: dateStr,
        day_type: dayType,
        standard_hours: standardHours,
        actual_hours: standardHours,
        status: 'normal',
        holiday_info: holidayInfo,
        is_editable: isSameMonth(day, date),
        notes: ''
      };
    });
  }, []);

  const loadCalendarData = useCallback(async () => {
    if (!employee) return;

    setIsLoading(true);
    try {
      console.log('🔍 Cargando calendario para empleado:', employee.first_name, employee.last_name);
      console.log('   - Employee ID:', employee.id);
      console.log('   - Año:', year, '- Mes:', month);

      const existingData = await base44.entities.WorkCalendar.filter({
        employee_id: employee.id,
        year: year,
        month: month
      });

      console.log('📊 Registros existentes encontrados:', existingData);

      // Generar el calendario completo del mes
      const generatedDays = generateMonthCalendar(employee.id, currentDate);
      console.log('📅 Días generados para el mes:', generatedDays.length);

      // Crear un mapa de los días existentes
      const existingMap = new Map(existingData.map(day => [day.date, day]));

      // Identificar qué días faltan o tienen day_type incorrecto
      const missingDays = [];
      const daysToFix = [];
      const calendarDays = generatedDays.map(day => {
        const existing = existingMap.get(day.date);
        if (existing) {
          // Verificar si el day_type es correcto
          if (existing.day_type !== day.day_type || existing.standard_hours !== day.standard_hours) {
            console.log(`⚠️ Día ${day.date} tiene day_type incorrecto: ${existing.day_type} -> ${day.day_type}`);
            daysToFix.push({
              id: existing.id,
              day_type: day.day_type,
              standard_hours: day.standard_hours,
              holiday_info: day.holiday_info
            });
            // Devolver el día existente pero con los valores corregidos para mostrar
            return { ...existing, day_type: day.day_type, standard_hours: day.standard_hours, holiday_info: day.holiday_info };
          }
          return existing;
        } else {
          missingDays.push(day);
          return day;
        }
      });

      console.log('🆕 Días faltantes a crear:', missingDays.length);

      setCalendarData(calendarDays);
      setOriginalData(JSON.parse(JSON.stringify(calendarDays)));
      setHasChanges(false);

      // Verificar si el mes está certificado
      const confirmedDays = calendarDays.filter(day => day.is_confirmed);
      setIsMonthConfirmed(confirmedDays.length > 0 && confirmedDays.length === calendarDays.length);

      const stats = calculateMonthlyHours(calendarDays);
      setMonthlyStats(stats);

      // Auto-guardar los días que faltan usando bulkCreate
      if (missingDays.length > 0) {
        try {
          console.log(`💾 Guardando automáticamente ${missingDays.length} días faltantes usando bulkCreate...`);

          // Usar bulkCreate para crear todos los días de una vez
          await base44.entities.WorkCalendar.bulkCreate(missingDays);

          console.log('✅ TODOS los días guardados correctamente');

          // Recargar los datos para obtener los IDs correctos
          const verifyData = await base44.entities.WorkCalendar.filter({
            employee_id: employee.id,
            year: year,
            month: month
          });

          console.log('🔍 Verificación: registros después de guardar:', verifyData.length);

          const updatedMap = new Map(verifyData.map(day => [day.date, day]));
          const finalCalendarDays = generatedDays.map(day => updatedMap.get(day.date) || day);

          setCalendarData(finalCalendarDays);
          setOriginalData(JSON.parse(JSON.stringify(finalCalendarDays)));

          alert(`✅ Calendario creado automáticamente.\n\nSe guardaron ${missingDays.length} días con las horas estándar.\n\nAhora estas horas aparecerán en el Control Diario.`);
        } catch (error) {
          console.error('❌ Error al guardar días automáticamente:', error);
          alert(`⚠️ Error al guardar el calendario automáticamente.\n\nError: ${error.message}\n\nPor favor, inténtalo de nuevo o contacta al administrador.`);
        }
      } else {
        console.log('✨ El calendario ya está completo, no hay días que guardar');
      }

      // Corregir días con day_type incorrecto (ej: sábados/domingos marcados como workday con 8h)
      if (daysToFix.length > 0) {
        try {
          console.log(`🔧 Corrigiendo ${daysToFix.length} días con day_type incorrecto...`);

          // Actualizar en lotes de 10 para evitar rate limit
          const batchSize = 10;
          for (let i = 0; i < daysToFix.length; i += batchSize) {
            const batch = daysToFix.slice(i, i + batchSize);
            await Promise.all(batch.map(day => 
              base44.entities.WorkCalendar.update(day.id, {
                day_type: day.day_type,
                standard_hours: day.standard_hours,
                holiday_info: day.holiday_info
              })
            ));
            if (i + batchSize < daysToFix.length) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }

          console.log('✅ Días corregidos correctamente');

          // Recargar para reflejar cambios
          const verifyData = await base44.entities.WorkCalendar.filter({
            employee_id: employee.id,
            year: year,
            month: month
          });

          const updatedMap = new Map(verifyData.map(day => [day.date, day]));
          const finalCalendarDays = generatedDays.map(day => updatedMap.get(day.date) || day);

          setCalendarData(finalCalendarDays);
          setOriginalData(JSON.parse(JSON.stringify(finalCalendarDays)));

          const stats = calculateMonthlyHours(finalCalendarDays);
          setMonthlyStats(stats);

          alert(`✅ Se corrigieron ${daysToFix.length} días.\n\nLos sábados, domingos y festivos ahora tienen 0 horas estándar.`);
        } catch (error) {
          console.error('❌ Error al corregir días:', error);
        }
      }

    } catch (error) {
      console.error('❌ Error loading calendar data:', error);
      alert(`Error cargando el calendario: ${error.message}`);
    }
    setIsLoading(false);
  }, [employee, year, month, currentDate, generateMonthCalendar]);

  useEffect(() => {
    loadCalendarData();
  }, [loadCalendarData]);

  const handleDayUpdate = (dayIndex, field, value) => {
    const updatedData = [...calendarData];
    const day = { ...updatedData[dayIndex] };

    if (field === 'status') {
      switch (value) {
        case 'vacation':
        case 'sick_leave':
        case 'personal_matters':
          day.actual_hours = 8;
          break;
        case 'absence':
          day.actual_hours = 0;
          break;
        case 'normal':
          day.actual_hours = day.standard_hours;
          break;
        default:
          break;
      }
    }

    day[field] = value;
    updatedData[dayIndex] = day;
    
    setCalendarData(updatedData);
    setHasChanges(true);

    const stats = calculateMonthlyHours(updatedData);
    setMonthlyStats(stats);
  };

  const handleSaveChanges = async () => {
    if (!employee || !hasChanges) return;

    try {
      console.log('💾 Guardando cambios del calendario...');
      
      // Separar días a crear y actualizar
      const daysToCreate = calendarData.filter(day => !day.id);
      const daysToUpdate = calendarData.filter(day => day.id);

      console.log(`📊 Días a crear: ${daysToCreate.length}, Días a actualizar: ${daysToUpdate.length}`);

      // Crear nuevos días en batch si hay alguno
      if (daysToCreate.length > 0) {
        console.log('🆕 Creando días nuevos con bulkCreate...');
        await base44.entities.WorkCalendar.bulkCreate(daysToCreate);
      }

      // Actualizar días existentes en batch si hay alguno
      if (daysToUpdate.length > 0) {
        console.log('📝 Actualizando días existentes...');
        // Actualizar en lotes de 10 para evitar rate limit
        const batchSize = 10;
        for (let i = 0; i < daysToUpdate.length; i += batchSize) {
          const batch = daysToUpdate.slice(i, i + batchSize);
          await Promise.all(batch.map(day => base44.entities.WorkCalendar.update(day.id, day)));
          
          // Pequeña pausa entre batches si hay más
          if (i + batchSize < daysToUpdate.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }

      console.log('✅ Calendario guardado correctamente');

      // Recargar datos para obtener los IDs actualizados
      await loadCalendarData();
      
      alert('✅ Calendario guardado correctamente.\n\nLos cambios ahora aparecerán en el Control Diario.');
    } catch (error) {
      console.error('❌ Error saving calendar:', error);
      alert(`⚠️ Error al guardar el calendario.\n\nError: ${error.message}\n\nPor favor, inténtalo de nuevo.`);
    }
  };

  const handleResetChanges = () => {
    setCalendarData(JSON.parse(JSON.stringify(originalData)));
    setHasChanges(false);
    
    const stats = calculateMonthlyHours(originalData);
    setMonthlyStats(stats);
  };

  const navigateMonth = (direction) => {
    const newDate = direction === 'prev' 
      ? subMonths(currentDate, 1)
      : addMonths(currentDate, 1);
    setCurrentDate(newDate);
  };



  const handleRegenerateCalendar = async () => {
    if (!employee) return;

    const confirmAction = window.confirm(
      `¿Estás seguro de que quieres REGENERAR el calendario de ${currentMonth}?\n\n` +
      `Esto borrará todos los datos del calendario de este mes y los recreará con los valores estándar.\n` +
      `⚠️ Se perderán las horas reales introducidas.`
    );

    if (!confirmAction) return;

    setIsLoading(true);
    try {
      // Obtener todos los registros existentes para este mes
      const existingData = await base44.entities.WorkCalendar.filter({
        employee_id: employee.id,
        year: year,
        month: month
      });

      // Borrar todos los registros existentes
      if (existingData.length > 0) {
        console.log(`🗑️ Borrando ${existingData.length} registros existentes...`);
        const batchSize = 10;
        for (let i = 0; i < existingData.length; i += batchSize) {
          const batch = existingData.slice(i, i + batchSize);
          await Promise.all(batch.map(day => base44.entities.WorkCalendar.delete(day.id)));
          if (i + batchSize < existingData.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }

      // Generar y guardar el calendario nuevo
      const newCalendarDays = generateMonthCalendar(employee.id, currentDate);
      console.log(`📅 Creando ${newCalendarDays.length} nuevos registros...`);
      await base44.entities.WorkCalendar.bulkCreate(newCalendarDays);

      // Recargar datos
      await loadCalendarData();

      alert(`✅ Calendario regenerado correctamente.\n\nSe han creado ${newCalendarDays.length} días con los valores estándar.`);
    } catch (error) {
      console.error('❌ Error al regenerar calendario:', error);
      alert(`❌ Error al regenerar el calendario: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmMonth = async () => {
    if (!employee || hasChanges) return;

    const confirmAction = window.confirm(
      `¿Estás seguro de que quieres CERTIFICAR las horas de ${currentMonth}?\n\n` +
      `Esto marcará todas las horas del mes como verificadas y se usarán para:\n` +
      `• Cálculo de nóminas\n` +
      `• Certificaciones de proyectos\n\n` +
      `Una vez certificado, no se podrán modificar las horas.`
    );

    if (!confirmAction) return;

    try {
      const now = new Date().toISOString();
      const userEmail = currentUser?.email || 'unknown';

      // Actualizar todos los días del mes como confirmados
      const daysToConfirm = calendarData.filter(day => day.id);
      
      for (let i = 0; i < daysToConfirm.length; i += 10) {
        const batch = daysToConfirm.slice(i, i + 10);
        await Promise.all(batch.map(day => 
          base44.entities.WorkCalendar.update(day.id, {
            is_confirmed: true,
            confirmed_at: now,
            confirmed_by: userEmail
          })
        ));
        if (i + 10 < daysToConfirm.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      setIsMonthConfirmed(true);
      alert(`✅ Mes ${currentMonth} CERTIFICADO correctamente.\n\nLas horas ahora se usarán en nóminas y certificaciones de proyectos.`);
      
      await loadCalendarData();
    } catch (error) {
      console.error('Error confirming month:', error);
      alert(`❌ Error al certificar el mes: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <Card className="shadow-md border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => navigateMonth('prev')}>
                    <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-gray-500" />
                    <span className="font-semibold text-lg capitalize">{currentMonth}</span>
                    </div>
                    <Button variant="outline" onClick={() => navigateMonth('next')}>
                    <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
                <div className="flex gap-3">
                    <Button 
                    onClick={handleResetChanges} 
                    variant="outline" 
                    disabled={!hasChanges}
                    >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Resetear
                    </Button>
                    <Button 
                    onClick={handleSaveChanges}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={!hasChanges}
                    >
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                    </Button>

                    <Button 
                    onClick={handleConfirmMonth}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={hasChanges || isMonthConfirmed}
                    >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {isMonthConfirmed ? 'Mes Certificado' : 'Certificar Mes'}
                    </Button>
                    <Button 
                    onClick={handleRegenerateCalendar}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Regenerar
                    </Button>
                </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
             <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando calendario...</p>
             </div>
        ) : (
            <>
                {isMonthConfirmed && (
                  <Card className="border-2 border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-green-800">
                        <Lock className="w-5 h-5" />
                        <span className="font-semibold">Mes Certificado</span>
                        <Badge className="bg-green-600 text-white ml-2">Verificado</Badge>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        Las horas de este mes han sido certificadas y se usan para nóminas y certificaciones de proyectos.
                      </p>
                    </CardContent>
                  </Card>
                )}

                <MonthlyStats 
                    stats={monthlyStats}
                    employee={employee}
                    hasChanges={hasChanges}
                />
                <div className="grid lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3">
                    <CalendarGrid
                        calendarData={calendarData}
                        onDayUpdate={handleDayUpdate}
                        currentDate={currentDate}
                        projects={projects}
                    />
                    </div>
                    
                    <div className="space-y-6">
                        <CalendarLegend />
                        
                        {hasChanges && (
                            <Card className="border-2 border-amber-200 bg-amber-50">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 text-amber-800">
                                <Info className="w-4 h-4" />
                                <span className="font-medium">Cambios sin guardar</span>
                                </div>
                                <p className="text-sm text-amber-700 mt-1">
                                Recuerda guardar los cambios antes de cambiar de mes o empleado.
                                </p>
                            </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </>
        )}
    </div>
  );
}