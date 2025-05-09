import { IsInt, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateFavoriteDto {

  @IsInt({ message: 'Product ID must be an integer' })
  @IsNotEmpty({ message: 'Product ID cannot be empty' })
  product_id: number;

}