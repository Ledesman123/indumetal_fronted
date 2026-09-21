export interface LoginRequest {
  correo: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  usuarioId: number;
  nombreCompleto: string;
  rol: string;
}

export interface ForgotPasswordRequest {
  correo: string;
}

export interface VerifyResetCodeRequest {
  correo: string;
  codigo: string;
}

export interface VerifyResetCodeResponse {
  resetToken: string;
  expiraEnMinutos: number;
}

export interface ResetPasswordRequest {
  correo: string;
  resetToken: string;
  nuevaPassword: string;
}