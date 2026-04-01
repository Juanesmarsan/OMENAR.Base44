import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Employee } from '@/entities/Employee';
import { blockUser } from '@/functions/blockUser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, UserCheck, UserX, ShieldOff, ShieldCheck, Trash2 } from 'lucide-react';
import UserForm from './UserForm';
import { Badge } from '@/components/ui/badge';

export default function UsersTab() {
    const [users, setUsers] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [usersData, employeesData] = await Promise.all([
                base44.entities.User.list(),
                Employee.list()
            ]);
            setUsers(usersData);
            setEmployees(employeesData);
        } catch (error) {
            console.error("Error loading data (el usuario debe ser admin para listar usuarios):", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInvite = () => {
        setEditingUser(null);
        setShowForm(true);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setShowForm(true);
    };

    const handleBlockToggle = async (user) => {
        const newStatus = user.status === 'blocked' ? 'active' : 'blocked';
        const action = newStatus === 'blocked' ? 'bloquear' : 'desbloquear';
        if (!window.confirm(`¿Seguro que quieres ${action} a ${user.full_name || user.email}?`)) return;
        await blockUser({ user_id: user.id, status: newStatus });
        loadData();
    };

    const handleDelete = async (user) => {
        if (!window.confirm(`¿Seguro que quieres ELIMINAR permanentemente a ${user.full_name || user.email}? Esta acción no se puede deshacer.`)) return;
        await base44.entities.User.delete(user.id);
        loadData();
    };

    const handleSubmit = async (userData) => {
        if (editingUser) {
            await base44.entities.User.update(editingUser.id, {
                role: userData.role,
                employee_id: userData.employee_id,
                permissions: userData.permissions
            });
        } else {
            alert(`Se enviaría una invitación a ${userData.email}. Usa el panel de la plataforma para invitar nuevos usuarios.`);
        }
        setShowForm(false);
        setEditingUser(null);
        loadData();
    };

    const getEmployeeName = (employeeId) => {
        const employee = employees.find(e => e.id === employeeId);
        return employee ? `${employee.first_name} ${employee.last_name}` : 'No vinculado';
    };

    return (
        <div className="space-y-6">
            {showForm && (
                <UserForm
                    user={editingUser}
                    employees={employees}
                    onSubmit={handleSubmit}
                    onCancel={() => setShowForm(false)}
                />
            )}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Gestión de Usuarios y Permisos</CardTitle>
                        <Button onClick={handleInvite}>
                            <Plus className="w-4 h-4 mr-2" />
                            Invitar / Configurar Usuario
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email / Nombre</TableHead>
                                <TableHead>Rol</TableHead>
                                <TableHead>Empleado Vinculado</TableHead>
                                <TableHead>Permisos Especiales</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan="5" className="text-center">Cargando usuarios...</TableCell>
                                </TableRow>
                            ) : (
                                users.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="font-medium">{user.full_name}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{getEmployeeName(user.employee_id)}</TableCell>
                                        <TableCell>
                                            {user.permissions?.is_guest ? (
                                                <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                                                    <UserX className="w-3 h-3" />
                                                    Invitado
                                                </Badge>
                                            ) : (
                                                 <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                                                    <UserCheck className="w-3 h-3" />
                                                    Usuario Interno
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {user.status === 'blocked' ? (
                                                <Badge className="bg-red-100 text-red-800">Bloqueado</Badge>
                                            ) : (
                                                <Badge className="bg-green-100 text-green-800">Activo</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right space-x-1">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}><Edit className="w-4 h-4" /></Button>
                                            <Button variant="ghost" size="icon" title={user.status === 'blocked' ? 'Desbloquear' : 'Bloquear'} onClick={() => handleBlockToggle(user)}>
                                                {user.status === 'blocked' ? <ShieldCheck className="w-4 h-4 text-green-600" /> : <ShieldOff className="w-4 h-4 text-orange-500" />}
                                            </Button>
                                            <Button variant="ghost" size="icon" title="Eliminar usuario" onClick={() => handleDelete(user)}>
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}