export class createUserDtoKeyCloak {
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    password: string;
    isTemporaryPassword?: boolean;
    enabled?: boolean;
    attributes?: Record<string, any>;
}