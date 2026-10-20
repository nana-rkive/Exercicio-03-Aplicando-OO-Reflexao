/**
 * Tipos de metadados de validação compartilhados entre backend e frontend.
 *
 * O backend expõe esses metadados via GET /meta/validation-rules.
 * O frontend consome esses tipos para realizar validação dinâmica nos formulários.
 */

export interface FieldRule {
  required?: boolean;
  type?: string;
  min?: number;
  max?: number;
  minWords?: number;
  maxDate?: string;
  minDate?: string;
  label?: string;
  messages?: Record<string, string>;
}

export type ValidationRulesMap = Record<string, FieldRule>;

export interface ValidationRulesResponse {
  luthier: ValidationRulesMap;
  instrumento: ValidationRulesMap;
}
