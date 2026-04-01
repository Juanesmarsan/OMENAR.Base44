import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Users, ClipboardCheck } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { es } from "date-fns/locale";

export default function AgendaCalendar({ 
    tasks,
    meetings, 
    currentDate, 
    selectedDate, 
    onDateSelect, 
    onDateChange, 
    onCreateTask,
    onCreateMeeting,
    onTaskClick,
    onMeetingClick,
    getItemsForDate 
}) {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const navigateMonth = (direction) => {
        const newDate = direction === 'prev' 
            ? subMonths(currentDate, 1)
            : addMonths(currentDate, 1);
        onDateChange(newDate);
    };

    const getDayItemsCount = (date) => {
        if (typeof getItemsForDate !== 'function') return 0;
        return getItemsForDate(date).length;
    };

    const getDayHighPriorityCount = (date) => {
        if (typeof getItemsForDate !== 'function') return 0;
        const items = getItemsForDate(date);
        return items.filter(item => 
            item.priority === 'high' || item.priority === 'urgent'
        ).length;
    };

    const isToday = (date) => {
        return isSameDay(date, new Date());
    };

    const getDayClasses = (date) => {
        let classes = "min-h-[120px] p-2 border border-gray-200 cursor-pointer transition-all duration-200 hover:bg-blue-50 flex flex-col ";
        
        if (!isSameMonth(date, currentDate)) {
            classes += "bg-gray-50 text-gray-400 ";
        } else {
            classes += "bg-white ";
        }
        
        if (isSameDay(date, selectedDate)) {
            classes += "ring-2 ring-blue-500 bg-blue-100 ";
        }
        
        if (isToday(date)) {
            classes += "border-blue-300 ";
        }
        
        const itemsCount = getDayItemsCount(date);
        if (itemsCount > 0) {
            classes += "hover:bg-green-50 ";
        }
        
        return classes;
    };
    
    const renderItemIndicator = (item) => {
        const isTask = !!item.due_date;
        const priority = item.priority;
        let bgColor, textColor, icon;

        if (isTask) {
            icon = <ClipboardCheck className="w-3 h-3 flex-shrink-0" />;
            switch(priority) {
                case 'urgent': bgColor = 'bg-red-100'; textColor = 'text-red-800'; break;
                case 'high': bgColor = 'bg-orange-100'; textColor = 'text-orange-800'; break;
                default: bgColor = 'bg-blue-100'; textColor = 'text-blue-800'; break;
            }
        } else { // It's a meeting
            icon = <Users className="w-3 h-3 flex-shrink-0" />;
            switch(priority) {
                case 'urgent': bgColor = 'bg-red-200'; textColor = 'text-red-900'; break;
                case 'high': bgColor = 'bg-orange-200'; textColor = 'text-orange-900'; break;
                default: bgColor = 'bg-green-100'; textColor = 'text-green-800'; break;
            }
        }

        return (
             <div
                key={item.id}
                className={`text-xs p-1 rounded truncate flex items-center gap-1 ${bgColor} ${textColor}`}
                title={item.title}
                onClick={(e) => {
                    e.stopPropagation();
                    isTask ? onTaskClick(item) : onMeetingClick(item);
                }}
            >
                {icon}
                <span className="truncate">{item.title}</span>
            </div>
        );
    };

    return (
        <Card className="shadow-md border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-2xl font-bold capitalize">
                    {format(currentDate, "MMMM yyyy", { locale: es })}
                </CardTitle>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={() => {
                            const today = new Date();
                            onDateChange(today);
                            onDateSelect(today);
                        }}
                        className="px-4"
                    >
                        Hoy
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-7 gap-0 border-b border-t">
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day) => (
                        <div key={day} className="p-3 text-center text-sm font-semibold text-gray-700 bg-gray-50 border-r last:border-r-0">
                            {day}
                        </div>
                    ))}
                </div>
                
                <div className="grid grid-cols-7 gap-0">
                    {calendarDays.map((date) => {
                        const dayItems = typeof getItemsForDate === 'function' ? getItemsForDate(date) : [];
                        const itemsCount = dayItems.length;
                        const highPriorityCount = getDayHighPriorityCount(date);
                        
                        return (
                            <div
                                key={date.toISOString()}
                                className={getDayClasses(date)}
                                onClick={() => onDateSelect(date)}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className={`text-sm ${isToday(date) ? 'text-blue-600 font-bold' : ''}`}>
                                        {format(date, 'd')}
                                    </span>
                                    {isSameMonth(date, currentDate) && (
                                        <div className="flex items-center">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="w-5 h-5 p-0 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => { e.stopPropagation(); onCreateMeeting(date); }}
                                            >
                                                <Users className="w-3 h-3" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="w-5 h-5 p-0 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => { e.stopPropagation(); onCreateTask(date); }}
                                            >
                                                <Plus className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="space-y-1 flex-grow overflow-hidden">
                                    {dayItems.slice(0, 3).map(item => renderItemIndicator(item))}
                                    
                                    {itemsCount > 3 && (
                                        <div className="text-xs text-gray-600 font-medium pt-1">
                                            +{itemsCount - 3} más
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}