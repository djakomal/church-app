import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { UserRole } from '@/context/AuthContext';

interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

interface FormValidationResult {
  isValid: boolean;
  error?: string;
}

export function useFormValidation<T extends object>() {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  
  const validateField = useCallback(<K extends keyof T>(
    field: K, 
    value: T[K], 
    validators: ((value: T[K]) => string | undefined)[]
  ): boolean => {
    const fieldErrors = validators
      .map(validator => validator(value))
      .filter(error => error !== undefined);
    
    if (fieldErrors.length > 0) {
      setErrors(prev => ({ ...prev, [field]: fieldErrors[0] }));
      return false;
    }
    
    setErrors(prev => ({ ...prev, [field]: undefined }));
    return true;
  }, []);
  
  type ValidatorMap<K extends keyof T> = Partial<Record<K, (value: T[K]) => string | undefined>>;

  const validateForm = useCallback(
    <K extends keyof T>(formData: Partial<T>, fieldValidators: ValidatorMap<K>) => {
      const newErrors: Partial<Record<keyof T, string>> = {};
      
      (Object.entries(fieldValidators) as [K, (value: T[K]) => string | undefined][]).forEach(([field, validator]) => {
        if (validator && field in formData) {
          const error = validator(formData[field] as T[K]);
          if (error) {
            newErrors[field as keyof T] = error;
          }
        }
      });
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    []
  );
  
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);
  
  return {
    errors,
    validateField,
    validateForm,
    clearErrors
  };
}

export const emailValidator = (value: string): string | undefined => {
  if (!value.trim()) {
    return 'Veuillez saisir votre email';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return 'Veuillez saisir un email valide';
  }
  
  return undefined;
};

export const passwordValidator = (minLength: number = 6): (password: string) => string | undefined => {
  return (password: string): string | undefined => {
    if (!password.trim()) {
      return 'Veuillez saisir votre mot de passe';
    }
    
    if (password.length < minLength) {
      return `Le mot de passe doit contenir au moins ${minLength} caractères`;
    }
    
    return undefined;
  };
};

export const nameValidator = (value: string): string | undefined => {
  if (!value.trim()) {
    return 'Veuillez saisir votre nom complet';
  }
  
  if (value.trim().length < 2) {
    return 'Le nom doit contenir au moins 2 caractères';
  }
  
  return undefined;
};

export const confirmPasswordValidator = (password: string): (value: string) => string | undefined => {
  return (confirmPassword: string): string | undefined => {
    if (!confirmPassword.trim()) {
      return 'Veuillez confirmer votre mot de passe';
    }
    
    if (confirmPassword !== password) {
      return 'Les mots de passe ne correspondent pas';
    }
    
    return undefined;
  };
};

export const loginFormValidator = (formData: LoginFormData): FormValidationResult => {
  if (!formData.email.trim()) {
    return { isValid: false, error: 'Veuillez saisir votre email' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    return { isValid: false, error: 'Veuillez saisir un email valide' };
  }
  
  if (!formData.password.trim()) {
    return { isValid: false, error: 'Veuillez saisir votre mot de passe' };
  }
  
  return { isValid: true };
};

export const registerFormValidator = (formData: RegisterFormData): FormValidationResult => {
  if (!formData.name.trim()) {
    return { isValid: false, error: 'Veuillez saisir votre nom complet' };
  }
  
  if (formData.name.trim().length < 2) {
    return { isValid: false, error: 'Le nom doit contenir au moins 2 caractères' };
  }
  
  if (!formData.email.trim()) {
    return { isValid: false, error: 'Veuillez saisir votre email' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    return { isValid: false, error: 'Veuillez saisir un email valide' };
  }
  
  if (formData.password.length < 6) {
    return { isValid: false, error: 'Le mot de passe doit contenir au moins 6 caractères' };
  }
  
  if (formData.password !== formData.confirmPassword) {
    return { isValid: false, error: 'Les mots de passe ne correspondent pas' };
  }
  
  return { isValid: true };
};

export function useAuthFormValidation() {
  const { validateField, validateForm, clearErrors, errors } = useFormValidation<RegisterFormData>();
  
  const loginValidators = {
    email: emailValidator,
    password: passwordValidator(6)
  };
  
  const registerValidators: Record<string, (value: string) => string | undefined> = {
    name: nameValidator,
    email: emailValidator,
    password: passwordValidator(6),
    confirmPassword: (value: string) => {
      if (!value.trim()) return 'Veuillez confirmer votre mot de passe';
      return undefined;
    }
  };
  
  const validateLogin = useCallback(
    (email: string, password: string): boolean => {
      const formData: LoginFormData = { email, password };
      const result = loginFormValidator(formData);
      if (!result.isValid && result.error) {
        Alert.alert('Erreur', result.error);
      }
      return result.isValid;
    },
    []
  );
  
  const validateRegister = useCallback(
    (formData: RegisterFormData): boolean => {
      const result = registerFormValidator(formData);
      if (!result.isValid && result.error) {
        Alert.alert('Erreur', result.error);
      }
      return result.isValid;
    },
    []
  );
  
  const validateRegisterField = useCallback(
    (field: keyof RegisterFormData, value: string) => {
      const validator = registerValidators[field] as ((value: string) => string | undefined) | undefined;
      if (validator) {
        return validateField(field, value, [validator]);
      }
      return true;
    },
    [validateField, registerValidators]
  );
  
  return {
    errors,
    validateLogin,
    validateRegister,
    validateRegisterField,
    clearErrors,
    loginValidators,
    registerValidators
  };
}
