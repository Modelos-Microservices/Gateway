import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, UseGuards, ParseUUIDPipe, Req } from '@nestjs/common';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { UserService } from 'src/user/user.service';
import { KeycloakAuthGuard } from 'src/keyCloak/keycloak-auth.guard';
import { RolesGuard } from 'src/keyCloak/keycloak-roles.guard';
import { firstValueFrom } from 'rxjs';
import { Public } from 'src/keyCloak/public.decorator';
import { Protect } from 'src/keyCloak/protect.decorator';
import { Roles } from 'src/keyCloak/role.decorator';

@Controller('favorites')
@UseGuards(KeycloakAuthGuard, RolesGuard)
export class FavoritesController {
  constructor(
    @Inject(NATS_SERVICE) private readonly favoritesClient: ClientProxy,
    @Inject(UserService) private readonly userService: UserService
  ) { }

  @Protect()
  @Roles('user', 'admin')
  @Post()
  async create(@Body() createFavoriteDto: CreateFavoriteDto, @Req() req: Request) {
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
    const payload = { ...createFavoriteDto, user_id: userId };
    try {
      const favorite = await firstValueFrom(this.favoritesClient.send({ cmd: 'createFavorite' }, payload));
      return favorite;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Public()
  @Get()
  async findAll() {
    try {
      return await firstValueFrom(this.favoritesClient.send({ cmd: 'findAllFavorites' }, {}));
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      return await firstValueFrom(this.favoritesClient.send({ cmd: 'findOneFavorite' }, id));
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Patch(':id')
 async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateFavoriteDto: UpdateFavoriteDto) {
    try {
      return await firstValueFrom(this.favoritesClient.send({ cmd: 'updateFavorite' }, { ...updateFavoriteDto }));
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await firstValueFrom(this.favoritesClient.send({ cmd: 'removeFavorite' }, id));
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
