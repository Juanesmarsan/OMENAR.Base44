/**
 * Validadores Centralizados
 * Funciones de validación reutilizables para toda la aplicación
 */

/**
 * Validadores básicos
 */
export const Validators = {
  /**
   * Validar email
   */
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error('El correo electrónico no es válido');
    }
    return true;
  },

  /**
   * Validar contraseña (mínimo 8 caracteres)
   */
  password: (value) => {
    if (value.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }
    return true;
  },

  /**
   * Validar campo requerido
   */
  required: (value, fieldName = 'Este campo') => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      throw new Error(`${fieldName} es requerido`);
    }
    return true;
  },

  /**
   * Validar número
   */
  number: (value, fieldName = 'Este campo') => {
    if (isNaN(value) || value === '') {
      throw new Error(`${fieldName} debe ser un número`);
    }
    return true;
  },

  /**
   * Validar número positivo
   */
  positiveNumber: (value, fieldName = 'Este campo') => {
    Validators.number(value, fieldName);
    const num = parseFloat(value);
    if (num <= 0) {
      throw new Error(`${fieldName} debe ser un número positivo`);
    }
    return true;
  },

  /**
   * Validar moneda
   */
  currency: (value, fieldName = 'Este campo') => {
    const currencyRegex = /^\d+(\.\d{1,2})?$/;
    if (!currencyRegex.test(value)) {
      throw new Error(`${fieldName} debe ser un importe válido (ej: 100.50)`);
    }
    return true;
  },

  /**
   * Validar fecha
   */
  date: (value, fieldName = 'Este campo') => {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error(`${fieldName} debe ser una fecha válida`);
    }
    return true;
  },

  /**
   * Validar fecha mínima
   */
  minDate: (value, minDate, fieldName = 'Este campo') => {
    Validators.date(value, fieldName);
    const date = new Date(value);
    const min = new Date(minDate);
    if (date < min) {
      throw new Error(`${fieldName} no puede ser anterior a ${minDate}`);
    }
    return true;
  },

  /**
   * Validar fecha máxima
   */
  maxDate: (value, maxDate, fieldName = 'Este campo') => {
    Validators.date(value, fieldName);
    const date = new Date(value);
    const max = new Date(maxDate);
    if (date > max) {
      throw new Error(`${fieldName} no puede ser posterior a ${maxDate}`);
    }
    return true;
  },

  /**
   * Validar longitud mínima
   */
  minLength: (value, min, fieldName = 'Este campo') => {
    if (value.length < min) {
      throw new Error(`${fieldName} debe tener al menos ${min} caracteres`);
    }
    return true;
  },

  /**
   * Validar longitud máxima
   */
  maxLength: (value, max, fieldName = 'Este campo') => {
    if (value.length > max) {
      throw new Error(`${fieldName} no puede exceder ${max} caracteres`);
    }
    return true;
  },

  /**
   * Validar URL
   */
  url: (value, fieldName = 'Este campo') => {
    try {
      new URL(value);
      return true;
    } catch {
      throw new Error(`${fieldName} debe ser una URL válida`);
    }
  },

  /**
   * Validar teléfono
   */
  phone: (value, fieldName = 'Este campo') => {
    const phoneRegex = /^[\d\s\-\+\(\)]{7,}$/;
    if (!phoneRegex.test(value)) {
      throw new Error(`${fieldName} no es un teléfono válido`);
    }
    return true;
  },

  /**
   * Validar DNI/Documento
   */
  document: (value, fieldName = 'Este campo') => {
    const docRegex = /^[0-9]{8}[A-Z]$|^[XYZ][0-9]{7}[A-Z]$/;
    if (!docRegex.test(value)) {
      throw new Error(`${fieldName} no es un documento válido`);
    }
    return true;
  },

  /**
   * Validar rango de números
   */
  range: (value, min, max, fieldName = 'Este campo') => {
    Validators.number(value, fieldName);
    const num = parseFloat(value);
    if (num < min || num > max) {
      throw new Error(`${fieldName} debe estar entre ${min} y ${max}`);
    }
    return true;
  },

  /**
   * Validador personalizado
   */
  custom: (value, validatorFn, errorMessage) => {
    if (!validatorFn(value)) {
      throw new Error(errorMessage || 'Validación fallida');
    }
    return true;
  }
};

/**
 * Validadores para formularios específicos
 */
export const FormValidators = {
  /**
   * Validar formulario de empleado
   */
  employeeForm: {
    email: (value) => {
      Validators.required(value, 'Email');
      Validators.email(value);
    },
    firstName: (value) => {
      Validators.required(value, 'Nombre');
      Validators.minLength(value, 2, 'Nombre');
    },
    lastName: (value) => {
      Validators.required(value, 'Apellido');
      Validators.minLength(value, 2, 'Apellido');
    },
    position: (value) => {
      Validators.required(value, 'Posición');
    },
    baseSalary: (value) => {
      Validators.required(value, 'Salario base');
      Validators.positiveNumber(value, 'Salario base');
    }
  },

  /**
   * Validar formulario de proyecto
   */
  projectForm: {
    name: (value) => {
      Validators.required(value, 'Nombre del proyecto');
      Validators.minLength(value, 3, 'Nombre del proyecto');
    },
    budget: (value) => {
      Validators.required(value, 'Presupuesto');
      Validators.positiveNumber(value, 'Presupuesto');
    },
    startDate: (value) => {
      Validators.required(value, 'Fecha de inicio');
      Validators.date(value, 'Fecha de inicio');
    },
    endDate: (value) => {
      Validators.required(value, 'Fecha de fin');
      Validators.date(value, 'Fecha de fin');
    }
  },

  /**
   * Validar formulario de pago
   */
  paymentForm: {
    amount: (value) => {
      Validators.required(value, 'Monto');
      Validators.positiveNumber(value, 'Monto');
      Validators.currency(value, 'Monto');
    },
    date: (value) => {
      Validators.required(value, 'Fecha de pago');
      Validators.date(value, 'Fecha de pago');
    },
    method: (value) => {
      Validators.required(value, 'Método de pago');
    }
  },

  /**
   * Validar formulario de gasto
   */
  expenseForm: {
    amount: (value) => {
      Validators.required(value, 'Monto');
      Validators.positiveNumber(value, 'Monto');
    },
    category: (value) => {
      Validators.required(value, 'Categoría');
    },
    date: (value) => {
      Validators.required(value, 'Fecha del gasto');
      Validators.date(value, 'Fecha del gasto');
    },
    description: (value) => {
      Validators.required(value, 'Descripción');
      Validators.minLength(value, 5, 'Descripción');
    }
  }
};

export default Validators;
