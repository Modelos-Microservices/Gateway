import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { envs } from 'src/config/envs';
import { createUserDtoKeyCloak } from './dto/createUserKeyCloak.dto';



@Injectable()
export class KeycloakUserGeneratorService {
    // instancia del cliente de Keycloak Admin
    private kcAdminClient: KeycloakAdminClient;
    private readonly logger = new Logger(KeycloakUserGeneratorService.name)

    constructor(private configService: ConfigService) {
        // Inicializamos el cliente de Keycloak Admin con la URL y el nombre del realm desde el env
        this.kcAdminClient = new KeycloakAdminClient({
            baseUrl: this.configService.get<string>('KEYCLOAK_URL'),
            realmName: this.configService.get<string>('KEYCLOAK_REALM'),
        })
    }

    // Método para inicializar el cliente de Keycloak Admin
    async init() {
        try {
            // Autenticación con Keycloak usando client_credentials
            await this.kcAdminClient.auth({
                // se especifica la forma en que se autentica el cliente
                grantType: 'client_credentials',
                // se especifica el cliente y el secreto del cliente
                clientId: envs.keycloakClientId,
                clientSecret: envs.keycloakClientSecret,
            });
            // Configuración del cliente de Keycloak Admin con el nombre del realm
            this.kcAdminClient.setConfig({
                realmName: envs.keycloakRealm,
            });
            return true
        } catch (error) {
            this.logger.error('Error initializing Keycloak client', error);
            throw new Error('Failed to initialize Keycloak client');
        }
    }

    async createUser(userData: createUserDtoKeyCloak) {
        await this.init(); // Nos aseguramos de que el cliente esté inicializado antes de hacer solicitudes
        try {
            // Creamos el usuario en Keycloak
            const user = await this.kcAdminClient.users.create({
                username: userData.username,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                enabled: userData.enabled !== undefined ? userData.enabled : true,
                attributes: userData.attributes,
            });

            this.logger.log(`User created with ID: ${user.id}`);

            // Si se proporciona un password, se la asignamos al usuario
            if (userData.password) {
                await this.kcAdminClient.users.resetPassword({
                    //especificamos el id del usuario que acabamos de crear
                    id: user.id,
                    //especificamos el nuevo password
                    credential: {
                        temporary: userData.isTemporaryPassword || false,
                        type: 'password',
                        value: userData.password,
                    }
                });
            }
            this.logger.log(`Password set for user ID: ${user.id}`);
            return user
        } catch (error) {
            this.logger.error('Error creating user in Keycloak', error);
            throw new BadRequestException(
                error?.responseData?.errorMessage || 'Failed to create user in Keycloak'
              );              
        }
    }

    async assignRolesToUser(userId: string, roles: string[]) {
        await this.init(); // Nos aseguramos de que el cliente esté inicializado antes de hacer solicitudes
        try {
            //Obtenemos los roles disponibles en el realm
            const availableRoles = await this.kcAdminClient.roles.find();
            // Filtramos los roles que queremos asignar al usuario
            const filterRoles = availableRoles.filter(role => role.name && roles.includes(role.name));
            // creamos un array de roles con el id y el nombre del rol
            const rolesToAssing = filterRoles.map(role => ({id:role.id!, name:role.name!}))
            // Si no se encuentran roles para asignar, lanzamos una advertencia
            if (rolesToAssing.length === 0) {
                this.logger.warn(`No roles found to assign to user ID: ${userId}`);
                return false;
            }
            // Asignamos los roles al usuario
            await this.kcAdminClient.users.addRealmRoleMappings({
                id: userId,
                roles: rolesToAssing,
            });
            this.logger.log(`Roles assigned to user ID: ${userId}`);
            return true;
        } catch (error) {
            this.logger.error('Error assigning roles to user in Keycloak', error);
            throw new Error('Failed to assign roles to user in Keycloak');
        }
    }

}
