import { IsString, IsNumber, IsEnum, IsUUID, IsDefined, IsPositive, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { DebtStatus } from '../enum/debts.enum'; // Ajusta la ruta si es necesario

export class CreateDebtDto {

    @IsString()
    @IsOptional() 
    description: string;

    @IsNumber({ maxDecimalPlaces: 2 }) 
    @IsPositive() 
    @Min(1000) 
    @IsDefined()
    @Type(() => Number) 
    amount: number;

    @IsEnum(DebtStatus) 
    @IsDefined()
    status: DebtStatus;
}