import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  AbstractControl,
  ValidatorFn,
  Validators,
} from '@angular/forms';

/**
 * FieldRule
 *
 * Representa as restrições de um campo retornadas pelo endpoint
 * GET /meta/validation-rules do backend.
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

/**
 * ValidationMetadataService
 *
 * Consome o endpoint de metadados do backend (GET /meta/validation-rules)
 * e converte as regras recebidas em ValidatorFn[] do Angular Reactive Forms,
 * eliminando validações hardcoded nos formulários do frontend.
 */
@Injectable({ providedIn: 'root' })
export class ValidationMetadataService {
  private http = inject(HttpClient);
  private metaUrl = `${environment.apiUrl}/meta/validation-rules`;

  /** Sinal com as regras carregadas (null até a primeira carga) */
  rules = signal<ValidationRulesResponse | null>(null);

  /**
   * Carrega os metadados de validação do backend e os armazena no sinal.
   * Deve ser chamado uma vez durante a inicialização do formulário.
   */
  load(): void {
    this.http.get<ValidationRulesResponse>(this.metaUrl).subscribe({
      next: (data) => this.rules.set(data),
      error: () =>
        console.warn(
          '[ValidationMetadataService] Falha ao carregar regras dinâmicas; usando validadores padrão.',
        ),
    });
  }

  /**
   * buildValidators
   *
   * Converte um FieldRule em um array de ValidatorFn do Angular.
   * Este método centraliza a lógica de montagem de validadores,
   * abstraindo a tradução de metadados → validators.
   *
   * @param rule  Regra de campo retornada pelo backend
   * @returns     Array de ValidatorFn para uso em FormControl
   */
  buildValidators(rule: FieldRule): ValidatorFn[] {
    const validators: ValidatorFn[] = [];

    if (rule.required) {
      validators.push(Validators.required);
    }

    if (rule.min !== undefined) {
      validators.push(Validators.min(rule.min));
    }

    if (rule.max !== undefined) {
      validators.push(Validators.max(rule.max));
    }

    if (rule.type === 'integer') {
      validators.push(integerValidator());
    }

    if (rule.minWords !== undefined) {
      validators.push(minWordsValidator(rule.minWords));
    }

    if (rule.maxDate === 'today') {
      validators.push(maxDateTodayValidator());
    }

    if (rule.minDate) {
      validators.push(minDateValidator(rule.minDate));
    }

    return validators;
  }

  /**
   * getValidatorsFor
   *
   * Atalho para obter os ValidatorFn[] de um campo específico dentro de
   * um grupo de regras (ex: 'luthier' ou 'instrumento').
   *
   * @param group  Chave do grupo ('luthier' | 'instrumento')
   * @param field  Nome do campo no grupo
   * @returns      Array de ValidatorFn, ou [] se as regras ainda não carregaram
   */
  getValidatorsFor(
    group: keyof ValidationRulesResponse,
    field: string,
  ): ValidatorFn[] {
    const rulesMap = this.rules()?.[group];
    if (!rulesMap || !rulesMap[field]) return [];
    return this.buildValidators(rulesMap[field]);
  }

  /**
   * getErrorMessage
   *
   * Retorna a mensagem de erro para um campo com base nas regras dinâmicas
   * e no tipo de erro detectado pelo FormControl.
   *
   * @param control  AbstractControl do Angular
   * @param group    Chave do grupo
   * @param field    Nome do campo
   * @returns        Mensagem de erro para exibição no template
   */
  getErrorMessage(
    control: AbstractControl,
    group: keyof ValidationRulesResponse,
    field: string,
  ): string {
    if (!control) return '';

    // Erros de backend têm prioridade
    if (control.hasError('backend')) return control.getError('backend') as string;

    const messages = this.rules()?.[group]?.[field]?.messages ?? {};

    if (control.hasError('required'))
      return messages['required'] ?? 'Campo obrigatório';
    if (control.hasError('min'))
      return messages['min'] ?? 'Valor abaixo do mínimo permitido';
    if (control.hasError('max'))
      return messages['max'] ?? 'Valor acima do máximo permitido';
    if (control.hasError('integer'))
      return messages['integer'] ?? 'Deve ser um número inteiro';
    if (control.hasError('minWords'))
      return messages['minWords'] ?? 'Informe nome e sobrenome completo';
    if (control.hasError('maxDate'))
      return messages['maxDate'] ?? 'Data inválida';
    if (control.hasError('minDate'))
      return messages['minDate'] ?? 'Data inválida';

    return 'Campo inválido';
  }
}

// ─── Validators customizados ─────────────────────────────────────────────────

/** Valida que o valor é um número inteiro */
function integerValidator(): ValidatorFn {
  return (control: AbstractControl) => {
    const value = control.value;
    if (value === null || value === undefined || value === '') return null;
    return Number.isInteger(Number(value)) ? null : { integer: true };
  };
}

/** Valida que o campo contém pelo menos N palavras */
function minWordsValidator(minWords: number): ValidatorFn {
  return (control: AbstractControl) => {
    const value = (control.value as string)?.trim() ?? '';
    if (!value) return null;
    return value.split(/\s+/).filter(Boolean).length >= minWords
      ? null
      : { minWords: { required: minWords, actual: value.split(/\s+/).length } };
  };
}

/** Valida que a data não é futura */
function maxDateTodayValidator(): ValidatorFn {
  return (control: AbstractControl) => {
    const value = control.value as string;
    if (!value) return null;
    return new Date(value) <= new Date() ? null : { maxDate: true };
  };
}

/** Valida que a data não é anterior a minDate */
function minDateValidator(minDate: string): ValidatorFn {
  return (control: AbstractControl) => {
    const value = control.value as string;
    if (!value) return null;
    return new Date(value) >= new Date(minDate)
      ? null
      : { minDate: { required: minDate } };
  };
}
