import { PaginationDto } from "src/common/dto/pagination.dto";
import { IsEnum, IsOptional } from "class-validator";
import { DebtStatus } from "../enum/debts.enum";

export class DebtPaginationDto extends PaginationDto {
    @IsEnum(DebtStatus, {
        message: `Posible status values are ${Object.values(DebtStatus).join(', ')}`
    })
    @IsOptional()
    status: DebtStatus;
}