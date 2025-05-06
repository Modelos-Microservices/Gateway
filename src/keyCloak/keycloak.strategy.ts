import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';

@Injectable()
export class KeycloakStrategy extends PassportStrategy(Strategy, 'keycloak') {
  private readonly logger = new Logger(KeycloakStrategy.name);

  constructor() {
    //pasamos la configuración para que sepa como validar el token
    super({
      //indica que se debe extraer el token del header de la peticion
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      //indica que el token no tiene que expirar
      ignoreExpiration: false,
      //indica que se va a usar el algoritmo RS256 para validar el token
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        //hace cache del token para que no se tenga que validar cada vez
        cache: true,
        //estos dos parametros son para que no se haga una peticion cada vez que se valida el token
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        //url del servidor de keycloak donde se encuentra el certificado para validar el token
        jwksUri: 'http://keycloak:8080/realms/nestjs-realm/protocol/openid-connect/certs',
      }),

      audience: 'account', 
      //Solo acepta tokens de este realm
      issuer: 'http://localhost:8080/realms/nestjs-realm',
      algorithms: ['RS256'],
      //permite que se pase el request a la funcion de validacion
      passReqToCallback: true,
    });
    this.logger.log('KeycloakStrategy inicializada');
  }

  //Este método se llama cuando se valida el token
  //El payload es el token decodificado y el request es la peticion que se hace al servidor
  async validate(request: any, payload: any) {
    this.logger.log('▶️ Iniciando validación de token JWT');
    this.logger.debug(`Payload recibido: ${JSON.stringify(payload)}`);
    
    // Asegurarse de que los roles se extraen correctamente de realm_access.roles
    const roles = payload.realm_access?.roles || [];
    this.logger.debug(`Roles extraídos del token: ${JSON.stringify(roles)}`);
    
    // Extraer información del token
    const user = {
      userId: payload.sub,
      username: payload.preferred_username,
      roles: roles, // Asegurar que los roles se asignan correctamente
    };
    
    this.logger.log(`✅ Usuario autenticado: ${user.username} con roles: ${JSON.stringify(user.roles)}`);
    return user;
  }
}