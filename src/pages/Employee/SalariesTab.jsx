import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getUsers } from "@/functions/getUsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, Users, X, Check } from "lucide-react";

export default function TaskForm({ task, users: usersFromProps, projects, currentUser, onSubmit, onCancel, defaultDate }) {
    const [formData, setFormData] = useState(task || {
        title: "",
        description: "",
        status: "pending",
        priority: "medium",
        due_date: defaultDate ? defaultDate.toISOString().split('T')[0] : "",
        shared_with_emails: [],
        project_id: ""
    });
    const [loadedUsers, setLoadedUsers] = useState([]);
    const [openUserSelector, setOpenUserSelector] = useState(false);

    useEffect(() => {
        getUsers({}).then(r => setLoadedUsers(r.data?.users || [])).catch(() => {});
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const handleUserSelect = (email) => {
        const currentSelection = formData.shared_with_emails || [];
        if (currentSelection.includes(email)) {
            setFormData({...formData, shared_with_emails: currentSelection.filter(e => e !== email)});
        } else {
            setFormData({...formData, shared_with_emails: [...currentSelection, email]});
        }
    };
    
    const otherUsers = loadedUsers.filter(u => !currentUser || u.email !== currentUser.email);
    const selectedUsers = loadedUsers.filter(u => formData.shared_with_emails?.includes(u.email));

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
        >
            <Card className="w-full shadow-2xl border-0">
                <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl">{task ? 'Editar Tarea' : 'Nueva Tarea'}</CardTitle>
                        <Button variant="ghost" size="icon" onClick={onCancel}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            required
                            placeholder="Título de la tarea"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="text-lg font-semibold"
                        />
                        <Textarea
                            placeholder="Añade una descripción..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="h-24"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                                <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pendiente</SelectItem>
                                    <SelectItem value="in_progress">En Progreso</SelectItem>
                                    <SelectItem value="completed">Completada</SelectItem>
                                    <SelectItem value="cancelled">Cancelada</SelectItem>
                                </SelectContent>
                            </Select>
                            
                            <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                                <SelectTrigger><SelectValue placeholder="Prioridad" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Baja</SelectItem>
                                    <SelectItem value="medium">Media</SelectItem>
                                    <SelectItem value="high">Alta</SelectItem>
                                    <SelectItem value="urgent">Urgente</SelectItem>
                                </SelectContent>
                            </Select>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.due_date ? format(new Date(formData.due_date), 'PPP', { locale: es }) : 'Vencimiento'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={formData.due_date ? new Date(formData.due_date) : undefined}
                                        onSelect={(date) => setFormData({ ...formData, due_date: date?.toISOString().split('T')[0] })}
                                        locale={es}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        
                        {projects && projects.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Proyecto asociado (opcional)</label>
                                <Select 
                                    value={formData.project_id || ""} 
                                    onValueChange={(value) => setFormData({...formData, project_id: value === 'none' ? '' : value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sin proyecto asociado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Sin proyecto asociado</SelectItem>
                                        {projects.map(project => (
                                            <SelectItem key={project.id} value={project.id}>
                                                {project.code} - {project.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Compartir con</label>
                             <Popover open={openUserSelector} onOpenChange={setOpenUserSelector}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <Users className="mr-2 h-4 w-4" />
                                        {selectedUsers.length > 0 ? `${selectedUsers.length} persona(s) seleccionada(s)` : "Seleccionar usuarios..."}
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
                                                    value={user.email}
                                                    onSelect={() => handleUserSelect(user.email)}
                                                    className="flex items-center justify-between"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="w-6 h-6"><AvatarFallback>{getInitials(user.full_name)}</AvatarFallback></Avatar>
                                                        <span>{user.full_name} ({user.email})</span>
                                                    </div>
                                                    {formData.shared_with_emails?.includes(user.email) && <Check className="w-4 h-4" />}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="flex justify-end gap-4 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={onCancel} className="px-6">Cancelar</Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 px-6">{task ? 'Actualizar' : 'Crear'}</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
}