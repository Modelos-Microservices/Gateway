import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
//pedimos los roles al decorador de la clase y los ingresamos en la metadata
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
