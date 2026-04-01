import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Check, X, Search } from "lucide-react";

export default function CertificationDiagnostic({ project, month, year }) {
  const [diagnosticData, setDiagnosticData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostic = async () => {
    // Validar que tenemos los datos necesarios
    if (!project || !month || !year) {
      alert('⚠️ Por favor, selecciona:\n• Un proyecto específico\n• Un mes\n• Un año\n\nPara ejecutar el diagnóstico.');
      return;
    }

    setIsLoading(true);
    try {
      // Cargar todos los datos
      const [allReports, allEmployees, allCalendar, allProjects, allAssignments] = await Promise.all([
        base44.entities.DailyWorkReport.list(),
        base44.entities.Employee.list(),
        base44.entities.WorkCalendar.list(),
        base44.entities.Project.list(),
        base44.entities.ProjectAssignment.list()
      ]);

      // Filtrar reportes por mes/año
      const monthReports = allReports.filter(r => {
        const reportDate = new Date(r.report_date);
        return reportDate.getMonth() + 1 === month && reportDate.getFullYear() === year;
      });

      // Agrupar reportes por proyecto
      const reportsByProject = {};
      monthReports.forEach(r => {
        if (!reportsByProject[r.project_id]) {
          reportsByProject[r.project_id] = [];
        }
        reportsByProject[r.project_id].push(r);
      });

      // Reportes del proyecto actual
      const projectReports = monthReports.filter(r => r.project_id === project.id);

      // Agrupar por empleado
      const reportsByEmployee = {};
      projectReports.forEach(r => {
        if (!reportsByEmployee[r.employee_id]) {
          reportsByEmployee[r.employee_id] = [];
        }
        reportsByEmployee[r.employee_id].push(r);
      });

      // Empleados asignados al proyecto
      const projectAssignments = allAssignments.filter(a => 
        a.project_id === project.id && a.status === 'active'
      );

      // Calendarios del mes
      const monthCalendars = allCalendar.filter(c => 
        c.year === year && c.month === month
      );

      setDiagnosticData({
        allReports: monthReports,
        reportsByProject,
        projectReports,
        reportsByEmployee,
        allEmployees,
        allProjects,
        projectAssignments,
        monthCalendars
      });

    } catch (error) {
      console.error('Error en diagnóstico:', error);
      alert('Error al ejecutar diagnóstico: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getMonthName = (m) => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[m - 1] || 'Mes desconocido';
  };

  // Si no hay proyecto o mes/año seleccionado, mostrar instrucciones
  const canRunDiagnostic = project && month && year;
  const diagnosticTitle = canRunDiagnostic 
    ? `Diagnóstico de Datos - ${project.name} - ${getMonthName(month)} ${year}`
    : 'Diagnóstico de Datos';

  return (
    <Card className="border-2 border-orange-300 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-900">
          <Search className="w-5 h-5" />
          {diagnosticTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canRunDiagnostic ? (
          <div className="p-4 bg-white rounded-lg border border-orange-300">
            <h3 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              ℹ️ Instrucciones para usar el diagnóstico
            </h3>
            <div className="space-y-2 text-sm text-orange-800">
              <p className="font-semibold">Para ejecutar un diagnóstico completo, necesitas:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li><strong>Seleccionar un proyecto específico</strong> (no "Todos los proyectos")</li>
                <li><strong>Seleccionar un año</strong> en el filtro de arriba</li>
                <li><strong>Crear una certificación</strong> para ese proyecto/mes</li>
              </ol>
              <div className="mt-4 p-3 bg-orange-100 rounded border border-orange-200">
                <p className="text-xs font-medium">
                  💡 <strong>Truco:</strong> Haz clic en "Nueva Certificación" arriba, selecciona el proyecto "Alemania - Lesaca" y el mes "Octubre 2025", 
                  luego haz clic en "Recalcular" para ver un diagnóstico completo automáticamente.
                </p>
              </div>
            </div>
          </div>
        ) : !diagnosticData ? (
          <div>
            <p className="text-sm text-orange-800 mb-4">
              Ejecuta un diagnóstico completo para ver exactamente qué datos tienes guardados para <strong>{project.name}</strong> en <strong>{getMonthName(month)} {year}</strong>.
            </p>
            <Button 
              onClick={runDiagnostic} 
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? 'Analizando...' : '🔍 Ejecutar Diagnóstico Completo'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Resumen General */}
            <div className="p-4 bg-white rounded-lg border border-orange-200">
              <h3 className="font-bold text-lg mb-3 text-orange-900">📊 RESUMEN GENERAL</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total reportes en Control Diario ({getMonthName(month)}):</span>
                  <Badge className="bg-blue-100 text-blue-800">{diagnosticData.allReports.length} días</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Proyectos con datos este mes:</span>
                  <Badge className="bg-purple-100 text-purple-800">{Object.keys(diagnosticData.reportsByProject).length} proyectos</Badge>
                </div>
              </div>
            </div>

            {/* Desglose por Proyecto */}
            <div className="p-4 bg-white rounded-lg border border-orange-200">
              <h3 className="font-bold text-lg mb-3 text-orange-900">🏗️ DATOS POR PROYECTO</h3>
              {Object.keys(diagnosticData.reportsByProject).length === 0 ? (
                <p className="text-red-600">❌ No hay datos guardados en Control Diario para ningún proyecto en {getMonthName(month)} {year}</p>
              ) : (
                Object.entries(diagnosticData.reportsByProject).map(([projectId, reports]) => {
                  const proj = diagnosticData.allProjects.find(p => p.id === projectId);
                  const isCurrentProject = projectId === project.id;
                  
                  return (
                    <div 
                      key={projectId} 
                      className={`p-3 mb-2 rounded border-2 ${isCurrentProject ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-semibold">{proj?.name || 'Desconocido'}</span>
                          {isCurrentProject && <span className="ml-2 text-green-600 font-bold">← ESTE PROYECTO</span>}
                        </div>
                        <Badge className={isCurrentProject ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}>
                          {reports.length} días guardados
                        </Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Datos del Proyecto Actual */}
            <div className="p-4 bg-white rounded-lg border-2 border-green-500">
              <h3 className="font-bold text-lg mb-3 text-green-900">✅ PROYECTO: {project.name}</h3>
              
              {diagnosticData.projectReports.length === 0 ? (
                <div className="p-4 bg-red-50 border border-red-300 rounded">
                  <p className="text-red-800 font-bold flex items-center gap-2">
                    <X className="w-5 h-5" />
                    ❌ NO HAY DATOS GUARDADOS PARA ESTE PROYECTO
                  </p>
                  <p className="text-sm text-red-700 mt-2">
                    El problema está aquí: cuando guardaste el mes completo, probablemente seleccionaste otro proyecto.
                  </p>
                  <div className="mt-4 p-3 bg-red-100 rounded">
                    <p className="text-sm font-bold text-red-900">🔧 SOLUCIÓN:</p>
                    <ol className="text-sm text-red-800 mt-2 list-decimal list-inside space-y-1">
                      <li>Ve a <strong>Control Diario</strong></li>
                      <li>Selecciona una fecha de <strong>{getMonthName(month)} {year}</strong></li>
                      <li>En "Guardar Mes Completo", selecciona <strong>"{project.name}"</strong></li>
                      <li>Haz clic en <strong>"Guardar Todo el Mes"</strong></li>
                    </ol>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-4 p-3 bg-green-50 border border-green-300 rounded">
                    <p className="text-green-800 font-bold flex items-center gap-2">
                      <Check className="w-5 h-5" />
                      ✅ Hay {diagnosticData.projectReports.length} días guardados en Control Diario
                    </p>
                  </div>

                  <h4 className="font-semibold mb-2">👥 Desglose por Empleado:</h4>
                  <div className="space-y-2">
                    {Object.entries(diagnosticData.reportsByEmployee).map(([empId, reports]) => {
                      const employee = diagnosticData.allEmployees.find(e => e.id === empId);
                      const totalHours = reports.reduce((sum, r) => sum + (parseFloat(r.hours_worked) || 0), 0);
                      
                      return (
                        <div key={empId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="font-medium">
                            {employee ? `${employee.first_name} ${employee.last_name}` : 'Desconocido'}
                          </span>
                          <div className="flex gap-2">
                            <Badge className="bg-blue-100 text-blue-800">{reports.length} días</Badge>
                            <Badge className="bg-green-100 text-green-800">{totalHours.toFixed(1)}h</Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Empleados Asignados */}
            <div className="p-4 bg-white rounded-lg border border-orange-200">
              <h3 className="font-bold text-lg mb-3 text-orange-900">👤 EMPLEADOS ASIGNADOS AL PROYECTO</h3>
              {diagnosticData.projectAssignments.length === 0 ? (
                <div>
                  <p className="text-red-600 font-semibold">❌ No hay empleados asignados</p>
                  <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                    <p className="text-sm text-red-800">
                      <strong>💡 Esto es necesario para el Método 2:</strong> Si quieres que el sistema calcule horas desde los calendarios, 
                      debes asignar empleados al proyecto en la página del proyecto → Pestaña "Empleados".
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {diagnosticData.projectAssignments.map(assignment => {
                    const employee = diagnosticData.allEmployees.find(e => e.id === assignment.employee_id);
                    const hasReports = diagnosticData.reportsByEmployee[assignment.employee_id];
                    
                    return (
                      <div key={assignment.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>{employee ? `${employee.first_name} ${employee.last_name}` : 'Desconocido'}</span>
                        {hasReports ? (
                          <Badge className="bg-green-100 text-green-800">✅ Con datos</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">❌ Sin datos</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Calendarios */}
            <div className="p-4 bg-white rounded-lg border border-orange-200">
              <h3 className="font-bold text-lg mb-3 text-orange-900">📅 CALENDARIOS DE {getMonthName(month)}</h3>
              <p className="text-sm text-gray-600">
                Total calendarios creados: <strong>{diagnosticData.monthCalendars.length}</strong>
              </p>
            </div>

            <Button 
              onClick={runDiagnostic} 
              variant="outline"
              className="w-full"
            >
              🔄 Volver a Analizar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}