import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    X, FileText, Users, Briefcase, Search, Plus, 
    Edit, Trash2, Copy, Star, Clock 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TemplateManager({ templates, currentUser, onClose, onUseTemplate }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    
    const getTypeIcon = (type) => {
        switch(type) {
            case 'task': return <FileText className="w-4 h-4" />;
            case 'meeting': return <Users className="w-4 h-4" />;
            case 'project': return <Briefcase className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const getTypeColor = (type) => {
        switch(type) {
            case 'task': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'meeting': return 'bg-green-100 text-green-800 border-green-200';
            case 'project': return 'bg-purple-100 text-purple-800 border-purple-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getTypeLabel = (type) => {
        switch(type) {
            case 'task': return 'Tarea';
            case 'meeting': return 'Reunión';
            case 'project': return 'Proyecto';
            default: return 'Otro';
        }
    };

    const filteredTemplates = templates.filter(template => {
        const matchesSearch = !searchTerm || 
            template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === 'all' || template.template_type === selectedType;
        return matchesSearch && matchesType;
    });

    const myTemplates = filteredTemplates.filter(t => t.owner_email === currentUser?.email);
    const publicTemplates = filteredTemplates.filter(t => t.is_public && t.owner_email !== currentUser?.email);

    const TemplateCard = ({ template }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge className={`border ${getTypeColor(template.template_type)}`}>
                                    <span className="flex items-center gap-1">
                                        {getTypeIcon(template.template_type)}
                                        {getTypeLabel(template.template_type)}
                                    </span>
                                </Badge>
                                {template.is_public && (
                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                        <Star className="w-3 h-3 mr-1" />
                                        Pública
                                    </Badge>
                                )}
                            </div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {template.description || 'Sin descripción'}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <div className="flex items-center gap-2">
                            <Copy className="w-3 h-3" />
                            <span>Usada {template.usage_count || 0} veces</span>
                        </div>
                        {template.template_type === 'meeting' && template.template_data?.start_time && (
                            <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{template.template_data.start_time}</span>
                            </div>
                        )}
                    </div>

                    {template.tags && template.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                            {template.tags.map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                    #{tag}
                                </Badge>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Button
                            onClick={() => onUseTemplate(template)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            size="sm"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Usar Plantilla
                        </Button>
                        {template.owner_email === currentUser?.email && (
                            <>
                                <Button variant="outline" size="sm">
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-6xl max-h-[90vh] overflow-hidden"
            >
                <Card className="h-full flex flex-col">
                    <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl flex items-center gap-2">
                                    <Copy className="w-6 h-6 text-blue-600" />
                                    Gestor de Plantillas
                                </CardTitle>
                                <p className="text-sm text-gray-600 mt-1">
                                    Crea y gestiona plantillas para tareas, reuniones y proyectos
                                </p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </CardHeader>

                    <div className="p-6 border-b flex-shrink-0">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Buscar plantillas..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant={selectedType === 'all' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedType('all')}
                                >
                                    Todas
                                </Button>
                                <Button
                                    variant={selectedType === 'task' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedType('task')}
                                >
                                    <FileText className="w-4 h-4 mr-1" />
                                    Tareas
                                </Button>
                                <Button
                                    variant={selectedType === 'meeting' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedType('meeting')}
                                >
                                    <Users className="w-4 h-4 mr-1" />
                                    Reuniones
                                </Button>
                                <Button
                                    variant={selectedType === 'project' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedType('project')}
                                >
                                    <Briefcase className="w-4 h-4 mr-1" />
                                    Proyectos
                                </Button>
                            </div>
                        </div>
                    </div>

                    <CardContent className="flex-1 overflow-y-auto p-6">
                        <Tabs defaultValue="public" className="h-full">
                            <TabsList className="mb-6">
                                <TabsTrigger value="public">
                                    Plantillas Públicas ({publicTemplates.length})
                                </TabsTrigger>
                                <TabsTrigger value="mine">
                                    Mis Plantillas ({myTemplates.length})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="public" className="mt-0">
                                {publicTemplates.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <AnimatePresence>
                                            {publicTemplates.map(template => (
                                                <TemplateCard key={template.id} template={template} />
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Copy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                            No se encontraron plantillas públicas
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Aún no hay plantillas públicas disponibles'}
                                        </p>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="mine" className="mt-0">
                                <div className="mb-4">
                                    <Button className="bg-green-600 hover:bg-green-700">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Crear Nueva Plantilla
                                    </Button>
                                </div>
                                {myTemplates.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <AnimatePresence>
                                            {myTemplates.map(template => (
                                                <TemplateCard key={template.id} template={template} />
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Copy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                            No tienes plantillas creadas
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Crea tu primera plantilla para reutilizar configuraciones comunes
                                        </p>
                                        <Button className="bg-green-600 hover:bg-green-700">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Crear Plantilla
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}