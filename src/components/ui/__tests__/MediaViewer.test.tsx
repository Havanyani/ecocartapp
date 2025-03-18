import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import TestRenderer from 'react-test-renderer';
import { MediaViewer } from '../MediaViewer';

describe('MediaViewer', () => {
  const mockImages = [
    'https://picsum.photos/400/400?random=1',
    'https://picsum.photos/400/400?random=2',
  ];

  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with images', () => {
    const testRenderer = TestRenderer.create(
      <MediaViewer images={mockImages} onClose={mockOnClose} />
    );
    const testInstance = testRenderer.root;

    // Check if images are rendered
    const images = testInstance.findAllByType(Image);
    expect(images).toHaveLength(mockImages.length);

    // Check if close button is rendered
    const closeButton = testInstance.findByType(TouchableOpacity);
    expect(closeButton).toBeTruthy();
  });

  it('calls onClose when close button is pressed', () => {
    const testRenderer = TestRenderer.create(
      <MediaViewer images={mockImages} onClose={mockOnClose} />
    );
    const testInstance = testRenderer.root;

    // Press close button
    const closeButton = testInstance.findByType(TouchableOpacity);
    closeButton.props.onPress();

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders with empty images array', () => {
    const testRenderer = TestRenderer.create(
      <MediaViewer images={[]} onClose={mockOnClose} />
    );
    const testInstance = testRenderer.root;

    // Check if no images are rendered
    const images = testInstance.findAllByType(Image);
    expect(images).toHaveLength(0);

    // Check if close button is still rendered
    const closeButton = testInstance.findByType(TouchableOpacity);
    expect(closeButton).toBeTruthy();
  });

  it('renders with single image', () => {
    const singleImage = [mockImages[0]];
    const testRenderer = TestRenderer.create(
      <MediaViewer images={singleImage} onClose={mockOnClose} />
    );
    const testInstance = testRenderer.root;

    // Check if single image is rendered
    const images = testInstance.findAllByType(Image);
    expect(images).toHaveLength(1);
    expect(images[0].props.source.uri).toBe(singleImage[0]);
  });

  it('renders with correct image styles', () => {
    const testRenderer = TestRenderer.create(
      <MediaViewer images={mockImages} onClose={mockOnClose} />
    );
    const testInstance = testRenderer.root;

    // Check image styles
    const images = testInstance.findAllByType(Image);
    images.forEach((image: any) => {
      expect(image.props.style).toHaveProperty('width', '100%');
      expect(image.props.style).toHaveProperty('height', '100%');
      expect(image.props.contentFit).toBe('contain');
    });
  });

  it('renders with correct container styles', () => {
    const testRenderer = TestRenderer.create(
      <MediaViewer images={mockImages} onClose={mockOnClose} />
    );
    const testInstance = testRenderer.root;

    // Check container styles
    const container = testInstance.findByType(View);
    expect(container.props.style).toHaveProperty('flex', 1);
    expect(container.props.style).toHaveProperty('backgroundColor', 'rgba(0, 0, 0, 0.9)');
    expect(container.props.style).toHaveProperty('justifyContent', 'center');
    expect(container.props.style).toHaveProperty('alignItems', 'center');
  });

  it('renders with correct close button styles', () => {
    const testRenderer = TestRenderer.create(
      <MediaViewer images={mockImages} onClose={mockOnClose} />
    );
    const testInstance = testRenderer.root;

    // Check close button styles
    const closeButton = testInstance.findByType(TouchableOpacity);
    expect(closeButton.props.style).toHaveProperty('position', 'absolute');
    expect(closeButton.props.style).toHaveProperty('top', 40);
    expect(closeButton.props.style).toHaveProperty('right', 20);
    expect(closeButton.props.style).toHaveProperty('zIndex', 1);
    expect(closeButton.props.style).toHaveProperty('padding', 8);
  });
}); 