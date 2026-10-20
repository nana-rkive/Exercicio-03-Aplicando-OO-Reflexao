import { Injectable, Inject } from '@nestjs/common';
import type {
  LuthierRepositoryPort,
  LuthierComInstrumentos,
} from './ports/luthier.repository.port';
import { Luthier } from '../domain/luthier';
import { BusinessException } from '../../../shared/exceptions/business.exception';
import { findOrThrow } from '../../../shared/utils/find-or-throw.util';
import { LogExecution } from '../../../shared/decorators/log-execution.decorator';

@Injectable()
export class LuthierService {
  constructor(
    @Inject('LuthierRepositoryPort')
    private readonly luthierRepo: LuthierRepositoryPort,
  ) {}

  private validateBusinessRules(
    nomeMestre: string,
    dataAbertura: Date,
    bancadasNum: number,
  ): void {
    // LUTHIER_002: Mínimo de 2 bancadas
    if (bancadasNum < 2) {
      throw new BusinessException(
        'LUTHIER_002',
        'Uma oficina de luthier deve possuir no mínimo 2 bancadas.',
      );
    }

    // LUTHIER_003: bancadasNum deve ser número inteiro
    if (!Number.isInteger(bancadasNum)) {
      throw new BusinessException(
        'LUTHIER_003',
        'A quantidade de bancadas deve ser um número inteiro.',
      );
    }

    // LUTHIER_004: Nome deve conter nome e sobrenome
    if (nomeMestre.trim().split(' ').length < 2) {
      throw new BusinessException(
        'LUTHIER_004',
        'Informe o nome e sobrenome completo do mestre luthier.',
      );
    }

    // LUTHIER_005: Data de abertura não pode ser futura
    if (new Date(dataAbertura) > new Date()) {
      throw new BusinessException(
        'LUTHIER_005',
        'A data de abertura não pode ser uma data futura.',
      );
    }

    // LUTHIER_006: Data de abertura não pode ser anterior a 1900
    if (new Date(dataAbertura) < new Date('1900-01-01')) {
      throw new BusinessException(
        'LUTHIER_006',
        'A data de abertura não pode ser anterior ao ano de 1900.',
      );
    }
  }

  @LogExecution()
  async create(
    nomeMestre: string,
    dataAbertura: Date,
    certificada: boolean,
    bancadasNum: number,
  ): Promise<Luthier> {
    // LUTHIER_001: Todos os campos são obrigatórios
    if (
      !nomeMestre ||
      !dataAbertura ||
      certificada === undefined ||
      certificada === null ||
      bancadasNum === undefined ||
      bancadasNum === null
    ) {
      throw new BusinessException(
        'LUTHIER_001',
        'Todos os campos são obrigatórios: nomeMestre, dataAbertura, certificada, bancadasNum.',
      );
    }

    // Regras LUTHIER_002 a LUTHIER_006 (reutilizadas também em update)
    this.validateBusinessRules(nomeMestre, dataAbertura, bancadasNum);

    const luthier = new Luthier(
      null,
      nomeMestre,
      dataAbertura,
      certificada,
      bancadasNum,
    );
    return this.luthierRepo.create(luthier);
  }

  async findAll(): Promise<Luthier[]> {
    return this.luthierRepo.findAll();
  }

  async findById(id: number): Promise<Luthier | null> {
    return findOrThrow(
      () => this.luthierRepo.findById(id),
      'LUTHIER_007',
      'Luthier não encontrado.',
    );
  }

  async findWithInstrumentos(id: number): Promise<LuthierComInstrumentos> {
    return findOrThrow(
      () => this.luthierRepo.findByIdWithInstrumentos(id),
      'LUTHIER_007',
      'Luthier não encontrado.',
    );
  }

  @LogExecution()
  async update(
    id: number,
    nomeMestre: string,
    dataAbertura: Date,
    certificada: boolean,
    bancadasNum: number,
  ): Promise<Luthier> {
    // Busca e valida existência — elimina duplicação do bloco findById+throw
    const luthier = await findOrThrow(
      () => this.luthierRepo.findById(id),
      'LUTHIER_007',
      'Luthier não encontrado.',
    );

    // Regras LUTHIER_002 a LUTHIER_006 centralizadas (mesmo método usado em create)
    this.validateBusinessRules(nomeMestre, dataAbertura, bancadasNum);

    luthier.nomeMestre = nomeMestre;
    luthier.dataAbertura = dataAbertura;
    luthier.certificada = certificada;
    luthier.bancadasNum = bancadasNum;

    return this.luthierRepo.update(luthier);
  }

  @LogExecution()
  async deactivate(id: number): Promise<Luthier> {
    const luthier = await findOrThrow(
      () => this.luthierRepo.findById(id),
      'LUTHIER_007',
      'Luthier não encontrado.',
    );

    luthier.certificada = false;
    return this.luthierRepo.update(luthier);
  }

  @LogExecution()
  async delete(id: number): Promise<void> {
    await findOrThrow(
      () => this.luthierRepo.findById(id),
      'LUTHIER_007',
      'Luthier não encontrado.',
    );

    await this.luthierRepo.delete(id);
  }
}
