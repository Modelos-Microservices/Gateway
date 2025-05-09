import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class UserService {

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
