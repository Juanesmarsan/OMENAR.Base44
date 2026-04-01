/**
 * Custom Hook: useForm
 * Maneja estado, validación y envío de formularios
 */

import { useState, useCallback } from 'react';

export const useForm = (
  initialValues,
  onSubmit,           // Función que se ejecuta al enviar
  validators = {}     // Validadores por campo
) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Validar campo individual
  const validateField = useCallback((name, value) => {
    const validator = validators[name];
    if (!validator) return null;

    try {
      validator(value);
      return null;
    } catch (err) {
      return err.message;
    }
  }, [validators]);

  // Validar todos los campos
  const validateForm = useCallback(() => {
    const newErrors = {};
    Object.keys(values).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
      }
    });
    return newErrors;
  }, [values, validateField]);

  // Manejar cambio en campo
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setValues(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Validar si el campo fue tocado
    if (touched[name]) {
      const error = validateField(name, newValue);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  }, [touched, validateField]);

  // Marcar campo como tocado
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const error = validateField(name, values[name]);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, [values, validateField]);

  // Enviar formulario
  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    
    // Validar todos los campos
    const newErrors = validateForm();
    setTouched(
      Object.keys(values).reduce((acc, key) => ({
        ...acc,
        [key]: true
      }), {})
    );

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(values);
    } catch (err) {
      setSubmitError(err.message || 'Error al enviar formulario');
    } finally {
      setIsSubmitting(false);
    }
  }, [values, onSubmit, validateForm]);

  // Resetear formulario
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setSubmitError(null);
  }, [initialValues]);

  // Establecer valores
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Establecer error en campo
  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    submitError,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
    setValues,
    setErrors,
    isValid: Object.keys(errors).length === 0
  };
};

export default useForm;
