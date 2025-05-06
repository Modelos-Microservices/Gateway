import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { NatsModule } from './nats/nats.module';
import { APP_GUARD } from '@nestjs/core';
import { KeycloakAuthGuard } from './keyCloak/keycloak-auth.guard';
import { RolesGuard } from './keyCloak/keycloak-roles.guard';
import { KeyCloakAuthModule } from './keyCloak/keycloak-auth.module';

@Module({
  imports: [ProductsModule, OrdersModule, NatsModule, KeyCloakAuthModule],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: KeycloakAuthGuard }, { provide: APP_GUARD, useClass: RolesGuard }],
})
export class AppModule {}
