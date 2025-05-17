import { Global, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { KeycloakUsersService } from './keyCloakUser.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';


@Global()
@Module({
   imports: [
    HttpModule,   
    ConfigModule,
  ],
  providers: [UserService, KeycloakUsersService],
  exports: [UserService, KeycloakUsersService],
})
export class UserModule {
}
