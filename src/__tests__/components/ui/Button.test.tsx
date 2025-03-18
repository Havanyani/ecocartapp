import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import Button from '../../../components/ui/Button';

describe('Button Component', () => {
  it('renders correctly with default props', () => {
    const { getByText } = render(<Button label="Test Button" onPress={() => {}} />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress handler when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button label="Test Button" onPress={onPressMock} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('applies disabled styling when disabled', () => {
    const { getByTestId } = render(
      <Button label="Test Button" onPress={() => {}} disabled={true} />
    );
    
    const buttonElement = getByTestId('button');
    expect(buttonElement.props.style).toMatchObject({
      opacity: 0.5,
    });
  });

  it('does not call onPress when disabled', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button label="Test Button" onPress={onPressMock} disabled={true} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('renders with custom styling', () => {
    const customStyle = { backgroundColor: 'red', borderRadius: 10 };
    const { getByTestId } = render(
      <Button 
        label="Test Button" 
        onPress={() => {}} 
        style={customStyle} 
      />
    );
    
    const buttonElement = getByTestId('button');
    expect(buttonElement.props.style).toMatchObject(customStyle);
  });

  it('renders with an icon when provided', () => {
    const { getByTestId } = render(
      <Button 
        label="Test Button" 
        onPress={() => {}} 
        icon="add"
      />
    );
    
    expect(getByTestId('button-icon')).toBeTruthy();
  });

  it('renders with correct accessibility props', () => {
    const { getByTestId } = render(
      <Button 
        label="Test Button" 
        onPress={() => {}} 
        accessibilityLabel="Custom accessibility label"
      />
    );
    
    const buttonElement = getByTestId('button');
    expect(buttonElement.props.accessibilityLabel).toBe('Custom accessibility label');
    expect(buttonElement.props.accessibilityRole).toBe('button');
  });
}); 