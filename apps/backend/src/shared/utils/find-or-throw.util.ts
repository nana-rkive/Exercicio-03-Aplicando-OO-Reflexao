import { HttpStatus } from '@nestjs/common';
import { BusinessException } from '../exceptions/business.exception';

/**
 * findOrThrow
 *   "buscar entidade por ID e lançar BusinessException se não encontrada".
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
