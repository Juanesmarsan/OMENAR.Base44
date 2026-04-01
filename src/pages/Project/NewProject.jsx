
import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Download, Calendar, TrendingUp, User, Clock } from "lucide-react";
import { format, endOfWeek, startOfMonth, endOfMonth, eachWeekOfInterval, getWeek, isWithinInterval } from "date-fns";
import { es } from "date-fns/locale";

export default function WorkHoursReport({ onClose }) {
    const [employees, setEmployees] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
    const [viewMode, setViewMode] = useState('month'); // 'month' o 'week'
    const [weeklyData, setWeeklyData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [selectedMonth]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Cargar empleados y calendario laboral (la fuente de verdad)
            const [allEmployees, allCalendarData] = await Promise.all([
                base44.entities.Employee.filter({ status: 'active' }),
                base44.entities.WorkCalendar.list()
            ]);

            console.log('📊 Total de registros de calendario cargados:', allCalendarData.length);

            setEmployees(allEmployees);
            
            // Filtrar calendario del mes seleccionado
            const [year, month] = selectedMonth.split('-');
            const monthStart = startOfMonth(new Date(parseInt(year), parseInt(month) - 1));
            const monthEnd = endOfMonth(monthStart);
            const today = new Date();
            today.setHours(23, 59, 59, 999); // Incluir todo el día de hoy
            
            // SOLO días que ya se han cumplido (pasados + hoy)
            const monthCalendar = allCalendarData.filter(c => {
                const calDate = new Date(c.date);
                return calDate >= monthStart && 
                       calDate <= monthEnd && 
                       calDate <= today && // ⭐ SOLO DÍAS CUMPLIDOS
                       c.status === 'normal';
            });

            console.log('📅 Registros de calendario del mes seleccionado (solo días cumplidos):', monthCalendar.length);
            console.log('👥 Empleados activos:', allEmployees.length);
            console.log('📆 Hoy:', format(today, 'yyyy-MM-dd'));

            // Calcular datos por semana
            calculateWeeklyData(monthCalendar, allEmployees, monthStart, monthEnd, today);
            
            // Calcular datos por mes
            calculateMonthlyData(monthCalendar, allEmployees);

        } catch (error) {
            console.error("Error loading work hours data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateWeeklyData = (monthCalendar, allEmployees, monthStart, monthEnd, today) => {
        const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { locale: es });
        
        const weeklyStats = weeks.map((weekStartDate) => {
            const weekEndDate = endOfWeek(weekStartDate, { locale: es });
            const weekNumber = getWeek(weekStartDate, { locale: es });
            
            const employeeHours = allEmployees.map(emp => {
                // SOLO días cumplidos de esta semana (monthCalendar ya está filtrado por hoy)
                const employeeCalendar = monthCalendar.filter(c => 
                    c.employee_id === emp.id &&
                    isWithinInterval(new Date(c.date), { start: weekStartDate, end: weekEndDate })
                );
                
                const totalHours = employeeCalendar.reduce((sum, c) => {
                    const hours = parseFloat(c.actual_hours) || 0;
                    return sum + hours;
                }, 0);
                
                const daysWorked = employeeCalendar.length;
                
                return {
                    employeeName: `${emp.first_name} ${emp.last_name}`,
                    totalHours: totalHours,
                    daysWorked: daysWorked,
                    avgHoursPerDay: daysWorked > 0 ? (totalHours / daysWorked).toFixed(1) : 0
                };
            });

            return {
                weekNumber: weekNumber,
                weekStart: format(weekStartDate, 'd MMM', { locale: es }),
                weekEnd: format(weekEndDate, 'd MMM', { locale: es }),
                employees: employeeHours,
                totalHours: employeeHours.reduce((sum, e) => sum + e.totalHours, 0)
            };
        });

        setWeeklyData(weeklyStats);
    };

    const calculateMonthlyData = (monthCalendar, allEmployees) => {
        const monthlyStats = allEmployees.map(emp => {
            // SOLO días cumplidos y trabajados normalmente (monthCalendar ya está filtrado por hoy)
            const employeeCalendar = monthCalendar.filter(c => c.employee_id === emp.id);
            
            console.log(`👤 ${emp.first_name} ${emp.last_name}:`, employeeCalendar.length, 'días cumplidos en calendario');
            
            const totalHours = employeeCalendar.reduce((sum, c) => {
                const hours = Number(c.actual_hours) || 0;
                console.log(`   - Calendario ${c.date}: ${hours}h (tipo: ${typeof c.actual_hours}, valor: ${c.actual_hours})`);
                return sum + hours;
            }, 0);
            
            const daysWorked = employeeCalendar.length;
            const avgHoursPerDay = daysWorked > 0 ? (totalHours / daysWorked).toFixed(1) : 0;
            
            // Calcular horas esperadas (8h x días REALMENTE trabajados)
            const expectedHours = daysWorked * 8;
            const difference = totalHours - expectedHours;
            
            console.log(`   ✅ Total: ${totalHours}h en ${daysWorked} días cumplidos`);
            
            return {
                employeeId: emp.id,
                employeeName: `${emp.first_name} ${emp.last_name}`,
                position: emp.position,
                totalHours: totalHours,
                daysWorked: daysWorked,
                avgHoursPerDay: avgHoursPerDay,
                expectedHours: expectedHours,
                difference: difference,
                differencePercent: expectedHours > 0 ? ((difference / expectedHours) * 100).toFixed(1) : 0
            };
        });

        const sorted = monthlyStats.sort((a, b) => b.totalHours - a.totalHours);
        console.log('📊 Resumen mensual calculado (solo días cumplidos):', sorted);
        setMonthlyData(sorted);
    };

    const exportToCSV = () => {
        const [year, month] = selectedMonth.split('-');
        const monthName = format(new Date(parseInt(year), parseInt(month) - 1), 'MMMM yyyy', { locale: es });
        
        let csvContent = `Reporte de Horas Trabajadas - ${monthName}\n\n`;
        
        if (viewMode === 'month') {
            csvContent += `Empleado,Puesto,Días Trabajados,Horas Totales,Promedio Horas/Día,Horas Esperadas,Diferencia\n`;
            monthlyData.forEach(emp => {
                csvContent += `"${emp.employeeName}","${emp.position}",${emp.daysWorked},${emp.totalHours},${emp.avgHoursPerDay},${emp.expectedHours},${emp.difference}\n`;
            });
        } else {
            weeklyData.forEach(week => {
                csvContent += `\nSemana ${week.weekNumber} (${week.weekStart} - ${week.weekEnd})\n`;
                csvContent += `Empleado,Días,Horas,Promedio/Día\n`;
                week.employees.forEach(emp => {
                    csvContent += `"${emp.employeeName}",${emp.daysWorked},${emp.totalHours},${emp.avgHoursPerDay}\n`;
                });
            });
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `reporte-horas-${selectedMonth}.csv`;
        link.click();
    };

    const getTotalMonthHours = () => monthlyData.reduce((sum, emp) => sum + emp.totalHours, 0);
    const getAvgMonthHours = () => {
        const total = getTotalMonthHours();
        return monthlyData.length > 0 ? (total / monthlyData.length).toFixed(1) : 0;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
                <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-blue-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                                Reporte de Horas Trabajadas
                            </CardTitle>
                            <p className="text-sm text-gray-600 mt-1">
                                Basado en días cumplidos del Calendario Laboral (hasta hoy)
                            </p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-6 overflow-y-auto flex-1">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Calculando horas trabajadas...</p>
                        </div>
                    ) : (
                        <>
                            {/* Controles */}
                            <div className="flex flex-wrap justify-between items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-gray-600" />
                                        <input
                                            type="month"
                                            value={selectedMonth}
                                            onChange={(e) => setSelectedMonth(e.target.value)}
                                            className="px-3 py-2 border rounded-lg"
                                        />
                                    </div>
                                    <Select value={viewMode} onValueChange={setViewMode}>
                                        <SelectTrigger className="w-48">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="month">Vista Mensual</SelectItem>
                                            <SelectItem value="week">Vista Semanal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={exportToCSV} variant="outline">
                                    <Download className="w-4 h-4 mr-2" />
                                    Exportar CSV
                                </Button>
                            </div>

                            {/* Resumen general */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-blue-600 font-medium">Total Empleados</p>
                                                <p className="text-2xl font-bold text-blue-900">{monthlyData.length}</p>
                                            </div>
                                            <User className="w-8 h-8 text-blue-600" />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-green-600 font-medium">Total Horas</p>
                                                <p className="text-2xl font-bold text-green-900">{getTotalMonthHours().toFixed(1)}h</p>
                                            </div>
                                            <Clock className="w-8 h-8 text-green-600" />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-purple-600 font-medium">Promedio/Empleado</p>
                                                <p className="text-2xl font-bold text-purple-900">{getAvgMonthHours()}h</p>
                                            </div>
                                            <TrendingUp className="w-8 h-8 text-purple-600" />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-0">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-amber-600 font-medium">Mes Seleccionado</p>
                                                <p className="text-lg font-bold text-amber-900 capitalize">
                                                    {format(new Date(selectedMonth), 'MMMM yyyy', { locale: es })}
                                                </p>
                                            </div>
                                            <Calendar className="w-8 h-8 text-amber-600" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Vista Mensual */}
                            {viewMode === 'month' && (
                                <Card className="shadow-md">
                                    <CardHeader>
                                        <CardTitle>Resumen Mensual por Empleado</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                                                        <th className="text-left p-3 font-semibold">Empleado</th>
                                                        <th className="text-left p-3 font-semibold">Puesto</th>
                                                        <th className="text-center p-3 font-semibold">Días</th>
                                                        <th className="text-center p-3 font-semibold">Horas Totales</th>
                                                        <th className="text-center p-3 font-semibold">Promedio/Día</th>
                                                        <th className="text-center p-3 font-semibold">Horas Esperadas</th>
                                                        <th className="text-center p-3 font-semibold">Diferencia</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {monthlyData.map((emp) => (
                                                        <tr key={emp.employeeId} className="border-b hover:bg-gray-50">
                                                            <td className="p-3 font-medium">{emp.employeeName}</td>
                                                            <td className="p-3 text-gray-600">{emp.position}</td>
                                                            <td className="p-3 text-center">{emp.daysWorked}</td>
                                                            <td className="p-3 text-center font-bold text-blue-600">{emp.totalHours.toFixed(1)}h</td>
                                                            <td className="p-3 text-center">{emp.avgHoursPerDay}h</td>
                                                            <td className="p-3 text-center text-gray-500">{emp.expectedHours}h</td>
                                                            <td className="p-3 text-center">
                                                                <Badge className={
                                                                    emp.difference >= 0 
                                                                        ? 'bg-green-100 text-green-800 border-green-200' 
                                                                        : 'bg-red-100 text-red-800 border-red-200'
                                                                }>
                                                                    {emp.difference >= 0 ? '+' : ''}{emp.difference.toFixed(1)}h ({emp.differencePercent}%)
                                                                </Badge>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Vista Semanal */}
                            {viewMode === 'week' && (
                                <div className="space-y-6">
                                    {weeklyData.map((week, idx) => (
                                        <Card key={idx} className="shadow-md">
                                            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                                                <CardTitle className="flex items-center justify-between">
                                                    <span>Semana {week.weekNumber}</span>
                                                    <span className="text-sm font-normal text-gray-600">
                                                        {week.weekStart} - {week.weekEnd}
                                                    </span>
                                                </CardTitle>
                                                <p className="text-sm text-gray-600">
                                                    Total de la semana: <span className="font-bold text-blue-600">{week.totalHours.toFixed(1)}h</span>
                                                </p>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full">
                                                        <thead>
                                                            <tr className="border-b bg-gray-50">
                                                                <th className="text-left p-3">Empleado</th>
                                                                <th className="text-center p-3">Días</th>
                                                                <th className="text-center p-3">Horas Totales</th>
                                                                <th className="text-center p-3">Promedio/Día</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {week.employees.map((emp, empIdx) => (
                                                                <tr key={empIdx} className="border-b hover:bg-gray-50">
                                                                    <td className="p-3">{emp.employeeName}</td>
                                                                    <td className="p-3 text-center">{emp.daysWorked}</td>
                                                                    <td className="p-3 text-center font-bold text-blue-600">{emp.totalHours.toFixed(1)}h</td>
                                                                    <td className="p-3 text-center">{emp.avgHoursPerDay}h</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
