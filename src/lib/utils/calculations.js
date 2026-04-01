/**
 * Funciones de cálculo compartidas
 * Elimina duplicación de lógica financiera y de horas
 */

/**
 * Calcula IVA y montos totales
 * @param {number} baseAmount - Monto base sin IVA
 * @param {number} ivaRate - Porcentaje de IVA (ej: 21)
 * @param {boolean} isInclusive - Si el monto base ya incluye IVA
 * @returns {object} {basisAmount, ivaAmount, totalAmount}
 */
export const calculateIVA = (baseAmount, ivaRate, isInclusive = false) => {
  const base = parseFloat(baseAmount) || 0;
  const rate = parseFloat(ivaRate) || 0;

  if (!isInclusive) {
    // El monto base no incluye IVA
    const ivaAmount = (base * rate) / 100;
    return {
      basisAmount: base,
      ivaAmount,
      totalAmount: base + ivaAmount
    };
  } else {
    // El monto base ya incluye IVA
    const divisor = 1 + (rate / 100);
    const basisAmount = base / divisor;
    const ivaAmount = base - basisAmount;
    return {
      basisAmount,
      ivaAmount,
      totalAmount: base
    };
  }
};

/**
 * Calcula estadísticas básicas de un array de valores
 * @param {array} data - Array de valores
 * @param {string} fieldName - Nombre del campo a sumar
 * @returns {object} {total, count, average, min, max}
 */
export const calculateStats = (data, fieldName = 'amount') => {
  if (!data || data.length === 0) {
    return { total: 0, count: 0, average: 0, min: 0, max: 0 };
  }

  const values = data.map(item => parseFloat(item[fieldName]) || 0);
  const total = values.reduce((sum, val) => sum + val, 0);
  const count = data.length;
  const average = count > 0 ? total / count : 0;
  const min = Math.min(...values);
  const max = Math.max(...values);

  return { total, count, average, min, max };
};

/**
 * Calcula horas trabajadas en un período
 * @param {array} calendarData - Array de registros de calendario
 * @param {string} fieldName - Nombre del campo de horas (ej: actual_hours)
 * @param {function} filter - Función de filtro opcional
 * @returns {number} Total de horas
 */
export const calculateTotalHours = (calendarData, fieldName = 'actual_hours', filter = null) => {
  let data = calendarData || [];
  if (filter) {
    data = data.filter(filter);
  }
  return data.reduce((sum, record) => sum + (parseFloat(record[fieldName]) || 0), 0);
};

/**
 * Calcula horas extra y festivas desde calendario
 * @param {array} workCalendarData - Array de días de calendario
 * @returns {object} {extraHours, holidayHours}
 */
export const calculateExtraAndHolidayHours = (workCalendarData) => {
  let extraHours = 0;
  let holidayHours = 0;

  workCalendarData.forEach(day => {
    const actualHours = parseFloat(day.actual_hours) || 0;
    const standardHours = parseFloat(day.standard_hours) || 0;
    const dayType = day.day_type;
    const dayStatus = day.status || 'normal';

    // Solo contar días con estado normal
    if (dayStatus !== 'normal') return;

    if (dayType === 'sunday' || dayType === 'holiday') {
      // Todas las horas trabajadas en domingos o festivos son horas festivas
      holidayHours += actualHours;
    } else if (dayType === 'saturday') {
      // Todas las horas trabajadas en sábados son horas extra
      extraHours += actualHours;
    } else if (dayType === 'workday' && actualHours > standardHours) {
      // En días laborables, solo las horas por encima del estándar son extra
      extraHours += (actualHours - standardHours);
    }
  });

  return { extraHours, holidayHours };
};

/**
 * Calcula prorrateo de gastos fijos
 * @param {number} totalFixedExpenses - Total de gastos fijos
 * @param {number} operariosCount - Número de operarios
 * @param {number} daysWorked - Días trabajados en el mes
 * @param {number} daysInMonth - Días totales en el mes
 * @returns {number} Gasto fijo prorrateado por operario
 */
export const calculateProratedFixedExpense = (
  totalFixedExpenses,
  operariosCount,
  daysWorked = null,
  daysInMonth = 30
) => {
  if (operariosCount <= 0) return 0;

  const expensePerOperario = totalFixedExpenses / operariosCount;

  // Si se especifica días trabajados, prorratear también por tiempo
  if (daysWorked !== null) {
    return (expensePerOperario / daysInMonth) * daysWorked;
  }

  return expensePerOperario;
};

/**
 * Calcula salario neto (bruto descuentos)
 * @param {number} grossSalary - Salario bruto
 * @param {number} employeeSS - Descuento SS Trabajador (%)
 * @param {number} retention - Retención (%)
 * @returns {number} Salario neto
 */
export const calculateNetSalary = (grossSalary, employeeSS = 6.35, retention = 15) => {
  const gross = parseFloat(grossSalary) || 0;
  const ssDeduction = (gross * employeeSS) / 100;
  const retentionDeduction = (gross * retention) / 100;
  return gross - ssDeduction - retentionDeduction;
};

/**
 * Calcula coste total de empleado (salario + SS empresa + gastos)
 * @param {number} baseSalary - Salario base
 * @param {number} companySS - SS Empresa (%)
 * @param {number} variableExpenses - Gastos variables
 * @param {number} fixedExpenseAllocation - Asignación gastos fijos
 * @returns {number} Coste total
 */
export const calculateTotalEmployeeCost = (
  baseSalary,
  companySS = 30,
  variableExpenses = 0,
  fixedExpenseAllocation = 0
) => {
  const salary = parseFloat(baseSalary) || 0;
  const ss = (salary * companySS) / 100;
  const varExp = parseFloat(variableExpenses) || 0;
  const fixedExp = parseFloat(fixedExpenseAllocation) || 0;

  return salary + ss + varExp + fixedExp;
};

/**
 * Filtra array por rango de fechas
 * @param {array} data - Array con fecha
 * @param {string} dateField - Nombre del campo de fecha
 * @param {Date} startDate - Fecha inicio
 * @param {Date} endDate - Fecha fin
 * @returns {array} Array filtrado
 */
export const filterByDateRange = (data, dateField, startDate, endDate) => {
  if (!data || data.length === 0) return [];

  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  return data.filter(item => {
    const itemDate = new Date(item[dateField]);
    return itemDate >= start && itemDate <= end;
  });
};

export default {
  calculateIVA,
  calculateStats,
  calculateTotalHours,
  calculateExtraAndHolidayHours,
  calculateProratedFixedExpense,
  calculateNetSalary,
  calculateTotalEmployeeCost,
  filterByDateRange
};
