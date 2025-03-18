import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Button, Card, Input } from '../../components/common';

describe('Common Components', () => {
  describe('Button', () => {
    it('renders correctly', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <Button onPress={onPress}>Test Button</Button>
      );
      expect(getByText('Test Button')).toBeTruthy();
    });

    it('handles press events', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <Button onPress={onPress}>Test Button</Button>
      );
      fireEvent.press(getByText('Test Button'));
      expect(onPress).toHaveBeenCalled();
    });
  });

  describe('Input', () => {
    it('renders correctly', () => {
      const onChangeText = jest.fn();
      const { getByPlaceholderText } = render(
        <Input
          placeholder="Test Input"
          onChangeText={onChangeText}
          value=""
        />
      );
      expect(getByPlaceholderText('Test Input')).toBeTruthy();
    });

    it('handles text input', () => {
      const onChangeText = jest.fn();
      const { getByPlaceholderText } = render(
        <Input
          placeholder="Test Input"
          onChangeText={onChangeText}
          value=""
        />
      );
      fireEvent.changeText(getByPlaceholderText('Test Input'), 'test');
      expect(onChangeText).toHaveBeenCalledWith('test');
    });
  });

  describe('Card', () => {
    it('renders correctly', () => {
      const { getByText } = render(
        <Card>
          <Button onPress={jest.fn()}>Test Button</Button>
        </Card>
      );
      expect(getByText('Test Button')).toBeTruthy();
    });
  });
}); 