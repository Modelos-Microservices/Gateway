import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './role.decorator';

@Injectable()
//Implementamos CanActivate para crear un guard que verifique los roles de los usuarios
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);
  //obtenemos el reflector para acceder a los metadatos de los decoradores en este caso los roles
  constructor(private reflector: Reflector) {}
  //Implementamos el método canActivate que se encarga de verificar si el usuario tiene los roles necesarios para acceder al recurso
  canActivate(context: ExecutionContext): boolean {
    this.logger.debug('Verificando roles...');
    
    // Obtener los roles requeridos del decorador @Roles
    const requiredRoles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
    
    // Log para depuración
    this.logger.debug(`Roles requeridos: ${JSON.stringify(requiredRoles)}`);
    
    // Si no hay roles requeridos, permitir acceso directamente
    if (!requiredRoles || requiredRoles.length === 0) {
      this.logger.debug('No hay roles requeridos, permitiendo acceso');
      return true;
    }
    // Obtener el request y el usuario del contexto que debe haber sido autenticado previamente por el KeycloakAuthGuard
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Verificar si hay usuario y roles
    if (!user) {
      this.logger.warn('No hay usuario en el request');
      throw new ForbiddenException('Usuario no autenticado');
    }
    // Verificar si el usuario tiene roles definidos
    if (!user.roles || !Array.isArray(user.roles) || user.roles.length === 0) {
      this.logger.warn(`Usuario ${user.username || 'desconocido'} no tiene roles definidos`);
      throw new ForbiddenException('Usuario no tiene roles definidos');
    }
    
    // Log de información del usuario
    this.logger.debug(`Usuario: ${user.username}, Roles: ${JSON.stringify(user.roles)}`);
    
    // Verificar si el usuario tiene al menos uno de los roles requeridos
    const hasRole = requiredRoles.some(role => user.roles.includes(role));
    
    if (hasRole) {
      this.logger.log(`✅ Usuario ${user.username} autorizado con roles: [${user.roles.join(', ')}]`);
    } else {
      this.logger.warn(`❌ Acceso denegado: ${user.username} tiene roles [${user.roles.join(', ')}] pero se requieren [${requiredRoles.join(', ')}]`);
      throw new ForbiddenException('No tienes los permisos necesarios para acceder a este recurso');
    }
    
    return hasRole;
  }
}