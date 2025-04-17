import { OrderStatus, OrderStatusList } from "../enum/order.enum";
import { IsEnum } from "class-validator";

export class StatusOrderDto {
    @IsEnum(OrderStatusList, {
        message: `Posible status values are ${OrderStatusList}`
    })
    status: OrderStatus;
}