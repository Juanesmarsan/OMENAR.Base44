import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Target, Plus, Edit, Trash2, TrendingUp, AlertTriangle, 
  CheckCircle, Clock, DollarSign, Users, Zap, Leaf
} from 'lucide-react';
import { format } from 'date-fns';

const CATEGORY_CONFIG = {
  financial: { label: 'Financiero', icon: DollarSign, color: 'bg-green-100 text-green-800' },
  operational: { label: 'Operacional', icon: Zap, color: 'bg-blue-100 text-blue-800' },
  market: { label: 'Mercado', icon: TrendingUp, color: 'bg-purple-100 text-purple-800' },
  hr: { label: 'RRHH', icon: Users, color: 'bg-orange-100 text-orange-800' },
  innovation: { label: 'Innovación', icon: Target, color: 'bg-indigo-100 text-indigo-800' },
  sustainability: { label: 'Sostenibilidad', icon: Leaf, color: 'bg-emerald-100 text-emerald-800' }
};

const STATUS_CONFIG = {
  not_started: { label: 'No iniciado', color: 'bg-gray-200 text-gray-800', icon: Clock },
  on_track: { label: 'En marcha', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  at_risk: { label: 'En riesgo', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
  delayed: { label: 'Retrasado', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
  achieved: { label: 'Conseguido', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'bg-gray-300 text-gray-600', icon: Clock }
};

export default function StrategicGoalsTab() {
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1_year');
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    timeframe: '1_year',
    category: 'financial',
    title: '',
    description: '',
    target_value: 0,
    current_value: 0,
    unit: '€',
    priority: 'medium',
    responsible: '',
    target_date: '',
    status: 'not_started'
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.StrategicGoal.list('-created_date');
      setGoals(data);
    } catch (error) {
      console.error('Error loading strategic goals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const goalData = {
        ...formData,
        target_value: parseFloat(formData.target_value) || 0,
        current_value: parseFloat(formData.current_value) || 0,
        progress_percentage: formData.target_value > 0 
          ? Math.round((formData.current_value / formData.target_value) * 100) 
          : 0
      };

      if (editingGoal) {
        await base44.entities.StrategicGoal.update(editingGoal.id, goalData);
      } else {
        await base44.entities.StrategicGoal.create(goalData);
      }

      setShowForm(false);
      setEditingGoal(null);
      setFormData({
        year: new Date().getFullYear(),
        timeframe: '1_year',
        category: 'financial',
        title: '',
        description: '',
        target_value: 0,
        current_value: 0,
        unit: '€',
        priority: 'medium',
        responsible: '',
        target_date: '',
        status: 'not_started'
      });
      loadGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de que quieres eliminar este objetivo?')) {
      await base44.entities.StrategicGoal.delete(id);
      loadGoals();
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData(goal);
    setShowForm(true);
  };

  const filteredGoals = goals.filter(g => g.timeframe === selectedTimeframe);

  const getTimeframeLabel = (timeframe) => {
    const labels = {
      '1_year': '1 Año',
      '3_years': '3 Años',
      '5_years': '5 Años'
    };
    return labels[timeframe] || timeframe;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-md border-0 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-3">
                <Target className="w-6 h-6 text-purple-600" />
                Objetivos Estratégicos
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Define y gestiona los objetivos estratégicos de la empresa a corto, medio y largo plazo
              </p>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              {showForm ? 'Cancelar' : 'Nuevo Objetivo'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Formulario */}
      {showForm && (
        <Card className="shadow-md border-2 border-purple-200">
          <CardHeader>
            <CardTitle>{editingGoal ? 'Editar Objetivo' : 'Nuevo Objetivo Estratégico'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Plazo del Objetivo *</label>
                  <Select value={formData.timeframe} onValueChange={(val) => setFormData({...formData, timeframe: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1_year">Corto Plazo (1 año)</SelectItem>
                      <SelectItem value="3_years">Medio Plazo (3 años)</SelectItem>
                      <SelectItem value="5_years">Largo Plazo (5 años)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Categoría *</label>
                  <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1 block">Título del Objetivo *</label>
                  <Input 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Ej: Aumentar facturación un 20%"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1 block">Descripción</label>
                  <Textarea 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Descripción detallada del objetivo..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Valor Objetivo</label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={formData.target_value} 
                    onChange={(e) => setFormData({...formData, target_value: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Valor Actual</label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={formData.current_value} 
                    onChange={(e) => setFormData({...formData, current_value: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Unidad</label>
                  <Input 
                    value={formData.unit} 
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    placeholder="€, %, unidades..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Prioridad</label>
                  <Select value={formData.priority} onValueChange={(val) => setFormData({...formData, priority: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Responsable</label>
                  <Input 
                    value={formData.responsible} 
                    onChange={(e) => setFormData({...formData, responsible: e.target.value})}
                    placeholder="Nombre del responsable"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Fecha Objetivo *</label>
                  <Input 
                    type="date"
                    value={formData.target_date} 
                    onChange={(e) => setFormData({...formData, target_date: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Estado</label>
                  <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Año</label>
                  <Input 
                    type="number"
                    value={formData.year} 
                    onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  {editingGoal ? 'Actualizar' : 'Crear'} Objetivo
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tabs por plazo */}
      <Tabs value={selectedTimeframe} onValueChange={setSelectedTimeframe} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="1_year">
            <Clock className="w-4 h-4 mr-2" />
            Corto Plazo (1 año)
          </TabsTrigger>
          <TabsTrigger value="3_years">
            <Target className="w-4 h-4 mr-2" />
            Medio Plazo (3 años)
          </TabsTrigger>
          <TabsTrigger value="5_years">
            <TrendingUp className="w-4 h-4 mr-2" />
            Largo Plazo (5 años)
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTimeframe} className="mt-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando objetivos...</p>
            </div>
          ) : filteredGoals.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No hay objetivos para {getTimeframeLabel(selectedTimeframe)}
                </h3>
                <p className="text-gray-600 mb-4">
                  Crea tu primer objetivo estratégico para este plazo
                </p>
                <Button onClick={() => setShowForm(true)} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Objetivo
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredGoals.map(goal => {
                const CategoryIcon = CATEGORY_CONFIG[goal.category]?.icon || Target;
                const StatusIcon = STATUS_CONFIG[goal.status]?.icon || Clock;
                const progress = goal.target_value > 0 
                  ? Math.min(100, Math.round((goal.current_value / goal.target_value) * 100))
                  : 0;

                return (
                  <Card key={goal.id} className="shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={CATEGORY_CONFIG[goal.category]?.color}>
                              <CategoryIcon className="w-3 h-3 mr-1" />
                              {CATEGORY_CONFIG[goal.category]?.label}
                            </Badge>
                            <Badge className={STATUS_CONFIG[goal.status]?.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {STATUS_CONFIG[goal.status]?.label}
                            </Badge>
                            {goal.priority === 'critical' && (
                              <Badge className="bg-red-600 text-white">CRÍTICO</Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg">{goal.title}</CardTitle>
                          {goal.description && (
                            <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(goal)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(goal.id)}>
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Progreso</span>
                          <span className="font-bold">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Actual: {goal.current_value} {goal.unit}</span>
                          <span>Objetivo: {goal.target_value} {goal.unit}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {goal.responsible && (
                          <div>
                            <span className="text-gray-600">Responsable:</span>
                            <p className="font-medium">{goal.responsible}</p>
                          </div>
                        )}
                        {goal.target_date && (
                          <div>
                            <span className="text-gray-600">Fecha objetivo:</span>
                            <p className="font-medium">{format(new Date(goal.target_date), 'dd/MM/yyyy')}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}