
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
    Calendar as CalendarIcon,
    MoreVertical,
    Edit,
    Trash2,
    CheckCircle2,
    Circle,
    Clock,
    XCircle
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function TaskCard({ task, users, projects, currentUser, onEdit, onDelete }) {
    const getPriorityBadge = (priority) => {
        const styles = {
            low: "bg-blue-100 text-blue-800 border-blue-200",
            medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
            high: "bg-orange-100 text-orange-800 border-orange-200",
            urgent: "bg-red-100 text-red-800 border-red-200"
        };
        const labels = { low: "Baja", medium: "Media", high: "Alta", urgent: "Urgente" };
        return <Badge className={`border ${styles[priority]}`}>{labels[priority]}</Badge>;
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: <Circle className="w-4 h-4 text-gray-400" />,
            in_progress: <Clock className="w-4 h-4 text-blue-500" />,
            completed: <CheckCircle2 className="w-4 h-4 text-green-500" />,
            cancelled: <XCircle className="w-4 h-4 text-red-500" />
        };
        const labels = { pending: "Pendiente", in_progress: "En Progreso", completed: "Completada", cancelled: "Cancelada" };
        return <div className="flex items-center gap-2 text-sm"><span className="flex-shrink-0">{icons[status]}</span> {labels[status]}</div>;
    };
    
    const owner = users.find(u => u.email === task.owner_email);
    const sharedUsers = users.filter(u => task.shared_with_emails?.includes(u.email));
    const project = projects?.find(p => p.id === task.project_id);

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                        <CardTitle className={`text-lg font-semibold ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                            {task.title}
                        </CardTitle>
                        {currentUser.email === task.owner_email && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="flex-shrink-0 -mt-2 -mr-2">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onEdit(task)}>
                                        <Edit className="w-4 h-4 mr-2" /> Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-red-600">
                                        <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500 pt-2">
                        {getStatusIcon(task.status)}
                        {getPriorityBadge(task.priority)}
                    </div>
                    {project && (
                        <div className="pt-2">
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                📁 {project.code} - {project.name}
                            </Badge>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                    {task.description && (
                        <p className="text-sm text-gray-600 line-clamp-3">{task.description}</p>
                    )}
                    {task.due_date && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            <span>Vence {formatDistanceToNow(new Date(task.due_date), { addSuffix: true, locale: es })}</span>
                        </div>
                    )}
                </CardContent>
                <div className="p-4 border-t mt-auto">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                            Creado {formatDistanceToNow(new Date(task.created_date), { addSuffix: true, locale: es })}
                        </span>
                        <div className="flex items-center -space-x-2">
                             <TooltipProvider>
                                {owner && (
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Avatar className="w-8 h-8 border-2 border-blue-500">
                                                <AvatarFallback>{getInitials(owner.full_name)}</AvatarFallback>
                                            </Avatar>
                                        </TooltipTrigger>
                                        <TooltipContent>Propietario: {owner.full_name}</TooltipContent>
                                    </Tooltip>
                                )}
                                {sharedUsers.map(user => (
                                    <Tooltip key={user.id}>
                                        <TooltipTrigger>
                                            <Avatar className="w-8 h-8 border-2 border-white">
                                                <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                                            </Avatar>
                                        </TooltipTrigger>
                                        <TooltipContent>Compartido con: {user.full_name}</TooltipContent>
                                    </Tooltip>
                                ))}
                            </TooltipProvider>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
