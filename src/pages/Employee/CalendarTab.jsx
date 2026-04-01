import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Timer, Pause, Square, Play } from 'lucide-react';

export default function TimerComponent({ task, elapsedTime, onStop, onPause, onResume, isPaused = false }) {
    const formatTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    const getPriorityColor = (priority) => {
        switch(priority) {
            case 'urgent': return 'border-red-500 bg-red-50';
            case 'high': return 'border-orange-500 bg-orange-50';
            case 'medium': return 'border-yellow-500 bg-yellow-50';
            default: return 'border-blue-500 bg-blue-50';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="shadow-2xl"
        >
            <Card className={`border-2 ${getPriorityColor(task.priority)} min-w-80`}>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                            {isPaused ? (
                                <Pause className="w-5 h-5 text-yellow-600" />
                            ) : (
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                            )}
                            <Timer className="w-5 h-5 text-gray-700" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                                {task.title}
                            </h3>
                            <Badge className="mt-1 text-xs">
                                {task.priority === 'urgent' ? 'Urgente' :
                                 task.priority === 'high' ? 'Alta' :
                                 task.priority === 'medium' ? 'Media' : 'Baja'}
                            </Badge>
                        </div>
                    </div>
                    
                    <div className="text-center mb-4">
                        <div className={`text-3xl font-mono font-bold ${isPaused ? 'text-yellow-600' : 'text-blue-600'}`}>
                            {formatTime(elapsedTime)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            {isPaused ? 'En pausa' : 'Tiempo transcurrido'}
                        </div>
                        
                        {task.estimated_duration && (
                            <div className="mt-2">
                                <div className="text-xs text-gray-500 mb-1">
                                    Estimado: {formatTime(task.estimated_duration)}
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                            elapsedTime > task.estimated_duration ? 'bg-red-500' : 'bg-blue-500'
                                        }`}
                                        style={{ 
                                            width: `${Math.min((elapsedTime / task.estimated_duration) * 100, 100)}%` 
                                        }}
                                    />
                                </div>
                                {elapsedTime > task.estimated_duration && (
                                    <div className="text-xs text-red-600 mt-1 font-medium">
                                        +{formatTime(elapsedTime - task.estimated_duration)} sobre lo estimado
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex justify-center gap-2">
                        {isPaused ? (
                            <Button
                                size="sm"
                                onClick={onResume}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <Play className="w-4 h-4 mr-1" />
                                Reanudar
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={onPause}
                            >
                                <Pause className="w-4 h-4 mr-1" />
                                Pausar
                            </Button>
                        )}
                        
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={onStop}
                        >
                            <Square className="w-4 h-4 mr-1" />
                            Finalizar
                        </Button>
                    </div>
                    
                    {task.time_tracked > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="text-xs text-gray-500 text-center">
                                Tiempo acumulado: {formatTime((task.time_tracked || 0) + elapsedTime)}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}