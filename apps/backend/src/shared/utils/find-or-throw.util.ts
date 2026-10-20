import { HttpStatus } from '@nestjs/common';
import { BusinessException } from '../exceptions/business.exception';

/**
 * findOrThrow
 *
 * Helper genérico que encapsula o padrão repetido em todos os services:
 *   "buscar entidade por ID e lançar BusinessException se não encontrada".
 *
 * @param fetchFn  Função assíncrona que busca a entidade (ex: repo.findById(id))
 * @param code     Código de erro de negócio (ex: 'LUTHIER_007')
 * @param message  Mensagem de erro legível
 * @param status   HTTP status (padrão: 404 NOT_FOUND)
 * @returns        A entidade encontrada (nunca null)
 */
export async function findOrThrow<T>(
  fetchFn: () => Promise<T | null | undefined>,
  code: string,
  message: string,
  status: HttpStatus = HttpStatus.NOT_FOUND,
): Promise<T> {
  const entity = await fetchFn();
  if (!entity) {
    throw new BusinessException(code, message, status);
  }
  return entity;
}
