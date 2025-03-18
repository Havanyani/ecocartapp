import { AppError, ErrorCodes } from '@/utils/ErrorHandler';

interface RegisterParams {
  email: string;
  password: string;
  name: string;
}

export async function login(email: string, password: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    throw new AppError(ErrorCodes.AUTH_ERROR);
  }

  return response.json();
}

export async function register(params: RegisterParams) {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    throw new AppError(ErrorCodes.REGISTRATION_ERROR);
  }

  return response.json();
} 