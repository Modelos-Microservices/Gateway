import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    @MinLength(2)
    name: string;
  
    @IsOptional()
    @IsString()
    description?: string;
}
