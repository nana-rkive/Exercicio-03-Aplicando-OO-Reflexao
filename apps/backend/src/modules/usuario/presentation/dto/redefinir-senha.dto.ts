import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { IsValidSenha } from '../../../../shared/decorators/is-valid-senha.decorator';

export class RedefinirSenhaDto {
  @ApiProperty({ description: 'E-mail do usuário', example: 'joao@email.com' })
  @IsEmail({}, { message: 'Formato de e-mail inválido.' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  email: string;

  @ApiProperty({ description: 'Nova senha', example: 'NovaSenha123' })
  @IsValidSenha ('nova senha')
  
  novaSenha: string;

  @ApiProperty({
    description: 'Confirmação da nova senha',
    example: 'NovaSenha123',
  })
  @IsNotEmpty({ message: 'A confirmação de senha é obrigatória.' })
  confirmarNovaSenha: string;
}
