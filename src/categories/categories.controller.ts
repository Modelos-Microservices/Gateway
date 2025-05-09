import { Controller, Get, Post, Body, Patch, Param, Delete, Inject } from '@nestjs/common';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { firstValueFrom } from 'rxjs';
import { Public } from 'src/keyCloak/public.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(
     @Inject(NATS_SERVICE) private readonly categories_client: ClientProxy,
  ) {}

  @Public()
  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    try {
      return await firstValueFrom(this.categories_client.send({ cmd: 'createCategory' }, createCategoryDto));
    } catch (error) {
      throw new RpcException(error)
    }
  }

  @Get()
  async findAll() {
   try {
    return await firstValueFrom(this.categories_client.send({ cmd: 'findAllCategories' }, {}));
   } catch (error) {
    throw new RpcException(error)
   }
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await firstValueFrom(this.categories_client.send({ cmd: 'findOneCategory' }, id));
    } catch (error) {
      throw new RpcException(error)
    }
  }

  @Public()
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    try {
      return await firstValueFrom(this.categories_client.send({ cmd: 'updateCategory' }, {...updateCategoryDto }));
    } catch (error) {
      throw new RpcException(error)
    }
  }

  @Public()
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await firstValueFrom(this.categories_client.send({ cmd: 'deleteCategory' }, id));
    } catch (error) {
      throw new RpcException(error)
    }
  }
}
