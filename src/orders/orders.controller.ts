import { Body, Controller, Delete, Get, Inject, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
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
import { UserService } from 'src/user/user.service';
import { UserInfo } from 'src/common/entities/user.entity';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { DeleteOrderItemDto } from './dto/delete-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';


@Controller('orders')
export class OrdersController {
  constructor(
    @Inject(NATS_SERVICE) private readonly orders_client: ClientProxy,
    @Inject(UserService) private readonly userService: UserService
  ) { }

  // @UseGuards(KeycloakAuthGuard, RolesGuard)
  // @Protect()
  // @Roles('admin')
  @Public()
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
  async getAllReceipts(@Query() pagination: PaginationDto) {
    try {
      const receipts = await firstValueFrom(this.orders_client.send({ cmd: 'getAllReceipts' }, pagination));
      return receipts
    } catch (error) {
      throw new RpcException(error)
    }
  }

  @Public()
  @Get('cart')
  async getUserCart(@Req() request) {
    let user: UserInfo;
    try {
      user = this.userService.extractUserInfoFromToken(request);
      if (!user) {
        throw new RpcException({ status: 404, message: 'User ID not found in token' });
      }
      const order = await firstValueFrom(this.orders_client.send({ cmd: 'getUserCart' }, user.user_id))
      if(!order){
        return {message: 'El Ususerio no tienen un cart'}
      }

      return order
    } catch (error) {
      throw new RpcException(error)
    }
  }

  @Public()
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


  @UseGuards(KeycloakAuthGuard, RolesGuard)
  @Protect()
  @Roles('user')
  @Post('add')
  async AddOneProduct(@Body() createOrderItemDto: CreateOrderItemDto, @Req() request) {
    let user: UserInfo;
    try {
      user = this.userService.extractUserInfoFromToken(request);
      if (!user) {
        throw new RpcException({ status: 404, message: 'User ID not found in token' });
      }
      const payload = { ...createOrderItemDto, user_id: user.user_id }
      return await firstValueFrom(this.orders_client.send({ cmd: 'addOneProduct' }, payload))
    } catch (error) {
      throw new RpcException(error)
    }
  }

  //@UseGuards(KeycloakAuthGuard, RolesGuard)
  //@Protect()
  //@Roles('user')
  @Post('pay')
  async payOrder(@Req() request) {
    let user: UserInfo;
    try {
      user = this.userService.extractUserInfoFromToken(request);
      if (!user) {
        
        throw new RpcException({ status: 404, message: 'User ID not found in token' });
      }
      return await firstValueFrom(this.orders_client.send({ cmd: 'payOrder' }, user.user_id))
    } catch (error) {
      throw new RpcException(error)
    }
  }

  @Public()
  @Patch('delete')
  async deleteOrderItem(@Body() deleteOrderItemDto: DeleteOrderItemDto, @Req() request) {
    let user: UserInfo;
    try {
      user = this.userService.extractUserInfoFromToken(request);
      if (!user) {
        throw new RpcException({ status: 404, message: 'User ID not found in token' });
      }

      const payload = { ...deleteOrderItemDto, user_id: user.user_id }

      return await firstValueFrom(this.orders_client.send({ cmd: 'deleteOrderItem' }, payload))
    } catch (error) {
      throw new RpcException(error)
    }
  }


  @Public()
  @Patch('update')
  async updateOrderItem(@Body() updateOrderItemDto: UpdateOrderItemDto, @Req() request) {
    let user: UserInfo;
    try {
      user = this.userService.extractUserInfoFromToken(request);
      if (!user) {
        throw new RpcException({ status: 404, message: 'User ID not found in token' });
      }
      const payload = { ...updateOrderItemDto, user_id: user.user_id }

      return await firstValueFrom(this.orders_client.send({ cmd: 'updateOrderItem' }, payload))
    } catch (error) {
      throw new RpcException(error)
    }
  }


  @Public()
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
