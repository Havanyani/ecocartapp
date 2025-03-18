import { login, register } from '../../services/auth';
import { AppError, ErrorCodes } from '../../utils/ErrorHandler';

type MockFetch = jest.Mock & {
  mockResolvedValueOnce: (value: any) => MockFetch;
}

describe('Auth Integration', () => {
  const mockFetch = jest.fn() as MockFetch;
  global.fetch = mockFetch;

  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('Login', () => {
    it('logs in successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ token: 'test-token' })
      });

      const response = await login('test@example.com', 'password123');
      expect(response.token).toBe('test-token');
    });

    it('handles login errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      await expect(login('test@example.com', 'wrong-password'))
        .rejects
        .toThrow(new AppError(ErrorCodes.AUTH_ERROR));
    });
  });

  describe('Register', () => {
    it('registers successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'user-123' })
      });

      const response = await register({
        email: 'new@example.com',
        password: 'password123',
        name: 'New User'
      });
      expect(response.id).toBe('user-123');
    });

    it('handles registration errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400
      });

      await expect(register({
        email: 'invalid@example.com',
        password: '123',
        name: 'Invalid User'
      }))
        .rejects
        .toThrow(new AppError(ErrorCodes.REGISTRATION_ERROR));
    });
  });
}); 