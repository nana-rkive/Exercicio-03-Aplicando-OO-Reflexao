import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * ValidationRulesController
 *
 * Expõe um endpoint público que descreve as regras de validação de cada
 * caso de uso do CRUD. O Frontend consome esses metadados para montar
 * validadores de formulário de forma dinâmica, eliminando regras
 * hardcoded no cliente.
 *
 * GET /meta/validation-rules
 */
@ApiTags('Metadados')
@Controller('meta')
export class ValidationRulesController {
  /**
   * Regras de validação para o formulário de Luthier.
   * Cada campo descreve: obrigatoriedade, tipo, e restrições de valor.
   */
  private readonly luthierRules = {
    nomeMestre: {
      required: true,
      type: 'string',
      minWords: 2,
      label: 'Nome do Mestre',
      messages: {
        required: 'O nome do mestre luthier é obrigatório',
        minWords: 'Informe o nome e sobrenome completo do mestre luthier',
      },
    },
    dataAbertura: {
      required: true,
      type: 'date',
      maxDate: 'today',
      minDate: '1900-01-01',
      label: 'Data de Abertura',
      messages: {
        required: 'A data de abertura é obrigatória',
        maxDate: 'A data de abertura não pode ser uma data futura',
        minDate: 'A data de abertura não pode ser anterior ao ano de 1900',
      },
    },
    certificada: {
      required: false,
      type: 'boolean',
      label: 'Certificada',
    },
    bancadasNum: {
      required: true,
      type: 'integer',
      min: 2,
      label: 'Quantidade de Bancadas',
      messages: {
        required: 'O número de bancadas é obrigatório',
        min: 'Uma oficina de luthier deve possuir no mínimo 2 bancadas',
        integer: 'A quantidade de bancadas deve ser um número inteiro',
      },
    },
  };

  /**
   * Regras de validação para o formulário de Instrumento.
   */
  private readonly instrumentoRules = {
    modeloMadeira: {
      required: true,
      type: 'string',
      label: 'Modelo / Madeira',
      messages: {
        required: 'O modelo/madeira do instrumento é obrigatório',
      },
    },
    dataEntrada: {
      required: true,
      type: 'date',
      maxDate: 'today',
      label: 'Data de Entrada',
      messages: {
        required: 'A data de entrada é obrigatória',
        maxDate: 'A data de entrada não pode ser no futuro',
      },
    },
    reparoConcluido: {
      required: false,
      type: 'boolean',
      label: 'Reparo Concluído',
    },
    custoReparo: {
      required: true,
      type: 'number',
      min: 0,
      max: 50000,
      label: 'Custo do Reparo',
      messages: {
        required: 'O custo do reparo é obrigatório',
        min: 'O custo do reparo deve ser maior ou igual a R$ 0,00',
        max: 'O custo do reparo não deve ultrapassar R$ 50.000,00',
      },
    },
    luthierId: {
      required: true,
      type: 'number',
      label: 'Luthier Responsável',
      messages: {
        required: 'O luthier responsável é obrigatório',
      },
    },
  };

  @Get('validation-rules')
  @ApiOperation({
    summary:
      'Retorna os metadados de validação de todos os formulários do CRUD',
    description:
      'O Frontend consome este endpoint para construir validadores dinâmicos, ' +
      'eliminando regras de validação hardcoded no cliente.',
  })
  @ApiResponse({
    status: 200,
    description: 'Metadados de validação retornados com sucesso.',
  })
  getValidationRules() {
    return {
      luthier: this.luthierRules,
      instrumento: this.instrumentoRules,
    };
  }
}
