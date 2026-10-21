import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, Matches, MinLength } from 'class-validator';

/** Agrupa 3 regras de validação de senha em uma só */
export function IsValidSenha(termo: string = 'senha') {
  return applyDecorators(
    IsNotEmpty({ message: `A ${termo} é obrigatória.` }),
    MinLength(8, { message: `A ${termo} deve ter no mínimo 8 caracteres.` }),
    Matches(/[A-Z]/, { message: `A ${termo} deve conter pelo menos uma letra maiúscula.` }),
  );
}
