import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { KeycloakStrategy } from './keycloak.strategy';
import { KeycloakAuthGuard } from './keycloak-auth.guard';
import { RolesGuard } from './keycloak-roles.guard';


@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'keycloak' }),
  ],
  providers: [
    KeycloakStrategy,
    KeycloakAuthGuard,
    RolesGuard, // Registrar el RolesGuard como provider
     // Registrar el KeycloakUserGeneratorService como provider
  ],
  exports: [PassportModule, KeycloakAuthGuard, RolesGuard], // Exportar el guard para usarlo en otros módulos
})

export class KeyCloakAuthModule {}