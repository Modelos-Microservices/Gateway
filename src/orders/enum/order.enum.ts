export enum OrderStatus{
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    PAID = 'PAID',
}

export const OrderStatusList = [
    OrderStatus.PENDING,
    OrderStatus.CANCELLED,
    OrderStatus.COMPLETED,
    OrderStatus.PAID,
]