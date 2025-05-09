import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Inject, ParseUUIDPipe } from '@nestjs/common';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';
import { KeycloakAuthGuard } from 'src/keyCloak/keycloak-auth.guard';
import { RolesGuard } from 'src/keyCloak/keycloak-roles.guard';
import { Roles } from 'src/keyCloak/role.decorator';
import { Protect } from 'src/keyCloak/protect.decorator';
import { firstValueFrom } from 'rxjs';
import { UserService } from 'src/user/user.service';
import { NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { Public } from 'src/keyCloak/public.decorator';

@Controller('customer-debts')
@UseGuards(KeycloakAuthGuard, RolesGuard)
export class DebtsController {
  constructor(
    @Inject(NATS_SERVICE) private readonly orders_client: ClientProxy,
    @Inject(UserService) private readonly userService: UserService
  ) { }

  @Public()
  @Post()
  async create(@Body() createDebtDto: CreateDebtDto, @Req() req: any) {

    let userId: string;
    try {
      userId = this.userService.extractUserIdFromToken(req);
      if (!userId) {
        throw new RpcException({ status: 401, message: 'User ID not found in token' });
      }
    } catch (error) {
      console.error('Error extracting user ID from token:', error);
      throw new RpcException({ status: 401, message: 'Authentication failed or user ID not found' });
    }

    const payload = { ...createDebtDto, user_id: userId };

    try {
      return await firstValueFrom(this.orders_client.send({ cmd: 'createDebt' }, payload));
    } catch (error) {
      throw new RpcException(error)
    }
  }

  @Public()
  @Get()
  async findAll() {
    try {
      return await firstValueFrom(this.orders_client.send({ cmd: 'findAllDebts' }, {}));
    } catch (error) {
      throw new RpcException(error);
    };
  }

  @Public()
  @Get('user/:id')
  async findAllDebtsByUserID(@Param('id', ParseUUIDPipe) id: string) {
    try {
      return await firstValueFrom(this.orders_client.send({ cmd: 'findAllDebtsByUserId' }, id));
    } catch (error) {
      throw new RpcException(error);
    }
  }


  @Public()
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      return await firstValueFrom(this.orders_client.send({ cmd: 'findOneDebt' }, id));
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Public()
  @Patch()
  update(@Body() updateDebtDto: UpdateDebtDto) {
    try {
      return firstValueFrom(this.orders_client.send({ cmd: 'updateDebt' }, updateDebtDto));
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
