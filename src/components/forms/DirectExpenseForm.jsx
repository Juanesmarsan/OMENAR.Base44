import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, FolderKanban, Smile } from 'lucide-react';

const StatsCard = ({ title, value, trend, icon: Icon, color }) => (
    <Card className={`shadow-md border-0 bg-gradient-to-br ${color}`}>
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-800">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                    <div className="flex items-center text-sm text-green-600 mt-1">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span>{trend}</span>
                    </div>
                </div>
                <Icon className="w-10 h-10 text-gray-700 opacity-50" />
            </div>
        </CardContent>
    </Card>
);

export default function ManagementDashboardTab() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Panel de Control Ejecutivo</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600">Resumen ejecutivo de la salud de la empresa.</p>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard 
                    title="Ingresos Totales"
                    value="€1.2M"
                    trend="+15% vs año anterior"
                    icon={DollarSign}
                    color="from-green-50 to-green-100"
                />
                <StatsCard 
                    title="Margen de Beneficio"
                    value="18.5%"
                    trend="+2.1% vs año anterior"
                    icon={TrendingUp}
                    color="from-blue-50 to-blue-100"
                />
                <StatsCard 
                    title="Proyectos Activos"
                    value="23"
                    trend="+5 este trimestre"
                    icon={FolderKanban}
                    color="from-amber-50 to-amber-100"
                />
                <StatsCard 
                    title="Satisfacción Empleados"
                    value="8.9/10"
                    trend="+0.4 vs 6 meses"
                    icon={Smile}
                    color="from-purple-50 to-purple-100"
                />
            </div>
            
            {/* Placeholder for more charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>Evolución de Ingresos</CardTitle></CardHeader>
                    <CardContent><p className="text-gray-500">[Gráfico de evolución de ingresos aquí]</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Distribución de Costes</CardTitle></CardHeader>
                    <CardContent><p className="text-gray-500">[Gráfico de distribución de costes aquí]</p></CardContent>
                </Card>
            </div>

            {/* Notas de Deducción IVA */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Control para Deducción de IVA</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Las secciones de <strong>Control de Vehículos</strong> y <strong>Alojamiento de Trabajadores</strong> 
                        permiten cumplimentar y generar los documentos necesarios para justificar ante Hacienda 
                        la deducción del 100% del IVA en vehículos afectos a la actividad y alojamientos de trabajadores desplazados.
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
                        <strong>Importante:</strong> Mantener estos registros actualizados es fundamental para cumplir 
                        con los requisitos de la Agencia Tributaria.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}