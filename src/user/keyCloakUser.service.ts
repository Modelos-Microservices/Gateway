import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios'; // <--- Importación correcta
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import * as qs from 'qs';
import { AxiosError } from 'axios';
import { envs } from 'src/config';
import { RpcException } from '@nestjs/microservices';

// Interfaz opcional pero recomendada para el tipado
interface KeycloakUserRepresentation {
  id: string;
  username?: string;
  // ... otros campos que esperes de Keycloak
}

@Injectable()
export class KeycloakUsersService {
  private readonly logger = new Logger(KeycloakUsersService.name);
  private keycloakUrl: string;
  private realm: string;
  private clientId: string;
  private clientSecret: string;

  constructor(
    private readonly httpService: HttpService, // Inyecta desde @nestjs/axios
    private readonly configService: ConfigService,
  ) {
    this.keycloakUrl = 'http://keycloak:8080/';
    this.realm = envs.keycloakRealm;
    this.clientId = envs.keycloakClientId;
    this.clientSecret = envs.keycloakClientSecret;
  }

  /**
   * Obtiene el token de admin (simplificado).
   */
  private async getAdminToken(): Promise<string | null> {
    // Endpoint para obtener token (ajusta si usas cliente del realm específico o del master)
    const tokenEndpoint = 'http://keycloak:8080/realms/nestjs-realm/protocol/openid-connect/token';
    // Si tu cliente está en tu realm específico y tiene 'Service Accounts Enabled':
    // const tokenEndpoint = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token`;

    const data = qs.stringify({
      grant_type: 'client_credentials',
      client_id: 'nestjs-app',
      client_secret: '5RltabqVtFVT89B7pFBG1K5lTUdIrRCA',
    });

    try {
      const response = await firstValueFrom(
        this.httpService.post<{ access_token: string }>(tokenEndpoint, data, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      );
      return response.data.access_token;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(`Error getting Keycloak admin token: ${axiosError.message}`, axiosError.response?.data);
      return null;
    }
  }

  /**
   * Obtiene todos los usuarios usando un 'max' grande (sin paginación explícita).
   */
  async getAllUsers(): Promise<any[]> {
    const token = await this.getAdminToken();
    if (!token) {
      this.logger.error('No admin token, cannot fetch users.');
      return [];
    }

    const usersEndpoint = `${this.keycloakUrl}/admin/realms/${this.realm}/users`;
    // Define un número máximo suficientemente grande para tus pruebas iniciales
    const maxUsersToFetch = 1000;

    try {
      const response = await lastValueFrom(
        this.httpService.get<any[]>(usersEndpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            max: maxUsersToFetch, // Intenta obtener hasta este número de usuarios
          },
        }),
      );
      this.logger.log(`Workspaceed ${response.data.length} users (max requested: ${maxUsersToFetch}).`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(`Error fetching users from Keycloak: ${axiosError.message}`, axiosError.response?.data);
      return []; // Devuelve vacío en caso de error
    }
  }


  async getNameBeId(id: string){
   const users = await this.getAllUsers()
   const user =  users.find(user => user.id === id)
   if(user){
    return user.username
   } 
    throw new RpcException({status: 404, message:`User with id:${id} Not found please check`})
   
  }
}