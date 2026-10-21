import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { IsValidSenha } from '../../../../shared/decorators/is-valid-senha.decorator';

export class CadastroUsuarioDto {
  @ApiProperty({ description: 'Primeiro nome do usuário', example: 'João' })
  @IsNotEmpty({ message: 'O primeiro nome é obrigatório.' })
  primeiroNome: string;

  @ApiProperty({ description: 'Sobrenome do usuário', example: 'Silva' })
  @IsNotEmpty({ message: 'O sobrenome é obrigatório.' })
  sobrenome: string;

  @ApiProperty({ description: 'E-mail do usuário', example: 'joao@email.com' })
  @IsEmail({}, { message: 'Formato de e-mail inválido.' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  email: string;

  @ApiProperty({
    description:
      'Senha do usuário (mínimo 8 caracteres, pelo menos uma letra maiúscula)',
    example: 'Senha123',
  })
  @IsValidSenha()

  senha: string;
}
