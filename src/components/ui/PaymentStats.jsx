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
    MapPin,
    Video,
    Phone,
    Users,
    CheckCircle2,
    Circle,
    Play,
    XCircle,
    AlertCircle
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MeetingCard({ meeting, users, currentUser, onEdit, onDelete, onStatusChange }) {
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
            programada: <Circle className="w-4 h-4 text-gray-400" />,
            confirmada: <CheckCircle2 className="w-4 h-4 text-green-500" />,
            en_curso: <Play className="w-4 h-4 text-blue-500" />,
            completada: <CheckCircle2 className="w-4 h-4 text-green-600" />,
            cancelada: <XCircle className="w-4 h-4 text-red-500" />,
            pospuesta: <AlertCircle className="w-4 h-4 text-yellow-500" />
        };
        const labels = { 
            programada: "Programada", 
            confirmada: "Confirmada", 
            en_curso: "En Curso", 
            completada: "Completada", 
            cancelada: "Cancelada", 
            pospuesta: "Pospuesta" 
        };
        return <div className="flex items-center gap-2 text-sm"><span className="flex-shrink-0">{icons[status]}</span> {labels[status]}</div>;
    };

    const getMeetingTypeIcon = (type) => {
        switch(type) {
            case 'presencial': return <MapPin className="w-4 h-4 text-green-600" />;
            case 'videoconferencia': return <Video className="w-4 h-4 text-blue-600" />;
            case 'telefonica': return <Phone className="w-4 h-4 text-purple-600" />;
            default: return <Users className="w-4 h-4 text-gray-600" />;
        }
    };
    
    const owner = users.find(u => u.email === meeting.owner_email);
    const attendeeUsers = users.filter(u => meeting.attendees?.includes(u.email));
    
    const isOwner = meeting.owner_email === currentUser?.email;
    const isAttendee = meeting.attendees?.includes(currentUser?.email);

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const getMeetingDateTime = () => {
        if (!meeting.meeting_date) return '';
        const date = new Date(meeting.meeting_date);
        const today = new Date();
        
        if (date.toDateString() === today.toDateString()) {
            return `Hoy ${meeting.start_time}${meeting.end_time ? ` - ${meeting.end_time}` : ''}`;
        }
        
        return `${format(date, "d 'de' MMM", { locale: es })} ${meeting.start_time}${meeting.end_time ? ` - ${meeting.end_time}` : ''}`;
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
                        <CardTitle className={`text-lg font-semibold ${meeting.status === 'completada' ? 'line-through text-gray-400' : meeting.status === 'cancelada' ? 'line-through text-red-400' : 'text-gray-900'}`}>
                            {meeting.title}
                        </CardTitle>
                        {isOwner && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="flex-shrink-0 -mt-2 -mr-2">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onEdit(meeting)}>
                                        <Edit className="w-4 h-4 mr-2" /> Editar
                                    </DropdownMenuItem>
                                    {meeting.status === 'programada' && (
                                        <DropdownMenuItem onClick={() => onStatusChange(meeting, 'confirmada')}>
                                            <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" /> Confirmar
                                        </DropdownMenuItem>
                                    )}
                                    {meeting.status === 'confirmada' && (
                                        <DropdownMenuItem onClick={() => onStatusChange(meeting, 'en_curso')}>
                                            <Play className="w-4 h-4 mr-2 text-blue-600" /> Iniciar
                                        </DropdownMenuItem>
                                    )}
                                    {meeting.status === 'en_curso' && (
                                        <DropdownMenuItem onClick={() => onStatusChange(meeting, 'completada')}>
                                            <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" /> Completar
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={() => onDelete(meeting.id)} className="text-red-600">
                                        <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500 pt-2">
                        {getStatusIcon(meeting.status)}
                        <div className="flex items-center gap-2">
                            {getPriorityBadge(meeting.priority)}
                            {getMeetingTypeIcon(meeting.meeting_type)}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                    {meeting.description && (
                        <p className="text-sm text-gray-600 line-clamp-3">{meeting.description}</p>
                    )}
                    
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            <span>{getMeetingDateTime()}</span>
                        </div>
                        
                        {(meeting.location || meeting.meeting_link) && (
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                {meeting.meeting_type === 'presencial' ? (
                                    <>
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span>{meeting.location}</span>
                                    </>
                                ) : (
                                    <>
                                        <Video className="w-4 h-4 text-gray-400" />
                                        <span className="truncate">
                                            {meeting.meeting_link ? (
                                                <a 
                                                    href={meeting.meeting_link} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    Enlace de reunión
                                                </a>
                                            ) : 'Videoconferencia'}
                                        </span>
                                    </>
                                )}
                            </div>
                        )}

                        {attendeeUsers.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span>{attendeeUsers.length} asistente{attendeeUsers.length > 1 ? 's' : ''}</span>
                            </div>
                        )}
                    </div>

                    {meeting.notes && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-600">
                                <strong>Notas:</strong> {meeting.notes}
                            </p>
                        </div>
                    )}
                </CardContent>
                <div className="p-4 border-t mt-auto">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                            {!isOwner && isAttendee && <span className="text-blue-600 font-medium">Invitado • </span>}
                            {!isOwner && !isAttendee && <span className="text-purple-600 font-medium">Compartido • </span>}
                            Creado {formatDistanceToNow(new Date(meeting.created_date), { addSuffix: true, locale: es })}
                        </span>
                        <div className="flex items-center -space-x-2">
                             <TooltipProvider>
                                {owner && (
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Avatar className="w-8 h-8 border-2 border-green-500">
                                                <AvatarFallback>{getInitials(owner.full_name)}</AvatarFallback>
                                            </Avatar>
                                        </TooltipTrigger>
                                        <TooltipContent>Organizador: {owner.full_name}</TooltipContent>
                                    </Tooltip>
                                )}
                                {attendeeUsers.slice(0, 3).map(user => (
                                    <Tooltip key={user.id}>
                                        <TooltipTrigger>
                                            <Avatar className="w-8 h-8 border-2 border-white">
                                                <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                                            </Avatar>
                                        </TooltipTrigger>
                                        <TooltipContent>Asistente: {user.full_name}</TooltipContent>
                                    </Tooltip>
                                ))}
                                {attendeeUsers.length > 3 && (
                                    <div className="w-8 h-8 border-2 border-white rounded-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-xs font-medium text-gray-600">
                                            +{attendeeUsers.length - 3}
                                        </span>
                                    </div>
                                )}
                            </TooltipProvider>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}