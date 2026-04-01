
/**
 * Festivos según el Convenio del Metal de la Comunidad Valenciana (2023-2030)
 * Incluye festivos nacionales + autonómicos CV + locales de Valencia ciudad
 * TOTAL: 14 festivos anuales (9 nacionales + 3 autonómicos + 2 locales)
 */
export const getHolidayInfo = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  // Festivos 2023
  const holidays2023 = {
    // Nacionales (10)
    '2023-01-01': { name: 'Año Nuevo', type: 'national' },
    '2023-01-06': { name: 'Reyes', type: 'national' },
    '2023-04-07': { name: 'Viernes Santo', type: 'national' },
    '2023-05-01': { name: 'Día del Trabajo', type: 'national' },
    '2023-08-15': { name: 'Asunción', type: 'national' },
    '2023-10-12': { name: 'Fiesta Nacional', type: 'national' },
    '2023-11-01': { name: 'Todos los Santos', type: 'national' },
    '2023-12-06': { name: 'Constitución', type: 'national' },
    '2023-12-08': { name: 'Inmaculada', type: 'national' },
    '2023-12-25': { name: 'Navidad', type: 'national' },
    // Autonómicos CV (3)
    '2023-04-10': { name: 'Lunes de Pascua', type: 'regional' },
    '2023-06-24': { name: 'San Juan', type: 'regional' },
    '2023-10-09': { name: 'Día Comunitat Valenciana', type: 'regional' },
    // Locales Valencia (2)
    '2023-01-22': { name: 'San Vicente Mártir', type: 'local' },
    '2023-03-19': { name: 'San José / Fallas', type: 'local' },
  };

  // Festivos 2024
  const holidays2024 = {
    // Nacionales (10)
    '2024-01-01': { name: 'Año Nuevo', type: 'national' },
    '2024-01-06': { name: 'Reyes', type: 'national' },
    '2024-03-29': { name: 'Viernes Santo', type: 'national' },
    '2024-05-01': { name: 'Día del Trabajo', type: 'national' },
    '2024-08-15': { name: 'Asunción', type: 'national' },
    '2024-10-12': { name: 'Fiesta Nacional', type: 'national' },
    '2024-11-01': { name: 'Todos los Santos', type: 'national' },
    '2024-12-06': { name: 'Constitución', type: 'national' },
    '2024-12-08': { name: 'Inmaculada', type: 'national' },
    '2024-12-25': { name: 'Navidad', type: 'national' },
    // Autonómicos CV (3)
    '2024-04-01': { name: 'Lunes de Pascua', type: 'regional' },
    '2024-06-24': { name: 'San Juan', type: 'regional' },
    '2024-10-09': { name: 'Día Comunitat Valenciana', type: 'regional' },
    // Locales Valencia (2)
    '2024-01-22': { name: 'San Vicente Mártir', type: 'local' },
    '2024-03-19': { name: 'San José / Fallas', type: 'local' },
  };

  // Festivos 2025 - Valencia ciudad (14 festivos oficiales)
  const holidays2025 = {
    // Nacionales (10)
    '2025-01-01': { name: 'Año Nuevo', type: 'national' },
    '2025-01-06': { name: 'Reyes', type: 'national' },
    '2025-04-18': { name: 'Viernes Santo', type: 'national' },
    '2025-05-01': { name: 'Día del Trabajador', type: 'national' },
    '2025-08-15': { name: 'Asunción de la Virgen', type: 'national' },
    '2025-10-12': { name: 'Fiesta Nacional', type: 'national' },
    '2025-11-01': { name: 'Todos los Santos', type: 'national' },
    '2025-12-06': { name: 'Constitución', type: 'national' },
    '2025-12-08': { name: 'Inmaculada Concepción', type: 'national' },
    '2025-12-25': { name: 'Navidad', type: 'national' },
    // Autonómicos CV (2)
    '2025-04-21': { name: 'Lunes de Pascua', type: 'regional' },
    '2025-10-09': { name: 'Día Comunitat Valenciana', type: 'regional' },
    // Locales Valencia (2)
    '2025-01-22': { name: 'San Vicente Mártir', type: 'local' },
    '2025-03-19': { name: 'San José', type: 'local' },
  };

  // Festivos 2026
  const holidays2026 = {
    // Nacionales (10)
    '2026-01-01': { name: 'Año Nuevo', type: 'national' },
    '2026-01-06': { name: 'Reyes', type: 'national' },
    '2026-04-03': { name: 'Viernes Santo', type: 'national' },
    '2026-05-01': { name: 'Día del Trabajo', type: 'national' },
    '2026-08-15': { name: 'Asunción', type: 'national' },
    '2026-10-12': { name: 'Fiesta Nacional', type: 'national' },
    '2026-11-01': { name: 'Todos los Santos', type: 'national' },
    '2026-12-06': { name: 'Constitución', type: 'national' },
    '2026-12-08': { name: 'Inmaculada', type: 'national' },
    '2026-12-25': { name: 'Navidad', type: 'national' },
    // Autonómicos CV (3)
    '2026-04-06': { name: 'Lunes de Pascua', type: 'regional' },
    '2026-06-24': { name: 'San Juan', type: 'regional' },
    '2026-10-09': { name: 'Día Comunitat Valenciana', type: 'regional' },
    // Locales Valencia (2)
    '2026-01-22': { name: 'San Vicente Mártir', type: 'local' },
    '2026-03-19': { name: 'San José / Fallas', type: 'local' },
  };

  // Festivos 2027
  const holidays2027 = {
    // Nacionales (10)
    '2027-01-01': { name: 'Año Nuevo', type: 'national' },
    '2027-01-06': { name: 'Reyes', type: 'national' },
    '2027-03-26': { name: 'Viernes Santo', type: 'national' },
    '2027-05-01': { name: 'Día del Trabajo', type: 'national' },
    '2027-08-15': { name: 'Asunción', type: 'national' },
    '2027-10-12': { name: 'Fiesta Nacional', type: 'national' },
    '2027-11-01': { name: 'Todos los Santos', type: 'national' },
    '2027-12-06': { name: 'Constitución', type: 'national' },
    '2027-12-08': { name: 'Inmaculada', type: 'national' },
    '2027-12-25': { name: 'Navidad', type: 'national' },
    // Autonómicos CV (3)
    '2027-03-29': { name: 'Lunes de Pascua', type: 'regional' },
    '2027-06-24': { name: 'San Juan', type: 'regional' },
    '2027-10-09': { name: 'Día Comunitat Valenciana', type: 'regional' },
    // Locales Valencia (2)
    '2027-01-22': { name: 'San Vicente Mártir', type: 'local' },
    '2027-03-19': { name: 'San José / Fallas', type: 'local' },
  };

  // Festivos 2028
  const holidays2028 = {
    // Nacionales (10)
    '2028-01-01': { name: 'Año Nuevo', type: 'national' },
    '2028-01-06': { name: 'Reyes', type: 'national' },
    '2028-04-14': { name: 'Viernes Santo', type: 'national' },
    '2028-05-01': { name: 'Día del Trabajo', type: 'national' },
    '2028-08-15': { name: 'Asunción', type: 'national' },
    '2028-10-12': { name: 'Fiesta Nacional', type: 'national' },
    '2028-11-01': { name: 'Todos los Santos', type: 'national' },
    '2028-12-06': { name: 'Constitución', type: 'national' },
    '2028-12-08': { name: 'Inmaculada', type: 'national' },
    '2028-12-25': { name: 'Navidad', type: 'national' },
    // Autonómicos CV (3)
    '2028-04-17': { name: 'Lunes de Pascua', type: 'regional' },
    '2028-06-24': { name: 'San Juan', type: 'regional' },
    '2028-10-09': { name: 'Día Comunitat Valenciana', type: 'regional' },
    // Locales Valencia (2)
    '2028-01-22': { name: 'San Vicente Mártir', type: 'local' },
    '2028-03-19': { name: 'San José / Fallas', type: 'local' },
  };

  // Festivos 2029
  const holidays2029 = {
    // Nacionales (10)
    '2029-01-01': { name: 'Año Nuevo', type: 'national' },
    '2029-01-06': { name: 'Reyes', type: 'national' },
    '2029-03-30': { name: 'Viernes Santo', type: 'national' },
    '2029-05-01': { name: 'Día del Trabajo', type: 'national' },
    '2029-08-15': { name: 'Asunción', type: 'national' },
    '2029-10-12': { name: 'Fiesta Nacional', type: 'national' },
    '2029-11-01': { name: 'Todos los Santos', type: 'national' },
    '2029-12-06': { name: 'Constitución', type: 'national' },
    '2029-12-08': { name: 'Inmaculada', type: 'national' },
    '2029-12-25': { name: 'Navidad', type: 'national' },
    // Autonómicos CV (3)
    '2029-04-02': { name: 'Lunes de Pascua', type: 'regional' },
    '2029-06-24': { name: 'San Juan', type: 'regional' },
    '2029-10-09': { name: 'Día Comunitat Valenciana', type: 'regional' },
    // Locales Valencia (2)
    '2029-01-22': { name: 'San Vicente Mártir', type: 'local' },
    '2029-03-19': { name: 'San José / Fallas', type: 'local' },
  };

  // Festivos 2030
  const holidays2030 = {
    // Nacionales (10)
    '2030-01-01': { name: 'Año Nuevo', type: 'national' },
    '2030-01-06': { name: 'Reyes', type: 'national' },
    '2030-04-19': { name: 'Viernes Santo', type: 'national' },
    '2030-05-01': { name: 'Día del Trabajo', type: 'national' },
    '2030-08-15': { name: 'Asunción', type: 'national' },
    '2030-10-12': { name: 'Fiesta Nacional', type: 'national' },
    '2030-11-01': { name: 'Todos los Santos', type: 'national' },
    '2030-12-06': { name: 'Constitución', type: 'national' },
    '2030-12-08': { name: 'Inmaculada', type: 'national' },
    '2030-12-25': { name: 'Navidad', type: 'national' },
    // Autonómicos CV (3)
    '2030-04-22': { name: 'Lunes de Pascua', type: 'regional' },
    '2030-06-24': { name: 'San Juan', type: 'regional' },
    '2030-10-09': { name: 'Día Comunitat Valenciana', type: 'regional' },
    // Locales Valencia (2)
    '2030-01-22': { name: 'San Vicente Mártir', type: 'local' },
    '2030-03-19': { name: 'San José / Fallas', type: 'local' },
  };

  const allHolidays = {
    ...holidays2023,
    ...holidays2024,
    ...holidays2025,
    ...holidays2026,
    ...holidays2027,
    ...holidays2028,
    ...holidays2029,
    ...holidays2030
  };

  console.log('DEBUG: Buscando festivo para:', dateStr, 'Resultado:', allHolidays[dateStr]);
  return allHolidays[dateStr] || null;
};

/**
 * Calcula las estadísticas mensuales de horas trabajadas
 */
export const calculateMonthlyHours = (calendarData) => {
  let laborHours = 0;
  let realHours = 0;
  let extraHours = 0;
  let holidayHours = 0;

  calendarData.forEach(day => {
    // Solo contar días con estado "normal" (trabajados efectivamente)
    if (day.status === 'normal') {
      const standard = parseFloat(day.standard_hours) || 0;
      const actual = parseFloat(day.actual_hours) || 0;

      laborHours += standard;
      realHours += actual;

      // Horas festivas: solo domingos y festivos oficiales
      if (day.day_type === 'sunday' || day.day_type === 'holiday') {
        holidayHours += actual;
      }
      // Horas extra en sábados: TODAS las horas (no es laboral pero tampoco festivo)
      else if (day.day_type === 'saturday') {
        extraHours += actual;
      }
      // Horas extra en días laborables: exceso sobre las horas estándar
      else if (day.day_type === 'workday' && actual > standard) {
        extraHours += (actual - standard);
      }
    }
  });

  return {
    laborHours: Math.round(laborHours * 10) / 10,
    realHours: Math.round(realHours * 10) / 10,
    extraHours: Math.round(extraHours * 10) / 10,
    holidayHours: Math.round(holidayHours * 10) / 10
  };
};

/**
 * Obtiene el color de fondo según el tipo de día y estado
 */
export const getDayBackgroundColor = (dayType, status) => {
  if (status === 'vacation') return 'bg-blue-100 border-blue-300';
  if (status === 'sick_leave') return 'bg-red-100 border-red-300';
  if (status === 'absence') return 'bg-gray-200 border-gray-400';
  if (status === 'personal_matters') return 'bg-yellow-100 border-yellow-300';

  // Estado normal
  if (dayType === 'holiday') return 'bg-purple-50 border-purple-200';
  if (dayType === 'sunday') return 'bg-red-50 border-red-200';
  if (dayType === 'saturday') return 'bg-orange-50 border-orange-200';
  return 'bg-white border-gray-200';
};

/**
 * Obtiene el color del texto de horas según si son horas extra o festivas
 */
export const getHoursTextColor = (dayType, actualHours, standardHours) => {
  if (dayType === 'saturday' || dayType === 'sunday' || dayType === 'holiday') {
    return actualHours > 0 ? 'text-purple-700 font-bold' : 'text-gray-400';
  }
  if (dayType === 'workday' && actualHours > standardHours) {
    return 'text-green-700 font-bold';
  }
  return 'text-gray-900';
};