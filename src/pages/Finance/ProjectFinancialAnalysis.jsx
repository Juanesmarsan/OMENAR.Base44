import React, { useState, useEffect, useCallback } from 'react';
import { getAccessLogs } from '@/functions/getAccessLogs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cleanupStaleSessions } from '@/functions/cleanupStaleSessions';
import { Search, Download, Calendar as CalendarIcon, Clock, User, Globe, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AccessLogsTab() {
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalSessions: 0,
        activeSessions: 0,
        averageSessionTime: 0,
        uniqueUsers: 0
    });

    const loadAccessLogs = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await getAccessLogs({});
            const data = res.data?.logs || [];
            setLogs(data);

            const activeSessions = data.filter(log => log.status === 'active');
            const closedSessions = data.filter(log => log.status === 'closed' || log.status === 'timeout');
            const uniqueUsers = [...new Set(data.map(log => log.user_email))].length;
            
            let totalMinutes = 0;
            let completedSessions = 0;
            
            closedSessions.forEach(log => {
                if (log.session_duration) {
                    totalMinutes += log.session_duration;
                    completedSessions++;
                }
            });

            const averageSessionTime = completedSessions > 0 ? Math.round(totalMinutes / completedSessions) : 0;

            setStats({
                totalSessions: data.length,
                activeSessions: activeSessions.length,
                averageSessionTime,
                uniqueUsers
            });

        } catch (error) {
            console.error('Error loading access logs:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const filterLogs = useCallback(() => {
        let filtered = logs;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(log =>
                log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.user_email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(log => log.status === statusFilter);
        }

        // Date filter
        if (dateFilter) {
            const filterDate = format(dateFilter, 'yyyy-MM-dd');
            filtered = filtered.filter(log =>
                format(new Date(log.login_time), 'yyyy-MM-dd') === filterDate
            );
        }

        setFilteredLogs(filtered);
    }, [logs, searchTerm, statusFilter, dateFilter]);

    useEffect(() => {
        loadAccessLogs();
    }, [loadAccessLogs]);

    useEffect(() => {
        filterLogs();
    }, [filterLogs]);

    const getStatusBadge = (status) => {
        const variants = {
            active: "bg-green-100 text-green-800 border-green-200",
            closed: "bg-gray-100 text-gray-800 border-gray-200",
            timeout: "bg-red-100 text-red-800 border-red-200"
        };
        
        const labels = {
            active: "Activo",
            closed: "Cerrado",
            timeout: "Timeout"
        };

        return <Badge className={`${variants[status]} border`}>{labels[status]}</Badge>;
    };

    const formatSessionDuration = (minutes) => {
        if (!minutes) return 'En curso';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    const exportLogs = () => {
        alert('Funcionalidad de exportación será implementada próximamente');
    };

    const handleCleanup = async () => {
        if (!window.confirm('Esto marcará como timeout todas las sesiones activas con más de 12 horas de antigüedad. ¿Continuar?')) return;
        await cleanupStaleSessions({});
        await loadAccessLogs();
    };

    const getSessionDuration = (log) => {
        if (log.session_duration) return formatSessionDuration(log.session_duration);
        if (log.status === 'active' && log.login_time) {
            const mins = Math.floor((new Date() - new Date(log.login_time)) / (1000 * 60));
            return formatSessionDuration(mins) + ' (aprox.)';
        }
        return 'En curso';
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Sesiones</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalSessions}</p>
                        </div>
                        <User className="w-8 h-8 text-blue-600" />
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Sesiones Activas</p>
                            <p className="text-3xl font-bold text-green-600">{stats.activeSessions}</p>
                        </div>
                        <Globe className="w-8 h-8 text-green-600" />
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                            <p className="text-3xl font-bold text-purple-600">{formatSessionDuration(stats.averageSessionTime)}</p>
                        </div>
                        <Clock className="w-8 h-8 text-purple-600" />
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Usuarios Únicos</p>
                            <p className="text-3xl font-bold text-orange-600">{stats.uniqueUsers}</p>
                        </div>
                        <User className="w-8 h-8 text-orange-600" />
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="shadow-md border-0">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar usuario..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los estados</SelectItem>
                                <SelectItem value="active">Activo</SelectItem>
                                <SelectItem value="closed">Cerrado</SelectItem>
                                <SelectItem value="timeout">Timeout</SelectItem>
                            </SelectContent>
                        </Select>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateFilter ? format(dateFilter, 'PPP', { locale: es }) : 'Filtrar por fecha'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={dateFilter}
                                    onSelect={setDateFilter}
                                    locale={es}
                                />
                            </PopoverContent>
                        </Popover>

                        <Button 
                            variant="outline" 
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('all');
                                setDateFilter(null);
                            }}
                        >
                            Limpiar Filtros
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Access Logs Table */}
            <Card className="shadow-md border-0">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Registro de Accesos ({filteredLogs.length})</CardTitle>
                            <p className="text-sm text-gray-500 mt-1">
                                Herramienta: <span className="font-semibold">OMENAR Gestión de Ingeniería</span> | Beneficiario: <span className="font-semibold">Omenar</span>
                            </p>
                        </div>
                        <Button onClick={handleCleanup} size="sm" variant="outline" className="mr-2">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Limpiar sesiones antiguas
                        </Button>
                        <Button onClick={exportLogs} size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Exportar
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Cargando logs de acceso...</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Usuario</TableHead>
                                    <TableHead><span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Entrada</span></TableHead>
                                    <TableHead><span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Salida</span></TableHead>
                                    <TableHead>Duración</TableHead>
                                    <TableHead>Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLogs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan="5" className="text-center py-8 text-gray-500">
                                            No se encontraron logs de acceso
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{log.user_name}</div>
                                                    <div className="text-xs text-gray-500">{log.user_email}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div className="font-medium">{format(new Date(log.login_time), 'dd/MM/yyyy')}</div>
                                                    <div className="text-blue-600 font-mono">{format(new Date(log.login_time), 'HH:mm:ss')}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {log.logout_time ? (
                                                    <div className="text-sm">
                                                        <div className="font-medium">{format(new Date(log.logout_time), 'dd/MM/yyyy')}</div>
                                                        <div className="text-red-500 font-mono">{format(new Date(log.logout_time), 'HH:mm:ss')}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-green-600 font-medium text-sm">En línea</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {getSessionDuration(log)}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(log.status)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}