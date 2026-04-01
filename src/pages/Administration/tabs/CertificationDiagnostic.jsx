import React, { useState, useEffect } from 'react';
import { StrategicObjective } from '@/entities/StrategicObjective';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
// Simplified for now, a real implementation would need a form component
// import ObjectiveForm from './ObjectiveForm';

export default function StrategicObjectivesTab() {
    const [objectives, setObjectives] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadObjectives();
    }, []);

    const loadObjectives = async () => {
        const data = await StrategicObjective.list();
        setObjectives(data);
        setIsLoading(false);
    };
    
    const getStatusBadge = (status) => {
        const styles = {
            on_track: "bg-green-100 text-green-800",
            at_risk: "bg-yellow-100 text-yellow-800",
            achieved: "bg-blue-100 text-blue-800",
            delayed: "bg-red-100 text-red-800",
        };
        const labels = {
            on_track: "En camino",
            at_risk: "En riesgo",
            achieved: "Conseguido",
            delayed: "Retrasado",
        };
        return <Badge className={styles[status]}>{labels[status]}</Badge>;
    };

    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Objetivos Estratégicos</CardTitle>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Nuevo Objetivo
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600">Define y sigue el progreso de los objetivos clave de la empresa.</p>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mock data for display */}
                {[
                    { title: 'Aumentar Facturación 20%', goal: '€1.5M', current_progress: 75, status: 'on_track', due_date: '2025-12-31' },
                    { title: 'Reducir Costes Operativos 5%', goal: '€50k Ahorro', current_progress: 90, status: 'achieved', due_date: '2025-06-30' },
                    { title: 'Expandir a Nueva Región', goal: '10 nuevos clientes', current_progress: 30, status: 'at_risk', due_date: '2025-09-30' }
                ].map((obj, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle>{obj.title}</CardTitle>
                                {getStatusBadge(obj.status)}
                            </div>
                            <p className="text-sm text-gray-500">Meta: {obj.goal}</p>
                        </CardHeader>
                        <CardContent>
                            <Progress value={obj.current_progress} className="w-full" />
                            <div className="flex justify-between text-sm mt-2">
                                <span>{obj.current_progress}% completado</span>
                                <span className="text-gray-500">Vence: {new Date(obj.due_date).toLocaleDateString()}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}