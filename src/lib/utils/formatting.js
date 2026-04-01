/**
 * Funciones de formateo compartidas para toda la aplicación
 * Elimina duplicación de código
 */

/**
 * Formatea un valor numérico como moneda en euros
 * @param {number} value - Valor a formatear
 * @returns {string} Valor formateado (ej: €1.234,56)
 */
export const formatCurrency = (value) => {
  if (value === null || value === undefined) return '€0,00';
  const numValue = parseFloat(value) || 0;
  return `€${numValue.toLocaleString('es-ES', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

/**
 * Formatea minutos a formato HH:mm
 * @param {number} minutes - Minutos a formatear
 * @returns {string} Tiempo formateado (ej: 02:45)
 */
export const formatTime = (minutes) => {
  if (!minutes) return '00:00';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Formatea horas extras con signo
 * @param {number} hours - Horas a formatear
 * @returns {string} Horas formateadas (ej: +8h, -2h, 0h)
 */
export const formatHours = (hours) => {
  if (hours === 0) return '0h';
  return `${hours > 0 ? '+' : ''}${hours}h`;
};

/**
 * Formatea duración de sesión (minutos a horas y minutos)
 * @param {number} minutes - Duración en minutos
 * @returns {string} Duración formateada (ej: 2h 30m, 45m, En curso)
 */
export const formatSessionDuration = (minutes) => {
  if (!minutes) return 'En curso';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

/**
 * Formatea mes (índice 1-12) a nombre abreviado con año
 * @param {number} year - Año
 * @param {number} month - Mes (1-12)
 * @returns {string} Mes formateado (ej: Ene 2024)
 */
export const formatMonthYear = (year, month) => {
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
};

/**
 * Formatea una clave de mes (ej: 2024-05) a nombre legible
 * @param {string} monthKey - Clave en formato "YYYY-MM"
 * @returns {string} Mes formateado (ej: May 2024)
 */
export const formatMonthKey = (monthKey) => {
  if (!monthKey || typeof monthKey !== 'string') return '';
  const [year, month] = monthKey.split('-');
  return formatMonthYear(year, month);
};

/**
 * Formatea número de semana a rango de días
 * @param {Date} weekStartDate - Fecha de inicio de semana
 * @param {Date} weekEndDate - Fecha de fin de semana
 * @param {object} locale - Locale de date-fns
 * @returns {string} Rango formateado (ej: 15-21 Ene)
 */
export const formatWeekRange = (weekStartDate, weekEndDate, locale) => {
  if (!weekStartDate || !weekEndDate) return '';
  const { format } = require('date-fns');
  const start = format(weekStartDate, 'd MMM', { locale });
  const end = format(weekEndDate, 'd MMM', { locale });
  return `${start} - ${end}`;
};

/**
 * Formatea estado a etiqueta legible y color
 * @param {string} status - Estado
 * @returns {object} Objeto con label y color
 */
export const formatStatusBadge = (status) => {
  const statusStyles = {
    'active': { label: 'Activo', color: 'bg-green-100 text-green-800 border-green-200' },
    'closed': { label: 'Cerrado', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    'timeout': { label: 'Timeout', color: 'bg-red-100 text-red-800 border-red-200' },
    'on_track': { label: 'En marcha', color: 'bg-green-100 text-green-800' },
    'at_risk': { label: 'En riesgo', color: 'bg-yellow-100 text-yellow-800' },
    'achieved': { label: 'Conseguido', color: 'bg-blue-100 text-blue-800' },
    'delayed': { label: 'Retrasado', color: 'bg-red-100 text-red-800' },
  };
  return statusStyles[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
};

export default {
  formatCurrency,
  formatTime,
  formatHours,
  formatSessionDuration,
  formatMonthYear,
  formatMonthKey,
  formatWeekRange,
  formatStatusBadge
};
