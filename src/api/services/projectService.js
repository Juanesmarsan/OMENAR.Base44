/**
 * Project Service
 * Centraliza todas las llamadas API relacionadas con proyectos
 */

import { base44 } from '@/api/base44Client';

class ProjectService {
  /**
   * Obtener lista de proyectos
   */
  static async getAll(filters = {}) {
    try {
      const response = await base44.entities.Project.list();
      return response;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  /**
   * Obtener proyecto por ID
   */
  static async getById(id) {
    try {
      const response = await base44.entities.Project.filter({ id });
      return response[0] || null;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo proyecto
   */
  static async create(projectData) {
    try {
      const response = await base44.entities.Project.create(projectData);
      return response;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  /**
   * Actualizar proyecto
   */
  static async update(id, projectData) {
    try {
      const response = await base44.entities.Project.update(id, projectData);
      return response;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  /**
   * Eliminar proyecto
   */
  static async delete(id) {
    try {
      await base44.entities.Project.delete(id);
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  /**
   * Obtener certificaciones de un proyecto
   */
  static async getCertifications(projectId) {
    try {
      const response = await base44.entities.ProjectCertification.filter({
        project_id: projectId
      });
      return response;
    } catch (error) {
      console.error('Error fetching certifications:', error);
      throw error;
    }
  }

  /**
   * Obtener gastos directos de un proyecto
   */
  static async getDirectExpenses(projectId) {
    try {
      const response = await base44.entities.ProjectDirectExpense.filter({
        project_id: projectId
      });
      return response;
    } catch (error) {
      console.error('Error fetching direct expenses:', error);
      throw error;
    }
  }

  /**
   * Obtener empleados asignados a un proyecto
   */
  static async getAssignedEmployees(projectId) {
    try {
      const response = await base44.entities.ProjectAssignment.filter({
        project_id: projectId
      });
      return response;
    } catch (error) {
      console.error('Error fetching project assignments:', error);
      throw error;
    }
  }

  /**
   * Obtener fases de un proyecto
   */
  static async getPhases(projectId) {
    try {
      const response = await base44.entities.ProjectPhase.filter({
        project_id: projectId
      });
      return response;
    } catch (error) {
      console.error('Error fetching project phases:', error);
      throw error;
    }
  }

  /**
   * Obtener análisis financiero de un proyecto
   */
  static async getFinancialSnapshot(projectId, year, month) {
    try {
      const response = await base44.entities.ProjectFinancialSnapshot.filter({
        project_id: projectId,
        year,
        month
      });
      return response[0] || null;
    } catch (error) {
      console.error('Error fetching financial snapshot:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las snapshots financieras de un proyecto
   */
  static async getFinancialSnapshots(projectId) {
    try {
      const response = await base44.entities.ProjectFinancialSnapshot.filter({
        project_id: projectId
      });
      return response;
    } catch (error) {
      console.error('Error fetching financial snapshots:', error);
      throw error;
    }
  }
}

export default ProjectService;
