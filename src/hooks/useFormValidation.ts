import { useState } from 'react';
import { z } from 'zod';

export function useFormValidation<T extends z.ZodType>(schema: T) {
  const [values, setValues] = useState<z.infer<T>>({} as z.infer<T>);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (data: z.infer<T>): boolean => {
    try {
      schema.parse(data);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleChange = (field: keyof z.infer<T>) => (value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (onSubmit: (data: z.infer<T>) => void) => () => {
    if (validate(values)) {
      onSubmit(values);
    }
  };

  const resetForm = () => {
    setValues({} as z.infer<T>);
    setErrors({});
  };

  const getFieldError = (field: string): string | undefined => {
    return errors[field];
  };

  const clearErrors = () => {
    setErrors({});
  };

  return {
    values,
    errors,
    handleChange,
    handleSubmit,
    resetForm,
    validate,
    getFieldError,
    clearErrors,
  };
} 