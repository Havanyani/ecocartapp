import { authenticator } from 'otplib';

export function generateSecret(): string {
  return authenticator.generateSecret();
}

export function generateQRCodeUrl(secret: string, email: string): string {
  return authenticator.keyuri(email, 'EcoCart', secret);
}

export function verifyToken(secret: string, token: string): boolean {
  return authenticator.verify({ token, secret });
}

export function generateToken(secret: string): string {
  return authenticator.generate(secret);
} 