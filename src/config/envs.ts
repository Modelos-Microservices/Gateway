import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
    PORT: number;
    NATS_SERVERS: string[];
    // Añadimos las variables de Keycloak
    KEYCLOAK_CLIENT_ID: string;
    KEYCLOAK_CLIENT_SECRET: string;
    KEYCLOAK_REALM: string;
    KEYCLOAK_HOST: string;
    KEYCLOAK_ADMIN?: string;
    KEYCLOAK_ADMIN_PASSWORD?: string;
    KEYCLOAK_DB_PASSWORD?: string;
}

const envsSchema = joi.object({
    PORT: joi.number().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
    // Validaciones para las variables de Keycloak
    KEYCLOAK_CLIENT_ID: joi.string().required(),
    KEYCLOAK_CLIENT_SECRET: joi.string().required(),
    KEYCLOAK_REALM: joi.string().required(),
    KEYCLOAK_HOST: joi.string().required(),
    KEYCLOAK_ADMIN: joi.string().optional(),
    KEYCLOAK_ADMIN_PASSWORD: joi.string().optional(),
    KEYCLOAK_DB_PASSWORD: joi.string().optional()
}).unknown(true);

const { error, value } = envsSchema.validate({
    ...process.env,
    NATS_SERVERS: process.env.NATS_SERVERS?.split(',')
});

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;
export const envs = {
    port: envVars.PORT,
    nats_servers: envVars.NATS_SERVERS,
    // Exportamos las variables de Keycloak con los nombres que espera tu servicio
    keycloakClientId: envVars.KEYCLOAK_CLIENT_ID,
    keycloakClientSecret: envVars.KEYCLOAK_CLIENT_SECRET,
    keycloakRealm: envVars.KEYCLOAK_REALM,
    keycloakHost: envVars.KEYCLOAK_HOST,
    keycloakAdmin: envVars.KEYCLOAK_ADMIN,
    keycloakAdminPassword: envVars.KEYCLOAK_ADMIN_PASSWORD,
    keycloakDbPassword: envVars.KEYCLOAK_DB_PASSWORD
};