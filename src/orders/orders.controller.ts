import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE, ORDER_SERVICE } from 'src/config';
import { CreateOrderDto } from './dto/create-order.dto';
import { first, firstValueFrom } from 'rxjs';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { StatusOrderDto } from './dto/status-order.dto';
import { KeycloakAuthGuard } from 'src/keyCloak/keycloak-auth.guard';
import { RolesGuard } from 'src/keyCloak/keycloak-roles.guard';
import { Protect } from 'src/keyCloak/protect.decorator';
import { Roles } from 'src/keyCloak/role.decorator';
import { Public } from 'src/keyCloak/public.decorator';
import * as jwt from 'jsonwebtoken';
import { consumerOpts } from 'nats';
import { UserService } from 'src/user/user.service';


@Controller('orders')
export class OrdersController {
  constructor(
    @Inject(NATS_SERVICE) private readonly orders_client: ClientProxy,
    @Inject(UserService) private readonly userService: UserService
  ) { }

  @UseGuards(KeycloakAuthGuard, RolesGuard)
  @Protect()
  @Roles('admin')
  //@Public()
  @Get()
  async getAllOrders(@Query() pagination: OrderPaginationDto) {
    try {
      const orders = await firstValueFrom(this.orders_client.send({ cmd: 'findAllOrders' }, pagination));
      return orders
    } catch (error) {
      throw new RpcException(error)
    }
  }

  @Public()
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

  //@UseGuards(KeycloakAuthGuard, RolesGuard)
  //@Protect()
  //@Roles('user', 'admin')
  @Public()
  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto, @Req() request) {
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


  extractUserIdFromToken(token: string): string {
    try {
      // Decodificar el token sin verificar la firma
      const decoded = jwt.decode(token);
      
      // El ID suele estar en el campo 'sub' de un token de Keycloak
      if (decoded && typeof decoded === 'object' && decoded.sub) {
        return decoded.sub;
      }
      
      throw new Error('No se pudo extraer el ID del usuario del token');
    } catch (error) {
      console.error('Error al extraer el ID del usuario:', error);
      throw new Error('Error al procesar el token de autenticación');
    }
  }


}
