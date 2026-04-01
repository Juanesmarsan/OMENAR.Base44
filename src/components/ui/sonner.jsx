import React, { useState, useEffect, useCallback } from 'react';
import { ProjectPhase } from '@/entities/ProjectPhase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Calendar, CheckCircle, Clock, Pause, AlertCircle } from 'lucide-react';
import { format } from "date-fns";
import { es } from "date-fns/locale";

import PhaseForm from './PhaseForm';

export default function ProjectTimeline({ project }) {
  const [phases, setPhases] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPhase, setEditingPhase] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadPhases = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await ProjectPhase.filter({ project_id: project.id }, 'order_index');
      setPhases(data);
    } catch (error) {
      console.error('Error loading phases:', error);
    } finally {
      setIsLoading(false);
    }
  }, [project.id]);

  useEffect(() => {
    loadPhases();
  }, [loadPhases]);

  const handleSubmit = async (phaseData) => {
    try {
      const dataWithProject = { ...phaseData, project_id: project.id };
      
      if (editingPhase) {
        await ProjectPhase.update(editingPhase.id, dataWithProject);
      } else {
        const maxOrder = phases.length > 0 ? Math.max(...phases.map(p => p.order_index || 0)) : 0;
        dataWithProject.order_index = maxOrder + 1;
        await ProjectPhase.create(dataWithProject);
      }
      
      setShowForm(false);
      setEditingPhase(null);
      loadPhases();
    } catch (error) {
      console.error('Error saving phase:', error);
    }
  };

  const handleDelete = async (phase) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta fase?')) {
      try {
        await ProjectPhase.delete(phase.id);
        loadPhases();
      } catch (error) {
        console.error('Error deleting phase:', error);
      }
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
        completed: <CheckCircle className="w-5 h-5 text-green-600" />,
        in_progress: <Clock className="w-5 h-5 text-blue-600 animate-pulse" />,
        paused: <Pause className="w-5 h-5 text-yellow-600" />,
        pending: <AlertCircle className="w-5 h-5 text-gray-400" />
    };
    return icons[status] || icons.pending;
  };
  
  const getStatusBadge = (status) => {
    const variants = {
      pending: "bg-gray-100 text-gray-800",
      in_progress: "bg-blue-100 text-blue-800",
      paused: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800"
    };
    const labels = { pending: "Pendiente", in_progress: "En Progreso", paused: "Pausada", completed: "Completada" };
    return <Badge className={`${variants[status]} text-xs`}>{labels[status]}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-md border-0">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Timeline del Proyecto</CardTitle>
              <p className="text-gray-600 mt-1">Gestiona las fases del proyecto y su progreso.</p>
            </div>
            <Button onClick={() => { setEditingPhase(null); setShowForm(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Nueva Fase
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-gray-500 py-8">Cargando timeline...</p>
          ) : phases.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay fases definidas</h3>
              <p className="text-gray-500 mb-4">Crea la primera fase para empezar a organizar el proyecto.</p>
              <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />Crear Primera Fase</Button>
            </div>
          ) : (
            <div className="relative pl-8">
              <div className="absolute left-8 top-4 bottom-4 w-0.5 bg-gray-200"></div>
              {phases.map((phase) => (
                <div key={phase.id} className="relative mb-8">
                  <div className="absolute -left-11 top-1.5 flex items-center justify-center w-8 h-8 bg-white border-2 border-gray-300 rounded-full z-10">
                    {getStatusIcon(phase.status)}
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-semibold text-gray-800">{phase.name}</h4>
                          {getStatusBadge(phase.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{phase.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{format(new Date(phase.start_date), "d MMM yyyy", { locale: es })} - {phase.end_date ? format(new Date(phase.end_date), "d MMM yyyy", { locale: es }) : '...'}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingPhase(phase); setShowForm(true); }}>
                          <Edit className="w-4 h-4 text-gray-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(phase)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <PhaseForm
              phase={editingPhase}
              onSubmit={handleSubmit}
              onCancel={() => { setShowForm(false); setEditingPhase(null); }}
            />
        </div>
      )}
    </div>
  );
}