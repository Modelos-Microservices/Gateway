import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class createUserDtoKeyCloak {
    @IsString()
    @IsNotEmpty()
    username: string;
    @IsNotEmpty()
    email: string;
    @IsOptional()
    firstName?: string;
    @IsOptional()
    lastName?: string;
    @IsOptional()
    password?: string;
    @IsOptional()
    attributes?: Record<string, any>;
    @IsOptional()
    isTemporaryPassword?: boolean;
    @IsOptional()
    enabled?: boolean;
}
