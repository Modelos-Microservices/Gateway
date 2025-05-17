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

export class CreateDebtDtoByUserId {

    @IsUUID()
    @IsDefined()
    user_id: string

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


export class CreateDebtDtoComplete {
    @IsUUID() 
    @IsString() 
    @IsDefined()
    user_id: string; 

    @IsString()
    @IsDefined()
    user_name: string;

    @IsString()
    @IsOptional() 
    description: string;

    @IsNumber() 
    @IsPositive() 
    @Min(1000) 
    @IsDefined()
    @Type(() => Number) 
    amount: number;

    @IsEnum(DebtStatus) 
    @IsDefined()
    status: DebtStatus;

}