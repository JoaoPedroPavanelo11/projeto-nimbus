import { IsEmail, IsString, IsNotEmpty } from 'class-validator'
import { MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';


export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    nome: string;

    @IsEmail()
    @Transform(({ value }) => typeof value === 'string' ? value.toLowerCase().trim() : value) // Logica para transformar todo email em letra minuscula
    email: string;
    
    @IsString()
    @MinLength(6)
    senha: string;
}
