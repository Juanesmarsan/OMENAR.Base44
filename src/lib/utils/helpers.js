
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    CheckCircle2, Circle, Clock, AlertCircle, Play, Plus
} from 'lucide-react';


import TaskCard from './TaskCard';
import MeetingCard from './MeetingCard';

export default function DailyWorkView({ 
    tasks, 
    meetings, 
    onTaskEdit, 
    onTaskStatusChange, 
    onTaskDelete, 
    onCreateTask, 
    onMeetingEdit,
    onMeetingDelete,
    currentUser,
    users,
    projects // Added projects prop
}) {
    const allItems = [
        ...tasks.map(t => ({...t, item_type: 'task'})), 
        ...meetings.map(m => ({...m, item_type: 'meeting'}))
    ].sort((a, b) => {
        const timeA = a.due_time || a.start_time || '00:00';
        const timeB = b.due_time || b.start_time || '00:00';
        return timeA.localeCompare(timeB);
    });

    const urgentItems = allItems.filter(item => item.priority === 'urgent' && !['completed', 'completada', 'cancelled', 'cancelada'].includes(item.status));
    const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
    const pendingItems = allItems.filter(item => ['todo', 'pending', 'programada', 'confirmada'].includes(item.status) && item.priority !== 'urgent');
    const completedItems = allItems.filter(item => ['completed', 'completada'].includes(item.status));

    const completionRate = allItems.length > 0 ? Math.round((completedItems.length / allItems.length) * 100) : 0;

    const renderItem = (item) => {
        if (item.item_type === 'task') {
            return (
                <TaskCard 
                    key={`task-${item.id}`}
                    task={item}
                    users={users}
                    projects={projects} // Pass projects prop to TaskCard
                    currentUser={currentUser}
                    onEdit={onTaskEdit}
                    onDelete={onTaskDelete}
                />
            );
        }
        if (item.item_type === 'meeting') {
             return (
                <MeetingCard 
                    key={`meeting-${item.id}`}
                    meeting={item}
                    users={users}
                    currentUser={currentUser}
                    onEdit={onMeetingEdit}
                    onDelete={onMeetingDelete}
                    onStatusChange={(meeting, status) => { /* Implement if needed */}}
                />
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
             {/* Progress Indicator */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold">Progreso del día</h3>
                        <span className="text-2xl font-bold text-blue-600">{completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${completionRate}%` }}
                        />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                        {completedItems.length} de {allItems.length} elementos completados
                    </p>
                </CardContent>
            </Card>

            {/* Tareas Urgentes */}
            {urgentItems.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="text-red-800 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            Urgente ({urgentItems.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {urgentItems.map(renderItem)}
                    </CardContent>
                </Card>
            )}

            {/* En Progreso */}
            {inProgressTasks.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Play className="w-5 h-5 text-blue-600" />
                            En Progreso ({inProgressTasks.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {inProgressTasks.map(item => renderItem(item))}
                    </CardContent>
                </Card>
            )}

            {/* Próximos */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-gray-600" />
                            Próximos ({pendingItems.length})
                        </CardTitle>
                        <Button onClick={onCreateTask} size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Nueva Tarea
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {pendingItems.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Circle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">¡Perfecto! No tienes nada pendiente para hoy.</p>
                            <Button onClick={onCreateTask} variant="outline" className="mt-4">
                                <Plus className="w-4 h-4 mr-2" />
                                Agregar Nueva Tarea
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           {pendingItems.map(renderItem)}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Completados */}
            {completedItems.length > 0 && (
                <Card className="bg-green-50/50">
                    <CardHeader>
                        <CardTitle className="text-green-800 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5" />
                            Completados ({completedItems.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {completedItems.map(renderItem)}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
