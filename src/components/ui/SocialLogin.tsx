import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from './Text';

interface SocialLoginProps {
  onGoogleLogin: () => Promise<void>;
  onAppleLogin: () => Promise<void>;
  onFacebookLogin: () => Promise<void>;
  onTwitterLogin: () => Promise<void>;
  onGithubLogin: () => Promise<void>;
  onMicrosoftLogin: () => Promise<void>;
  isLoading?: boolean;
}

export function SocialLogin({
  onGoogleLogin,
  onAppleLogin,
  onFacebookLogin,
  onTwitterLogin,
  onGithubLogin,
  onMicrosoftLogin,
  isLoading = false,
}: SocialLoginProps) {
  return (
    <View style={styles.container}>
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>Or continue with</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.socialButtons}>
        <TouchableOpacity
          style={[styles.socialButton, styles.googleButton]}
          onPress={onGoogleLogin}
          disabled={isLoading}
        >
          <Ionicons name="logo-google" size={24} color="#fff" />
          <Text style={styles.socialButtonText}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.socialButton, styles.appleButton]}
          onPress={onAppleLogin}
          disabled={isLoading}
        >
          <Ionicons name="logo-apple" size={24} color="#fff" />
          <Text style={styles.socialButtonText}>Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.socialButton, styles.facebookButton]}
          onPress={onFacebookLogin}
          disabled={isLoading}
        >
          <Ionicons name="logo-facebook" size={24} color="#fff" />
          <Text style={styles.socialButtonText}>Facebook</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.socialButton, styles.twitterButton]}
          onPress={onTwitterLogin}
          disabled={isLoading}
        >
          <Ionicons name="logo-twitter" size={24} color="#fff" />
          <Text style={styles.socialButtonText}>Twitter</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.socialButton, styles.githubButton]}
          onPress={onGithubLogin}
          disabled={isLoading}
        >
          <Ionicons name="logo-github" size={24} color="#fff" />
          <Text style={styles.socialButtonText}>GitHub</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.socialButton, styles.microsoftButton]}
          onPress={onMicrosoftLogin}
          disabled={isLoading}
        >
          <Ionicons name="logo-microsoft" size={24} color="#fff" />
          <Text style={styles.socialButtonText}>Microsoft</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#6B7280',
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    minWidth: '48%',
    gap: 8,
  },
  socialButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: '#DB4437',
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  facebookButton: {
    backgroundColor: '#4267B2',
  },
  twitterButton: {
    backgroundColor: '#1DA1F2',
  },
  githubButton: {
    backgroundColor: '#333333',
  },
  microsoftButton: {
    backgroundColor: '#00A4EF',
  },
}); 