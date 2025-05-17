import * as jwt from 'jsonwebtoken';
import { UserInfo } from 'src/common/entities/user.entity';
import { Injectable, Logger } from '@nestjs/common';




@Injectable()
export class UserService {

    extractUserInfoFromToken(request: any): UserInfo {
        const authHeader = request.headers.authorization;
        const token = authHeader.split(' ')[1]; // Obtener el token del encabezado Authorization
        if (!token) {
            throw new Error('Token de autenticación no encontrado');
        }

        try {
            // Decodificar el token sin verificar la firma
            const decoded = jwt.decode(token);

            // El ID suele estar en el campo 'sub' de un token de Keycloak
            if (decoded && typeof decoded === 'object' && decoded.sub && decoded.name) {
                return { user_id: decoded.sub, user_name: decoded.name };
            }

            throw new Error('No se pudo extraer el ID del usuario del token');
        } catch (error) {
            console.error('Error al extraer el ID del usuario:', error);
            throw new Error('Error al procesar el token de autenticación');
        }
    }

    extractUserIdFromToken(request: any): string {
        const authHeader = request.headers.authorization;
        const token = authHeader.split(' ')[1]; // Obtener el token del encabezado Authorization
        if (!token) {
            throw new Error('Token de autenticación no encontrado');
        }

        try {
            // Decodificar el token sin verificar la firma
            const decoded = jwt.decode(token);

            // El ID suele estar en el campo 'sub' de un token de Keycloak
            if (decoded && typeof decoded === 'object' && decoded.sub) {
                return decoded.sub;
            }

            throw new Error('No se pudo extraer el ID del usuario del token');
        } catch (error) {
            console.error('Error al extraer el ID del usuario:', error);
            throw new Error('Error al procesar el token de autenticación');
        }
    }

}
