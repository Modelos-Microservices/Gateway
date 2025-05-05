import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE, ORDER_SERVICE } from 'src/config';
import { CreateOrderDto } from './dto/create-order.dto';
import { first, firstValueFrom } from 'rxjs';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { StatusOrderDto } from './dto/status-order.dto';


@Controller('orders')
export class OrdersController {
  constructor(
    @Inject(NATS_SERVICE) private readonly orders_client: ClientProxy
  ) { }

  @Get()
  async getAllOrders(@Query() pagination: OrderPaginationDto) {
    try {
      const orders = await firstValueFrom(this.orders_client.send({ cmd: 'findAllOrders' }, pagination));
      return orders
    } catch (error) {
      throw new RpcException(error)
    }
  }

  @Get('receipts')
  async getAllReceipts(@Query() pagination: PaginationDto){
    try{
      const receipts = await firstValueFrom(this.orders_client.send({cmd: 'getAllReceipts'}, pagination));
      return receipts
    } catch (error) {
      throw new RpcException(error)
    }

    
  }

  @Get(':status')
  async getAllOrdersByStatus(@Param() statusDto: StatusOrderDto, @Query() pagination: PaginationDto) {
    const data: OrderPaginationDto = { ...pagination, status: statusDto.status }
    try {
      const orders = await firstValueFrom(this.orders_client.send({ cmd: 'findAllOrders' }, data));
      return orders
    } catch (error) {
      throw new RpcException(error)
    }
  }


  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    try {
      return await firstValueFrom(this.orders_client.send({ cmd: 'createOrder' }, createOrderDto))
    } catch (error) {
      throw new RpcException(error)
    }

  }

  @Patch(':id')
  async updateOrder(@Param('id', ParseUUIDPipe) id: string, @Body() statusOrderDto: StatusOrderDto) {
    const data = { ...statusOrderDto, id }
    try {
      const order = await firstValueFrom(this.orders_client.send({ cmd: 'changeOrderStatus' }, data));
      return order
    } catch (error) {
      throw new RpcException(error)
    }
  }

  @Get('id/:id')
  async getOrder(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const proudct = await firstValueFrom(this.orders_client.send({ cmd: 'findOneOrder' }, id));
      return proudct
    } catch (error) {
      throw new RpcException(error)
    }
  }


}
