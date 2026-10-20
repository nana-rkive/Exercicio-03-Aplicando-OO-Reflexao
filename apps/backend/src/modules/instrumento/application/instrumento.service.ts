import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import type { LuthierRepositoryPort } from '../../luthier/application/ports/luthier.repository.port';
import type { InstrumentoRepositoryPort } from './ports/instrumento.repository.port';
import { Instrumento } from '../domain/instrumento';
import { BusinessException } from '../../../shared/exceptions/business.exception';
import { findOrThrow } from '../../../shared/utils/find-or-throw.util';
import { LogExecution } from '../../../shared/decorators/log-execution.decorator';

@Injectable()
export class InstrumentoService {
  constructor(
    @Inject('InstrumentoRepositoryPort')
    private readonly instrumentoRepo: InstrumentoRepositoryPort,

    @Inject('LuthierRepositoryPort')
    private readonly luthierRepo: LuthierRepositoryPort,
  ) {}

  /**
   * validateInstrumentoRules
   *
   * Abstrai as regras de negócio INSTRUMENTO_002, INSTRUMENTO_003 e
   * INSTRUMENTO_004 em um único método privado, eliminando a duplicação
   * entre create() e update().
   *
   * @param dataEntrada    Data de entrada do instrumento
   * @param luthierAbertura Data de abertura do luthier (para INSTRUMENTO_002)
   * @param custoReparo    Custo do reparo
   * @param reparoConcluido Status do reparo
   */
  private validateInstrumentoRules(
    dataEntrada: Date,
    luthierAbertura: Date,
    custoReparo: number,
    reparoConcluido: boolean,
  ): void {
    // INSTRUMENTO_002: Data de entrada não pode ser anterior à abertura da oficina
    if (new Date(dataEntrada) < new Date(luthierAbertura)) {
      throw new BusinessException(
        'INSTRUMENTO_002',
        'A data de entrada do instrumento não pode ser anterior à abertura da oficina.',
      );
    }

    // INSTRUMENTO_003: Custo do reparo deve estar entre 0 e 50.000
    if (custoReparo < 0 || custoReparo > 50000) {
      throw new BusinessException(
        'INSTRUMENTO_003',
        'O custo do reparo deve ser entre R$ 0,00 e R$ 50.000,00.',
      );
    }

    // INSTRUMENTO_004: Se o reparo está concluído, o custo deve ser maior que zero
    if (reparoConcluido && custoReparo <= 0) {
      throw new BusinessException(
        'INSTRUMENTO_004',
        'Um reparo concluído exige um custo de manutenção maior que zero.',
      );
    }
  }

  @LogExecution()
  async create(
    modeloMadeira: string,
    dataEntrada: Date,
    reparoConcluido: boolean,
    custoReparo: number,
    luthierId: number,
  ): Promise<Instrumento> {
    // INSTRUMENTO_001: Verificar se o Luthier (Oficina) existe
    const luthier = await findOrThrow(
      () => this.luthierRepo.findById(luthierId),
      'INSTRUMENTO_001',
      `Oficina de Luthier com ID ${luthierId} não encontrada.`,
      HttpStatus.NOT_FOUND,
    );

    // Regras INSTRUMENTO_002 a INSTRUMENTO_004 centralizadas
    this.validateInstrumentoRules(
      dataEntrada,
      luthier.dataAbertura,
      custoReparo,
      reparoConcluido,
    );

    // INSTRUMENTO_005: Evitar duplicidade de modelo em reparo para o mesmo luthier
    const todos = await this.instrumentoRepo.findAll();
    const duplicado = todos.find(
      (i) =>
        i.modeloMadeira === modeloMadeira &&
        i.reparoConcluido === false &&
        i.luthierId === luthierId,
    );
    if (duplicado) {
      throw new BusinessException(
        'INSTRUMENTO_005',
        'Este luthier já possui um instrumento deste modelo em reparo no momento.',
        HttpStatus.CONFLICT,
      );
    }

    const instrumento = new Instrumento(
      null,
      modeloMadeira,
      dataEntrada,
      reparoConcluido,
      custoReparo,
      luthierId,
    );
    return this.instrumentoRepo.create(instrumento);
  }

  @LogExecution()
  async update(
    id: number,
    modeloMadeira: string,
    dataEntrada: Date,
    reparoConcluido: boolean,
    custoReparo: number,
    luthierId: number,
  ): Promise<Instrumento> {
    // Busca e valida existência do instrumento
    const instrumento = await findOrThrow(
      () => this.instrumentoRepo.findById(id),
      'INSTRUMENTO_006',
      'Registro de instrumento não encontrado.',
      HttpStatus.NOT_FOUND,
    );

    // INSTRUMENTO_001: Verificar se o Luthier (Oficina) existe
    const luthier = await findOrThrow(
      () => this.luthierRepo.findById(luthierId),
      'INSTRUMENTO_001',
      `Oficina de Luthier com ID ${luthierId} não encontrada.`,
      HttpStatus.NOT_FOUND,
    );

    // Regras INSTRUMENTO_002 a INSTRUMENTO_004 centralizadas (mesmo método usado em create)
    this.validateInstrumentoRules(
      dataEntrada,
      luthier.dataAbertura,
      custoReparo,
      reparoConcluido,
    );

    // INSTRUMENTO_005: Evitar duplicidade (exclui o próprio registro da verificação)
    const todos = await this.instrumentoRepo.findAll();
    const duplicado = todos.find(
      (i) =>
        i.id !== id &&
        i.modeloMadeira === modeloMadeira &&
        i.reparoConcluido === false &&
        i.luthierId === luthierId,
    );
    if (duplicado) {
      throw new BusinessException(
        'INSTRUMENTO_005',
        'Este luthier já possui um instrumento deste modelo em reparo no momento.',
        HttpStatus.CONFLICT,
      );
    }

    instrumento.modeloMadeira = modeloMadeira;
    instrumento.dataEntrada = dataEntrada;
    instrumento.reparoConcluido = reparoConcluido;
    instrumento.custoReparo = custoReparo;
    instrumento.luthierId = luthierId;

    return this.instrumentoRepo.update(instrumento);
  }

  async findAll(): Promise<Instrumento[]> {
    return this.instrumentoRepo.findAll();
  }

  async findById(id: number): Promise<Instrumento | null> {
    return findOrThrow(
      () => this.instrumentoRepo.findById(id),
      'INSTRUMENTO_006',
      'Registro de instrumento não encontrado.',
      HttpStatus.NOT_FOUND,
    );
  }

  @LogExecution()
  async deactivate(id: number): Promise<Instrumento> {
    const instrumento = await findOrThrow(
      () => this.instrumentoRepo.findById(id),
      'INSTRUMENTO_006',
      'Instrumento não encontrado.',
      HttpStatus.NOT_FOUND,
    );

    instrumento.reparoConcluido = true;
    return this.instrumentoRepo.update(instrumento);
  }

  @LogExecution()
  async delete(id: number): Promise<void> {
    await findOrThrow(
      () => this.instrumentoRepo.findById(id),
      'INSTRUMENTO_006',
      'Instrumento não encontrado.',
      HttpStatus.NOT_FOUND,
    );
    await this.instrumentoRepo.delete(id);
  }
}
