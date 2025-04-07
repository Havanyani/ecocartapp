# OptimizedImage Component

A cross-platform image component that provides optimized loading, caching, and display capabilities for both React Native and Web.

## Features

- Progressive loading with fade-in transitions
- Smart caching strategies for improved performance
- Customizable placeholders during loading
- Error state handling
- Responsive sizing with aspect ratio support
- Loading priority control (high/normal/low)
- Blur effects
- Accessibility support

## Usage

```tsx
import { OptimizedImage } from './components/ui/OptimizedImage';

// Basic usage with remote URL
<OptimizedImage 
  source="https://example.com/image.jpg"
  width={200}
  height={200}
/>

// Using local image
<OptimizedImage 
  source={require('../assets/images/logo.png')}
  style={{ borderRadius: 8 }}
  width="100%"
  aspectRatio={16/9}
/>

// With loading placeholder and fade effect
<OptimizedImage 
  source={{ uri: "https://example.com/large-image.jpg" }}
  fadeIn={true}
  fadeDuration={500}
  showPlaceholder={true}
  priority="high"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `source` | string \| number \| { uri: string } | Required | The source of the image. Can be a remote URL (string), a local resource (result of require), or an object with a uri property. |
| `style` | StyleProp<ImageStyle> | undefined | Additional style properties for the image. |
| `width` | number \| string | undefined | Width of the image. Can be a number (pixels) or string percentage. |
| `height` | number \| string | undefined | Height of the image. Can be a number (pixels) or string percentage. |
| `aspectRatio` | number | undefined | Aspect ratio to maintain (width/height). |
| `resizeMode` | 'cover' \| 'contain' \| 'stretch' \| 'repeat' \| 'center' | 'cover' | How the image should be resized to fit its container. |
| `showPlaceholder` | boolean | true | Whether to show a placeholder while the image is loading. |
| `placeholderComponent` | ReactNode | undefined | Custom component to use as a placeholder. |
| `placeholderColor` | string | theme.colors.placeholder | Background color of the default placeholder. |
| `fadeIn` | boolean | true | Whether to fade in the image when it loads. |
| `fadeDuration` | number | 300 | Duration of the fade-in animation in milliseconds. |
| `onLoad` | function | undefined | Callback that is called when the image is successfully loaded. |
| `onError` | function | undefined | Callback that is called when the image fails to load. |
| `blurRadius` | number | undefined | The blur radius of the image blur effect. |
| `accessibilityLabel` | string | undefined | Accessibility label for the image. |
| `testID` | string | undefined | ID for testing. |
| `cacheEnabled` | boolean | true | Whether to enable image caching. |
| `priority` | 'low' \| 'normal' \| 'high' | 'normal' | Loading priority of the image. |
| `shouldCache` | boolean | true | Whether this specific image should be cached. |

## Platform-Specific Implementation Details

### Native (iOS & Android)
The native implementation uses `expo-image` which provides:
- Enhanced performance over the standard React Native Image component
- Sophisticated caching mechanisms
- Memory-efficient loading
- Hardware-accelerated image transformations

### Web
The web implementation uses:
- Modern web image practices
- Browser-native lazy loading
- Priority hints using `fetchpriority` attribute
- CSS transitions for smooth animations
- Object-fit properties for resize mode mapping

## Best Practices

- Always provide width/height or aspectRatio to prevent layout shifts
- Use appropriate resizeMode for your design needs
- Set priority="high" for above-the-fold or critical images
- Utilize the proper image format for your needs (WebP for best compression)
- Provide appropriate accessibilityLabel for all images that convey meaning
- Consider disabling animations for users who prefer reduced motion

## Examples

### Responsive Image Gallery Item

```tsx
<OptimizedImage
  source={item.imageUrl}
  style={styles.galleryImage}
  width="100%"
  aspectRatio={4/3}
  resizeMode="cover"
  priority={index < 4 ? "high" : "normal"}
  accessibilityLabel={item.description}
/>
```

### Profile Avatar

```tsx
<OptimizedImage
  source={user.avatarUrl}
  style={styles.avatar}
  width={48}
  height={48}
  resizeMode="cover"
  priority="high"
  accessibilityLabel={`${user.name}'s profile picture`}
/>
```

### Hero Banner

```tsx
<OptimizedImage
  source={bannerImage}
  width="100%"
  height={200}
  resizeMode="cover"
  fadeIn={true}
  fadeDuration={800}
  priority="high"
  accessibilityLabel="Featured promotion banner"
/>
``` 