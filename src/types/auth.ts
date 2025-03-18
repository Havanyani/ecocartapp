export interface AuthUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  isTwoFactorEnabled?: boolean;
  twoFactorSecret?: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isBiometricEnabled: boolean;
  isTwoFactorEnabled: boolean;
  twoFactorSecret: string | null;
}

export interface LoginFormData {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export interface TwoFactorSetupData {
  secret: string;
  code: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  token: string;
  password: string;
  confirmPassword: string;
}

export type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: AuthUser; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }; 