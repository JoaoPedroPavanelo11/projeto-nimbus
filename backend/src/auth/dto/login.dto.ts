import { IsEmail, IsString } from 'class-validator';
import { IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
    @IsEmail()
    @IsNotEmpty()
    @Transform(({ value }) => typeof value === 'string'? value.toLowerCase().trim(): value)
    email: string;

    @IsString()
    @IsNotEmpty()
    senha: string;
}
