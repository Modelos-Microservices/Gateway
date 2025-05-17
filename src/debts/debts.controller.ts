import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Inject, ParseUUIDPipe } from '@nestjs/common';
import { CreateDebtDto, CreateDebtDtoByUserId, CreateDebtDtoComplete } from './dto/create-debt.dto';
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
import { UserInfo } from 'src/common/entities/user.entity';
import { KeycloakUsersService } from 'src/user/keyCloakUser.service';

@Controller('customer-debts')
@UseGuards(KeycloakAuthGuard, RolesGuard)
export class DebtsController {
  constructor(
    @Inject(NATS_SERVICE) private readonly orders_client: ClientProxy,
    @Inject(UserService) private readonly userService: UserService,
    @Inject(KeycloakUsersService) private readonly keycloakUsersService: KeycloakUsersService
  ) { }


  @Protect()
  @Roles('admin')
  @Get('keycloak')
  async getKeycloakUser(@Req() req: any) {
    return this.keycloakUsersService.getAllUsers()
  }

  @Public()
  @Post()
  async create(@Body() createDebtDto: CreateDebtDto, @Req() req: any) {
    let user: UserInfo;
    try {
      user = this.userService.extractUserInfoFromToken(req);
      if (!user) {
        throw new RpcException({ status: 401, message: 'User ID not found in token' });
      }
    } catch (error) {
      console.error('Error extracting user ID from token:', error);
      throw new RpcException({ status: 401, message: 'Authentication failed or user ID not found' });
    }

    const payload = { ...createDebtDto, user_id: user.user_id, user_name: user.user_name };

    try {
      return await firstValueFrom(this.orders_client.send({ cmd: 'createDebt' }, payload));
    } catch (error) {
      throw new RpcException(error)
    }
  }

  @Public()
  @Post('user')
  async createByUserId(@Body() createDebtDtoByUserId: CreateDebtDtoByUserId) {

    const username =  await this.keycloakUsersService.getNameBeId(createDebtDtoByUserId.user_id)

    const payload: CreateDebtDtoComplete = {...createDebtDtoByUserId, user_name: username}

    try {
      return await firstValueFrom(this.orders_client.send({ cmd: 'createDebt' }, payload));
    } catch (error) {
      throw new RpcException(error)
    }

  }


  @Roles('admin')
  @Protect()
  @Get()
  async findAll() {
    try {
      return await firstValueFrom(this.orders_client.send({ cmd: 'findAllDebts' }, {}));
    } catch (error) {
      throw new RpcException(error);
    };
  }

  @Roles('user', 'admin')
  @Protect()
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
  async update(@Body() updateDebtDto: UpdateDebtDto) {
    try {
      return await firstValueFrom(this.orders_client.send({ cmd: 'updateDebt' }, updateDebtDto));
    } catch (error) {
      console.log(error)
      throw new RpcException(error);
    }
  }
}
