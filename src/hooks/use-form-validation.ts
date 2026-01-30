import { useState, useCallback } from 'react'
import { z } from 'zod'

export interface ValidationError {
  [key: string]: string
}

export interface ValidationResult {
  success: boolean
  errors: ValidationError
}

export function useFormValidation<T extends z.ZodTypeAny>(schema: T) {
  const [errors, setErrors] = useState<ValidationError>({})
  const [touched, setTouched] = useState<Set<string>>(new Set())

  const validateField = useCallback(
    (name: string, value: unknown): string | null => {
      try {
        // Get the field schema from the parent schema
        if (schema instanceof z.ZodObject) {
          const fieldSchema = schema.shape[name]
          if (fieldSchema) {
            fieldSchema.parse(value)
            return null
          }
        }
        return null
      } catch (error) {
        if (error instanceof z.ZodError) {
          return error.issues[0]?.message || 'Invalid value'
        }
        return 'Validation error'
      }
    },
    [schema]
  )

  const validateForm = useCallback(
    (data: z.infer<T>): ValidationResult => {
      try {
        schema.parse(data)
        setErrors({})
        return { success: true, errors: {} }
      } catch (error) {
        if (error instanceof z.ZodError) {
          const formattedErrors: ValidationError = {}
          error.issues.forEach((err) => {
            const path = err.path.join('.')
            formattedErrors[path] = err.message
          })
          setErrors(formattedErrors)
          return { success: false, errors: formattedErrors }
        }
        return { success: false, errors: {} }
      }
    },
    [schema]
  )

  const setFieldError = useCallback((name: string, error: string | null) => {
    setErrors((prev) => {
      if (error === null) {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      }
      return { ...prev, [name]: error }
    })
  }, [])

  const clearFieldError = useCallback(
    (name: string) => {
      setFieldError(name, null)
    },
    [setFieldError]
  )

  const markFieldTouched = useCallback((name: string) => {
    setTouched((prev) => new Set(prev).add(name))
  }, [])

  const isFieldTouched = useCallback(
    (name: string) => {
      return touched.has(name)
    },
    [touched]
  )

  const getFieldError = useCallback(
    (name: string) => {
      return isFieldTouched(name) ? errors[name] : undefined
    },
    [errors, isFieldTouched]
  )

  const clearErrors = useCallback(() => {
    setErrors({})
    setTouched(new Set())
  }, [])

  return {
    errors,
    touched,
    validateField,
    validateForm,
    setFieldError,
    clearFieldError,
    markFieldTouched,
    isFieldTouched,
    getFieldError,
    clearErrors,
  }
}
