import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Home,
  Plus,
  Edit,
  Trash2,
  Download,
  Users,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import AccommodationForm from "./accommodation/AccommodationForm";

export default function AccommodationTab() {
  const [accommodations, setAccommodations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAccommodation, setEditingAccommodation] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [accommodationsData, employeesData, projectsData] = await Promise.all([
        base44.entities.WorkerAccommodation.list('-occupation_start'),
        base44.entities.Employee.list(),
        base44.entities.Project.list()
      ]);
      
      setAccommodations(accommodationsData);
      setEmployees(employeesData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading accommodation data:', error);
    }
  };

  const handleDelete = async (accommodation) => {
    if (confirm('¿Eliminar este registro de alojamiento?')) {
      try {
        await base44.entities.WorkerAccommodation.delete(accommodation.id);
        loadData();
      } catch (error) {
        console.error('Error deleting accommodation:', error);
      }
    }
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : '-';
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: { class: "bg-green-100 text-green-800", label: "Activo" },
      finished: { class: "bg-gray-100 text-gray-800", label: "Finalizado" },
      cancelled: { class: "bg-red-100 text-red-800", label: "Cancelado" }
    };
    const variant = variants[status] || variants.active;
    return <Badge className={variant.class}>{variant.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Alojamiento de Trabajadores</h2>
          <p className="text-gray-600">Control de alojamientos para trabajadores desplazados</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Generar Compromiso
          </Button>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Alojamiento
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Alojamientos Activos</p>
                <p className="text-3xl font-bold text-gray-900">
                  {accommodations.filter(a => a.status === 'active').length}
                </p>
              </div>
              <Home className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Trabajadores Alojados</p>
                <p className="text-3xl font-bold text-gray-900">
                  {accommodations
                    .filter(a => a.status === 'active')
                    .reduce((sum, a) => sum + (a.workers?.length || 0), 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Compromisos Firmados</p>
                <p className="text-3xl font-bold text-gray-900">
                  {accommodations.filter(a => a.commitment_signed).length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dirección</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead>Periodo</TableHead>
                <TableHead>Trabajadores</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Compromiso</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accommodations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No hay alojamientos registrados
                  </TableCell>
                </TableRow>
              ) : (
                accommodations.map((accommodation) => (
                  <TableRow key={accommodation.id}>
                    <TableCell className="font-medium">
                      {accommodation.accommodation_address}
                    </TableCell>
                    <TableCell className="capitalize">
                      {accommodation.accommodation_type}
                    </TableCell>
                    <TableCell>{getProjectName(accommodation.project_id)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{format(new Date(accommodation.occupation_start), 'dd/MM/yyyy', { locale: es })}</div>
                        {accommodation.occupation_end && (
                          <div className="text-gray-500">
                            - {format(new Date(accommodation.occupation_end), 'dd/MM/yyyy', { locale: es })}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {accommodation.workers?.length || 0} trabajadores
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(accommodation.status)}</TableCell>
                    <TableCell>
                      {accommodation.commitment_signed ? (
                        <Badge className="bg-green-100 text-green-800">Firmado</Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingAccommodation(accommodation);
                            setShowForm(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(accommodation)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <AccommodationForm
              accommodation={editingAccommodation}
              employees={employees}
              projects={projects}
              onSubmit={async (data) => {
                try {
                  if (editingAccommodation) {
                    await base44.entities.WorkerAccommodation.update(editingAccommodation.id, data);
                  } else {
                    await base44.entities.WorkerAccommodation.create(data);
                  }
                  setShowForm(false);
                  setEditingAccommodation(null);
                  loadData();
                } catch (error) {
                  console.error('Error saving accommodation:', error);
                }
              }}
              onCancel={() => {
                setShowForm(false);
                setEditingAccommodation(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}