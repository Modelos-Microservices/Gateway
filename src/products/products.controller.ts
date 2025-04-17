import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Patch, Post, Query, ValidationPipe } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { NATS_SERVICE, PRODUCT_SERVICE } from 'src/config';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(
    @Inject(NATS_SERVICE) private readonly products_client: ClientProxy
  ) {}

  @Post()
  createProduct(@Body() createProductDto: CreateProductDto){
    return this.products_client.send({cmd: 'create_one_product'}, createProductDto)
  }

  @Get()
  getAllProducts(@Query() pagination : PaginationDto ){
    //primero se utiliza send porque se espera una respuesta de lo contrario usariamos emit
    //el primer argumento es el nombre del evento y el segundo es el payload
    return this.products_client.send({ cmd: 'get_all_products' }, pagination);
  }

  @Get(':id')
  async getOneProduct(@Param('id', ParseIntPipe) id:number){
    try {
      const product = await firstValueFrom(this.products_client.send({cmd: 'get_one_product'}, {id}))
      return product
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Patch(':id')
  updateProduct(@Body()updateProductDto: UpdateProductDto){
    try {
      const product =  this.products_client.send({cmd: 'patch_one_product'}, updateProductDto)
      return product
    } catch (error) {
      throw new RpcException(error)
    }
  }
  
  @Delete(':id')
  deleteProduct(@Param('id', ParseIntPipe) id:number){

    try {
      const removed_product = this.products_client.send({cmd: 'delete_one_product'},{id})
      return removed_product
    } catch (error) {
      throw new RpcException(error)
    }

    
  }
}
