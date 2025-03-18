import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FormInput, FormInputProps } from './FormInput';

interface PasswordInputProps extends Omit<FormInputProps, 'secureTextEntry'> {
  showStrengthIndicator?: boolean;
  onStrengthChange?: (strength: number) => void;
}

export function PasswordInput({
  showStrengthIndicator = false,
  onStrengthChange,
  ...props
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [strength, setStrength] = useState(0);
  const strengthAnim = useRef(new Animated.Value(0)).current;

  const calculateStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const getStrengthColor = (score: number) => {
    switch (score) {
      case 0:
        return '#ef4444';
      case 1:
        return '#f97316';
      case 2:
        return '#eab308';
      case 3:
        return '#84cc16';
      case 4:
        return '#22c55e';
      case 5:
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const handleChangeText = (text: string) => {
    if (showStrengthIndicator) {
      const newStrength = calculateStrength(text);
      setStrength(newStrength);
      onStrengthChange?.(newStrength);

      // Animate the strength bar
      Animated.spring(strengthAnim, {
        toValue: newStrength / 5,
        useNativeDriver: false,
        damping: 15,
        mass: 1,
        stiffness: 100,
      }).start();
    }
    props.onChangeText?.(text);
  };

  return (
    <View>
      <FormInput
        {...props}
        secureTextEntry={!isVisible}
        onChangeText={handleChangeText}
        rightIcon={
          <TouchableOpacity onPress={() => setIsVisible(!isVisible)}>
            <Ionicons
              name={isVisible ? 'eye-off' : 'eye'}
              size={20}
              color={props.error ? '#ef4444' : '#6b7280'}
            />
          </TouchableOpacity>
        }
      />
      {showStrengthIndicator && props.value && (
        <View style={styles.strengthContainer}>
          <Animated.View
            style={[
              styles.strengthBar,
              {
                width: strengthAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: getStrengthColor(strength),
              },
            ]}
          />
          <Text style={[styles.strengthText, { color: getStrengthColor(strength) }]}>
            {strength === 0 && 'Very Weak'}
            {strength === 1 && 'Weak'}
            {strength === 2 && 'Fair'}
            {strength === 3 && 'Good'}
            {strength === 4 && 'Strong'}
            {strength === 5 && 'Very Strong'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  strengthContainer: {
    marginTop: 4,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
}); 