import { Global, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { KeycloakUsersService } from './keyCloakUser.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { KeycloakUserGeneratorService } from './keycloak-user-generator.service';
import { UserController } from './user.controller';


@Global()
@Module({
   imports: [
    HttpModule,   
    ConfigModule,
  ],
  providers: [UserService, KeycloakUsersService, KeycloakUserGeneratorService],
  exports: [UserService, KeycloakUsersService],
  controllers: [UserController],
})
export class UserModule {
}
