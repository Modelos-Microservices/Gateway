import { SetMetadata } from "@nestjs/common";

export const Is_Protected = "is_protected";
export const Protect = () => SetMetadata(Is_Protected, true);

