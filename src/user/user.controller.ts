import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { KeycloakUserGeneratorService } from './keycloak-user-generator.service'; // ajusta la ruta según tu proyecto
import { createUserDtoKeyCloak } from './dto/createUserKeyCloak.dto';
import { Public } from 'src/keyCloak/public.decorator';

@Controller('keyCloak')
export class UserController {
  constructor(
    private readonly keycloakUserGeneratorService: KeycloakUserGeneratorService,
  ) {}

  @Public()
  @Post('register')
  async registerUser(@Body() userDto: createUserDtoKeyCloak) {
    try {
      const user = await this.keycloakUserGeneratorService.registerUserWithRole(userDto, ['user']);
      return {
        message: 'Usuario creado exitosamente',
        userInfo: user,
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Error al registrar el usuario');
    }
  }
}
