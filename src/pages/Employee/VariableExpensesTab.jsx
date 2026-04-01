import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, Users, X, Check, MapPin, Video, Phone, UserPlus } from "lucide-react";

export default function MeetingForm({ meeting, users, currentUser, onSubmit, onCancel, defaultDate }) {
    const [formData, setFormData] = useState(meeting || {
        title: "",
        description: "",
        meeting_date: defaultDate ? defaultDate.toISOString().split('T')[0] : "",
        start_time: "",
        end_time: "",
        location: "",
        meeting_type: "presencial",
        priority: "medium",
        status: "programada",
        attendees: [],
        shared_with_emails: [],
        meeting_link: "",
        notes: "",
        reminder_minutes: 15
    });
    
    const [openAttendeeSelector, setOpenAttendeeSelector] = useState(false);
    const [openSharedSelector, setOpenSharedSelector] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const handleAttendeeSelect = (email) => {
        const currentAttendees = formData.attendees || [];
        if (currentAttendees.includes(email)) {
            setFormData({...formData, attendees: currentAttendees.filter(e => e !== email)});
        } else {
            setFormData({...formData, attendees: [...currentAttendees, email]});
        }
    };

    const handleSharedSelect = (email) => {
        const currentShared = formData.shared_with_emails || [];
        if (currentShared.includes(email)) {
            setFormData({...formData, shared_with_emails: currentShared.filter(e => e !== email)});
        } else {
            setFormData({...formData, shared_with_emails: [...currentShared, email]});
        }
    };
    
    const otherUsers = users.filter(u => u.email !== currentUser.email);
    const selectedAttendees = users.filter(u => formData.attendees?.includes(u.email));
    const selectedShared = users.filter(u => formData.shared_with_emails?.includes(u.email));

    const timeSlots = [];
    for (let hour = 7; hour <= 20; hour++) {
        for (let minutes of ['00', '15', '30', '45']) {
            timeSlots.push(`${hour.toString().padStart(2, '0')}:${minutes}`);
        }
    }

    const meetingTypeIcons = {
        presencial: <MapPin className="w-4 h-4" />,
        videoconferencia: <Video className="w-4 h-4" />,
        telefonica: <Phone className="w-4 h-4" />,
        mixta: <Users className="w-4 h-4" />
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
        >
            <Card className="w-full shadow-2xl border-0">
                <CardHeader className="border-b bg-gradient-to-r from-green-50 to-blue-50">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl text-green-800">
                            <Users className="w-6 h-6 inline mr-2" />
                            {meeting ? 'Editar Reunión' : 'Nueva Reunión'}
                        </CardTitle>
                        <Button variant="ghost" size="icon" onClick={onCancel}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Información básica */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Título de la reunión *</label>
                                <Input
                                    required
                                    placeholder="Ej: Reunión semanal de proyecto"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="text-lg font-semibold"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha *</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.meeting_date ? format(new Date(formData.meeting_date), 'PPP', { locale: es }) : 'Seleccionar fecha'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={formData.meeting_date ? new Date(formData.meeting_date) : undefined}
                                            onSelect={(date) => setFormData({ ...formData, meeting_date: date?.toISOString().split('T')[0] })}
                                            locale={es}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Hora inicio *</label>
                                    <Select value={formData.start_time} onValueChange={(value) => setFormData({...formData, start_time: value})}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Inicio" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-60">
                                            {timeSlots.map((time) => (
                                                <SelectItem key={time} value={time}>{time}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Hora fin *</label>
                                    <Select value={formData.end_time} onValueChange={(value) => setFormData({...formData, end_time: value})}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Fin" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-60">
                                            {timeSlots.map((time) => (
                                                <SelectItem key={time} value={time}>{time}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Descripción */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción o agenda</label>
                            <Textarea
                                placeholder="Describe el propósito y agenda de la reunión..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="h-24"
                            />
                        </div>

                        {/* Tipo y configuración */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de reunión</label>
                                <Select value={formData.meeting_type} onValueChange={(value) => setFormData({...formData, meeting_type: value})}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="presencial">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                Presencial
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="videoconferencia">
                                            <div className="flex items-center gap-2">
                                                <Video className="w-4 h-4" />
                                                Videoconferencia
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="telefonica">
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4" />
                                                Telefónica
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="mixta">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4" />
                                                Mixta
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
                                <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Prioridad" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Baja</SelectItem>
                                        <SelectItem value="medium">Media</SelectItem>
                                        <SelectItem value="high">Alta</SelectItem>
                                        <SelectItem value="urgent">Urgente</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="programada">Programada</SelectItem>
                                        <SelectItem value="confirmada">Confirmada</SelectItem>
                                        <SelectItem value="en_curso">En Curso</SelectItem>
                                        <SelectItem value="completada">Completada</SelectItem>
                                        <SelectItem value="cancelada">Cancelada</SelectItem>
                                        <SelectItem value="pospuesta">Pospuesta</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Ubicación/Enlace */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {formData.meeting_type === 'presencial' ? 'Ubicación' : 'Enlace de reunión'}
                                </label>
                                <Input
                                    placeholder={
                                        formData.meeting_type === 'presencial' 
                                            ? "Ej: Sala de reuniones A, Oficina central" 
                                            : "Ej: https://meet.google.com/xxx-xxx-xxx"
                                    }
                                    value={formData.meeting_type === 'presencial' ? formData.location : formData.meeting_link}
                                    onChange={(e) => {
                                        if (formData.meeting_type === 'presencial') {
                                            setFormData({ ...formData, location: e.target.value });
                                        } else {
                                            setFormData({ ...formData, meeting_link: e.target.value });
                                        }
                                    }}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Recordatorio</label>
                                <Select 
                                    value={formData.reminder_minutes?.toString()} 
                                    onValueChange={(value) => setFormData({...formData, reminder_minutes: parseInt(value)})}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Recordatorio" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5 minutos antes</SelectItem>
                                        <SelectItem value="15">15 minutos antes</SelectItem>
                                        <SelectItem value="30">30 minutos antes</SelectItem>
                                        <SelectItem value="60">1 hora antes</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Asistentes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Asistentes</label>
                            <Popover open={openAttendeeSelector} onOpenChange={setOpenAttendeeSelector}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        {selectedAttendees.length > 0 ? `${selectedAttendees.length} asistente(s) seleccionado(s)` : "Seleccionar asistentes..."}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                    <Command>
                                        <CommandInput placeholder="Buscar usuario..." />
                                        <CommandEmpty>No se encontraron usuarios.</CommandEmpty>
                                        <CommandGroup>
                                            {otherUsers.map(user => (
                                                <CommandItem
                                                    key={user.id}
                                                    onSelect={() => handleAttendeeSelect(user.email)}
                                                    className="flex items-center justify-between"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="w-6 h-6"><AvatarFallback>{getInitials(user.full_name)}</AvatarFallback></Avatar>
                                                        <span>{user.full_name}</span>
                                                    </div>
                                                    {formData.attendees?.includes(user.email) && <Check className="w-4 h-4" />}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            {selectedAttendees.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedAttendees.map(user => (
                                        <Badge key={user.id} variant="secondary" className="flex items-center gap-1">
                                            {user.full_name}
                                            <X 
                                                className="w-3 h-3 cursor-pointer" 
                                                onClick={() => handleAttendeeSelect(user.email)}
                                            />
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Compartir con */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Compartir acceso con</label>
                            <Popover open={openSharedSelector} onOpenChange={setOpenSharedSelector}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <Users className="mr-2 h-4 w-4" />
                                        {selectedShared.length > 0 ? `${selectedShared.length} usuario(s) con acceso` : "Seleccionar usuarios con acceso..."}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                    <Command>
                                        <CommandInput placeholder="Buscar usuario..." />
                                        <CommandEmpty>No se encontraron usuarios.</CommandEmpty>
                                        <CommandGroup>
                                            {otherUsers.map(user => (
                                                <CommandItem
                                                    key={user.id}
                                                    onSelect={() => handleSharedSelect(user.email)}
                                                    className="flex items-center justify-between"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="w-6 h-6"><AvatarFallback>{getInitials(user.full_name)}</AvatarFallback></Avatar>
                                                        <span>{user.full_name}</span>
                                                    </div>
                                                    {formData.shared_with_emails?.includes(user.email) && <Check className="w-4 h-4" />}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Notas */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Notas adicionales</label>
                            <Textarea
                                placeholder="Notas internas o preparación para la reunión..."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="h-20"
                            />
                        </div>

                        {/* Botones */}
                        <div className="flex justify-end gap-4 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={onCancel} className="px-6">
                                Cancelar
                            </Button>
                            <Button type="submit" className="bg-green-600 hover:bg-green-700 px-6">
                                {meeting ? 'Actualizar Reunión' : 'Crear Reunión'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
}