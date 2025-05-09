import { IsString, IsOptional, IsNumber, IsBoolean, IsUrl, IsPositive, Min, Max, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    @Min(0)
    @Max(1000000)
    @IsNotEmpty()
    price: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    stock: number = 1;

    @IsOptional()
    @IsBoolean()
    available: boolean = true;

    @IsOptional()
    @IsUrl()
    imageUrl: string = "https://media.istockphoto.com/id/1414159406/es/vector/multicolor-abstracto-rojo-naranja-verde-p%C3%BArpura-amarillo-colorido-ondulado-papelcut.jpg?s=612x612&w=0&k=20&c=UNjQErYytEZGkh72OyyN0XvryBi_G7_NUmQGwmK34jg=";

    @IsString()
    @IsNotEmpty()
    categoryId: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @Max(100)
    discountPercentage: number = 0.0;
}
