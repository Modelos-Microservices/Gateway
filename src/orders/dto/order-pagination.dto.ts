import { PaginationDto } from "src/common/dto/pagination.dto";
import { OrderStatus, OrderStatusList } from "../enum/order.enum";
import { IsEnum, IsOptional } from "class-validator";


export class OrderPaginationDto extends PaginationDto {
    @IsEnum(OrderStatusList, {
        message: `Posible status values are ${OrderStatusList}`
    })
    @IsOptional()
    status: OrderStatus;
}