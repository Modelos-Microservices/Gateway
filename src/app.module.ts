import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { NatsModule } from './nats/nats.module';
import { APP_GUARD } from '@nestjs/core';
import { KeycloakAuthGuard } from './keyCloak/keycloak-auth.guard';
import { RolesGuard } from './keyCloak/keycloak-roles.guard';
import { KeyCloakAuthModule } from './keyCloak/keycloak-auth.module';
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';
import { CategoriesModule } from './categories/categories.module';
import { ReviewsModule } from './reviews/reviews.module';
import { FavoritesModule } from './favorites/favorites.module';
import { DebtsModule } from './debts/debts.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ProductsModule, OrdersModule, NatsModule, KeyCloakAuthModule, UserModule, CategoriesModule, ReviewsModule, FavoritesModule, DebtsModule, HttpModule, ConfigModule],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: KeycloakAuthGuard }, { provide: APP_GUARD, useClass: RolesGuard }],
})
export class AppModule {}
