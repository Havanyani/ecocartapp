# Authentication System Guide

This guide provides an overview of the authentication system implemented in the EcoCart application, detailing the architecture, components, and usage patterns.

## Architecture Overview

The authentication system consists of several key components:

1. **AuthService**: Core service handling API communication and token management
2. **AuthContext**: React Context for authentication state management
3. **SecureStorage**: Utility for secure credential storage
4. **Authentication Screens**: UI components for login, signup, etc.

## Core Components

### AuthService

Located in `src/services/AuthService.ts`, this service handles all authentication-related API calls and token management:

- **Login & Registration**: Email/password authentication
- **Social Authentication**: Google, Apple, and Facebook integration
- **Biometric Authentication**: Fingerprint/Face ID support
- **Token Management**: Storing, refreshing, and validating tokens
- **Password Reset**: Forgot password flow

### AuthContext

Located in `src/contexts/AuthContext.tsx`, this context provides authentication state and methods to React components:

- **Authentication State**: User data, token, loading/error states
- **Auth Methods**: Sign in/up, sign out, and password reset
- **Biometric Auth**: Enable/disable and authenticate with biometrics
- **Two-Factor Auth**: Enable/disable and verify 2FA

### SecureStorage

Located in `src/utils/SecureStorage.ts`, this utility safely stores sensitive information:

- Uses Expo's SecureStore on native platforms
- Falls back to AsyncStorage with prefixes on web platforms
- Provides methods to store, retrieve, and remove secure data

## Authentication Flows

### Email/Password Authentication

1. **Login Flow**:
   - User enters email/password in LoginScreen
   - AuthContext calls AuthService.login()
   - AuthService makes API request and stores tokens
   - AuthContext updates state and redirects to main app

2. **Registration Flow**:
   - User enters details in SignupScreen
   - AuthContext calls AuthService.register()
   - AuthService makes API request and stores tokens
   - AuthContext updates state and redirects to main app

3. **Password Reset Flow**:
   - User enters email in ForgotPasswordScreen
   - AuthContext calls AuthService.requestPasswordReset()
   - User receives email with reset link/token
   - User enters new password with token
   - AuthService resets the password via API

### Social Authentication

The app supports authentication via:

- **Google**: Using Expo AuthSession with Google provider
- **Apple**: Using Expo AppleAuthentication
- **Facebook**: Using Expo AuthSession with Facebook provider

Each flow follows a similar pattern:
1. Authenticate with the provider
2. Receive authentication token
3. Exchange token with our backend for app tokens
4. Store tokens and update authentication state

### Biometric Authentication

Biometric authentication allows users to login using device biometrics:

1. **Enabling Biometrics**:
   - User authenticates with email/password
   - App verifies credentials via API
   - App securely stores credentials
   - User can now login with biometrics

2. **Authenticating with Biometrics**:
   - App prompts for biometric verification
   - Upon success, retrieves stored credentials
   - Uses credentials to authenticate with the server
   - Updates authentication state accordingly

### Two-Factor Authentication

Two-factor authentication adds an extra layer of security:

1. **Enabling 2FA**:
   - User generates a secret in the app
   - User adds this to an authenticator app
   - User verifies with a code from the authenticator
   - 2FA is enabled for future logins

2. **Login with 2FA**:
   - User enters email/password
   - If 2FA is enabled, user is prompted for code
   - Code is verified with the server
   - On success, user is logged in

## Token Management

Authentication tokens are managed as follows:

- **Storage**: Tokens are securely stored using SecureStorage
- **Expiration**: Tokens are automatically refreshed before expiry
- **Refresh**: If a token is invalid, the refresh token is used to get a new one
- **Logout**: Tokens are cleared on logout

## Usage Examples

### Basic Authentication

```tsx
import { useAuth } from '@/contexts/AuthContext';

function LoginComponent() {
  const { signIn, isLoading, error } = useAuth();
  
  const handleLogin = async () => {
    try {
      await signIn({ 
        email: 'user@example.com', 
        password: 'password' 
      });
      // Redirect happens automatically
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  return (
    // Login UI
  );
}
```

### Social Authentication

```tsx
import { useAuth } from '@/contexts/AuthContext';

function SocialLoginButtons() {
  const { 
    signInWithGoogle, 
    signInWithApple, 
    signInWithFacebook 
  } = useAuth();
  
  return (
    <View>
      <Button onPress={signInWithGoogle} title="Sign in with Google" />
      <Button onPress={signInWithApple} title="Sign in with Apple" />
      <Button onPress={signInWithFacebook} title="Sign in with Facebook" />
    </View>
  );
}
```

### Biometric Authentication

```tsx
import { useAuth } from '@/contexts/AuthContext';

function BiometricLogin() {
  const { 
    authenticateWithBiometric, 
    enableBiometric, 
    isBiometricEnabled 
  } = useAuth();
  
  return (
    <View>
      {isBiometricEnabled ? (
        <Button 
          onPress={authenticateWithBiometric} 
          title="Login with Biometrics" 
        />
      ) : (
        <Button 
          onPress={enableBiometric} 
          title="Enable Biometric Login" 
        />
      )}
    </View>
  );
}
```

## Security Considerations

The authentication system implements several security best practices:

1. **Secure Storage**: Credentials and tokens are stored securely
2. **Token Refresh**: Access tokens are short-lived with refresh capability
3. **Biometric Authentication**: Device-level security for convenient login
4. **Two-Factor Authentication**: Optional additional security layer
5. **HTTPS**: All API communication is encrypted
6. **Error Handling**: Generic error messages to prevent information leakage

## Testing Authentication

The authentication system has comprehensive tests:

- **Unit Tests**: Testing individual methods in AuthService
- **Integration Tests**: Testing AuthContext with mocked services
- **End-to-End Tests**: Testing full authentication flows in the app

## Configuration

To configure the authentication system:

1. Update API endpoints in AuthService for your backend
2. Set up social authentication credentials:
   - Google: Update clientId in AuthService
   - Apple: Configure AppleAuthentication in app.json
   - Facebook: Update Facebook App ID in AuthService

## Conclusion

The EcoCart authentication system provides a secure, flexible foundation for user authentication with multiple options to balance security and convenience. The architecture separates concerns appropriately between services, context providers, and UI components, making it maintainable and extensible. 