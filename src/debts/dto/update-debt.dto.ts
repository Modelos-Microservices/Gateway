import { PartialType } from '@nestjs/mapped-types';
import { CreateDebtDto } from './create-debt.dto';
import { IsDefined, IsEnum, IsUUID } from 'class-validator';
import { DebtStatus } from '../enum/debts.enum';

export class UpdateDebtDto {
  @IsUUID()
  @IsDefined()
  id: string

  @IsEnum(DebtStatus)
  @IsDefined()
  status: DebtStatus
}
