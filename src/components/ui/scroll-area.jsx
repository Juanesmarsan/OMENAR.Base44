import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


import { Plus, DollarSign, Calendar, Edit, Trash2, FileText, Users } from 'lucide-react';

import CertificationForm from './CertificationForm';

export default function ProjectCertifications({ project }) {
  const [certifications, setCertifications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCertification, setEditingCertification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, totalAmount: 0, currentYear: 0 });

  const loadCertifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.ProjectCertification.filter({ project_id: project.id }, '-created_date');
      setCertifications(data);

      // Calculate stats - usar base_amount (sin IVA) para evitar confusión
      const totalAmount = data.reduce((sum, cert) => sum + (cert.base_amount || 0), 0);
      const currentYear = new Date().getFullYear();
      const currentYearAmount = data
        .filter(cert => cert.year === currentYear)
        .reduce((sum, cert) => sum + (cert.base_amount || 0), 0);

      setStats({
        total: data.length,
        totalAmount,
        currentYear: currentYearAmount
      });

    } catch (error) {
      console.error('Error loading certifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [project.id]);

  useEffect(() => {
    loadCertifications();
  }, [loadCertifications]);

  const handleSubmit = async (certificationData) => {
    try {
      const dataWithProject = { ...certificationData, project_id: project.id };
      
      if (editingCertification) {
        await base44.entities.ProjectCertification.update(editingCertification.id, dataWithProject);
      } else {
        await base44.entities.ProjectCertification.create(dataWithProject);
      }
      
      setShowForm(false);
      setEditingCertification(null);
      loadCertifications();
    } catch (error) {
      console.error('Error saving certification:', error);
      alert(`❌ Error al guardar la certificación:\n\n${error.message}\n\nPor favor, verifica que todos los campos requeridos estén completos.`);
    }
  };

  const handleDelete = async (certification) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta certificación?')) {
      try {
        await base44.entities.ProjectCertification.delete(certification.id);
        loadCertifications();
      } catch (error) {
        console.error('Error deleting certification:', error);
        alert('Error al eliminar la certificación');
      }
    }
  };

  const getMonthName = (month) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1] || `Mes ${month}`;
  };

  const getProjectTypeLabel = () => {
    const labels = {
      administration: "Por Administración",
      budget: "Por Presupuesto",
      certification: "Por Certificación"
    };
    return labels[project.project_type] || project.project_type;
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-md border-0">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Certificaciones del Proyecto</CardTitle>
              <p className="text-gray-600 mt-1">
                Gestiona las certificaciones mensuales - Proyecto {getProjectTypeLabel()}
              </p>
            </div>
            <Button onClick={() => { setEditingCertification(null); setShowForm(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Nueva Certificación
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-900">€{stats.totalAmount.toLocaleString()}</p>
                  <p className="text-sm text-blue-700">Total Certificado (sin IVA)</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-900">€{stats.currentYear.toLocaleString()}</p>
                  <p className="text-sm text-green-700">Año Actual ({new Date().getFullYear()})</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-900">{stats.total}</p>
                  <p className="text-sm text-purple-700">Total Certificaciones</p>
                </div>
              </div>
            </div>
          </div>

          {/* Certifications Display */}
          {isLoading ? (
            <p className="text-center text-gray-500 py-8">Cargando certificaciones...</p>
          ) : certifications.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay certificaciones registradas</h3>
              <p className="text-gray-500 mb-4">Comienza registrando la primera certificación mensual.</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primera Certificación
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {certifications.map((certification) => (
                <Card key={certification.id} className="border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {getMonthName(certification.month)} {certification.year}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {project.project_type === 'administration' && `${certification.certified_hours || 0}h certificadas`}
                          {project.project_type === 'budget' && `€${certification.certified_amount?.toLocaleString() || 0} certificado`}
                          {project.project_type === 'certification' && `${certification.work_concepts?.length || 0} conceptos`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setEditingCertification(certification); setShowForm(true); }}
                          className="hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(certification)}
                          className="hover:bg-red-50 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className={`grid ${certification.has_iva ? 'grid-cols-3' : 'grid-cols-1'} gap-4 mb-4 p-3 bg-gray-50 rounded-lg`}>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Importe Certificado</p>
                        <p className="font-bold text-green-600">€{(certification.base_amount || 0).toLocaleString()}</p>
                      </div>
                      {certification.has_iva && (
                        <>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">IVA ({certification.iva_rate}%)</p>
                            <p className="font-medium">€{(certification.iva_amount || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Total con IVA</p>
                            <p className="font-medium text-gray-700">€{(certification.total_amount || 0).toLocaleString()}</p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Desglose de empleados */}
                    {certification.employee_breakdown && certification.employee_breakdown.length > 0 && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-3 text-sm flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Empleados que Trabajaron ({certification.employee_breakdown.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {certification.employee_breakdown.map((emp, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs p-2 bg-white rounded border border-blue-100">
                              <span className="font-medium text-gray-700">{emp.employee_name}</span>
                              <div className="flex items-center gap-2 text-gray-600">
                                <span className="text-xs">{emp.days_worked}d</span>
                                <span className="font-semibold text-blue-600">{emp.hours_worked.toFixed(1)}h</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-blue-200 flex justify-between items-center text-sm">
                          <span className="font-semibold text-blue-900">Total Horas:</span>
                          <span className="font-bold text-blue-700">
                            {certification.employee_breakdown.reduce((sum, emp) => sum + emp.hours_worked, 0).toFixed(1)}h
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certification Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <CertificationForm
            certification={editingCertification}
            project={project}
            projects={[project]} 
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingCertification(null);
            }}
          />
        </div>
      )}
    </div>
  );
}