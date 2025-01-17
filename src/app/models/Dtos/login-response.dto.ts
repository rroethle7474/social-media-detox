import { ApplicationUserDto } from "./application-user.dto";

export interface LoginResponseDto {
  token: string;
  message: string;
  user: ApplicationUserDto | null;
  response?: string;
  errorCode?: string;
}
