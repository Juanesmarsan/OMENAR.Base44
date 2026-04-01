/**
 * Employee Service
 * Centraliza todas las llamadas API relacionadas con empleados
 */

import { base44 } from '@/api/base44Client';

class EmployeeService {
  /**
   * Obtener lista de empleados
   */
  static async getAll(filters = {}) {
    try {
      const params = new URLSearchParams(filters);
      const response = await base44.entities.Employee.list();
      return response;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  }

  /**
   * Obtener empleado por ID
   */
  static async getById(id) {
    try {
      const response = await base44.entities.Employee.filter({ id });
      return response[0] || null;
    } catch (error) {
      console.error('Error fetching employee:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo empleado
   */
  static async create(employeeData) {
    try {
      const response = await base44.entities.Employee.create(employeeData);
      return response;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  }

  /**
   * Actualizar empleado
   */
  static async update(id, employeeData) {
    try {
      const response = await base44.entities.Employee.update(id, employeeData);
      return response;
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  }

  /**
   * Eliminar empleado
   */
  static async delete(id) {
    try {
      await base44.entities.Employee.delete(id);
      return true;
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  }

  /**
   * Obtener salarios de un empleado
   */
  static async getSalaries(employeeId) {
    try {
      const response = await base44.entities.EmployeeSalary.filter({ 
        employee_id: employeeId 
      });
      return response;
    } catch (error) {
      console.error('Error fetching salaries:', error);
      throw error;
    }
  }

  /**
   * Obtener gastos variables de un empleado
   */
  static async getVariableExpenses(employeeId) {
    try {
      const response = await base44.entities.EmployeeVariableExpense.filter({ 
        employee_id: employeeId 
      });
      return response;
    } catch (error) {
      console.error('Error fetching variable expenses:', error);
      throw error;
    }
  }

  /**
   * Obtener avances de un empleado
   */
  static async getAdvances(employeeId) {
    try {
      const response = await base44.entities.EmployeeAdvance.filter({ 
        employee_id: employeeId 
      });
      return response;
    } catch (error) {
      console.error('Error fetching advances:', error);
      throw error;
    }
  }

  /**
   * Obtener calendario de trabajo de un empleado
   */
  static async getWorkCalendar(employeeId, year, month) {
    try {
      const response = await base44.entities.WorkCalendar.filter({
        employee_id: employeeId,
        year,
        month
      });
      return response;
    } catch (error) {
      console.error('Error fetching work calendar:', error);
      throw error;
    }
  }

  /**
   * Obtener asignaciones de proyectos de un empleado
   */
  static async getProjectAssignments(employeeId) {
    try {
      const response = await base44.entities.ProjectAssignment.filter({
        employee_id: employeeId
      });
      return response;
    } catch (error) {
      console.error('Error fetching project assignments:', error);
      throw error;
    }
  }
}

export default EmployeeService;
