/**
 * Financial Service
 * Centraliza todas las llamadas API relacionadas con finanzas
 */

import { base44 } from '@/api/base44Client';

class FinancialService {
  /**
   * Obtener certificaciones
   */
  static async getCertifications(filters = {}) {
    try {
      const response = await base44.entities.ProjectCertification.list();
      return response;
    } catch (error) {
      console.error('Error fetching certifications:', error);
      throw error;
    }
  }

  /**
   * Obtener gastos fijos
   */
  static async getFixedExpenses() {
    try {
      const response = await base44.entities.FixedExpense.list();
      return response;
    } catch (error) {
      console.error('Error fetching fixed expenses:', error);
      throw error;
    }
  }

  /**
   * Crear gasto fijo
   */
  static async createFixedExpense(expenseData) {
    try {
      const response = await base44.entities.FixedExpense.create(expenseData);
      return response;
    } catch (error) {
      console.error('Error creating fixed expense:', error);
      throw error;
    }
  }

  /**
   * Actualizar gasto fijo
   */
  static async updateFixedExpense(id, expenseData) {
    try {
      const response = await base44.entities.FixedExpense.update(id, expenseData);
      return response;
    } catch (error) {
      console.error('Error updating fixed expense:', error);
      throw error;
    }
  }

  /**
   * Eliminar gasto fijo
   */
  static async deleteFixedExpense(id) {
    try {
      await base44.entities.FixedExpense.delete(id);
      return true;
    } catch (error) {
      console.error('Error deleting fixed expense:', error);
      throw error;
    }
  }

  /**
   * Obtener salarios de un empleado
   */
  static async getEmployeeSalaries(employeeId) {
    try {
      const response = await base44.entities.EmployeeSalary.filter({
        employee_id: employeeId
      });
      return response;
    } catch (error) {
      console.error('Error fetching employee salaries:', error);
      throw error;
    }
  }

  /**
   * Crear salario de empleado
   */
  static async createEmployeeSalary(salaryData) {
    try {
      const response = await base44.entities.EmployeeSalary.create(salaryData);
      return response;
    } catch (error) {
      console.error('Error creating employee salary:', error);
      throw error;
    }
  }

  /**
   * Actualizar salario de empleado
   */
  static async updateEmployeeSalary(id, salaryData) {
    try {
      const response = await base44.entities.EmployeeSalary.update(id, salaryData);
      return response;
    } catch (error) {
      console.error('Error updating employee salary:', error);
      throw error;
    }
  }

  /**
   * Obtener plan financiero
   */
  static async getFinancialPlans() {
    try {
      const response = await base44.entities.FinancialPlan.list();
      return response;
    } catch (error) {
      console.error('Error fetching financial plans:', error);
      throw error;
    }
  }

  /**
   * Obtener snapshots financieros de proyectos
   */
  static async getProjectFinancialSnapshots(projectId) {
    try {
      const response = await base44.entities.ProjectFinancialSnapshot.filter({
        project_id: projectId
      });
      return response;
    } catch (error) {
      console.error('Error fetching project snapshots:', error);
      throw error;
    }
  }

  /**
   * Crear snapshot financiero
   */
  static async createFinancialSnapshot(snapshotData) {
    try {
      const response = await base44.entities.ProjectFinancialSnapshot.create(snapshotData);
      return response;
    } catch (error) {
      console.error('Error creating financial snapshot:', error);
      throw error;
    }
  }

  /**
   * Obtener pagos vencidos
   */
  static async getPaymentsDue() {
    try {
      // Obtener certificaciones sin pagar
      const certs = await this.getCertifications();
      const unpaid = certs.filter(cert => !cert.paid);
      return unpaid;
    } catch (error) {
      console.error('Error fetching payments due:', error);
      throw error;
    }
  }
}

export default FinancialService;
