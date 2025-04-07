# EcoCart App

EcoCart is a cross-platform application for sustainable shopping and recycling, built with React Native, Expo, and TypeScript.

## Features

- **Recycling Materials Guide**: Learn how to recycle different materials correctly
- **Collection Points Map**: Find nearby recycling collection points
- **Community Challenges**: Join eco-friendly challenges with the community
- **Product Scanner**: Scan products to check recyclability and eco-friendliness
- **Personal Impact Dashboard**: Track your environmental impact

## Tech Stack

- **Framework**: React Native + Expo
- **Language**: TypeScript
- **Navigation**: Expo Router
- **State Management**: React Context & React Query
- **UI Components**: Custom cross-platform components
- **Styling**: StyleSheet & CSS-in-JS for web
- **Testing**: Jest, React Native Testing Library

## Cross-Platform Architecture

This project follows a cross-platform architecture that allows code sharing between mobile (iOS/Android) and web platforms. See [ARCHITECTURE.md](./src/ARCHITECTURE.md) for details on our approach.

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, Mac only)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ecocart.git
cd ecocart

# Install dependencies
npm install

# Start the development server
npm start
```

### Running the App

- **iOS**: `npm run ios`
- **Android**: `npm run android`
- **Web**: `npm run web`

## Project Structure

```
ecocartapp/
├── app/                  # Expo Router app directory
│   ├── (tabs)/           # Tab navigation routes
│   ├── _layout.tsx       # Root layout component
│   └── index.tsx         # Home screen
├── src/
│   ├── components/       # Shared components
│   │   ├── ui/           # UI components with platform extensions
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx         # Shared interface
│   │   │   │   ├── Button.native.tsx  # Native implementation
│   │   │   │   ├── Button.web.tsx     # Web implementation
│   │   │   │   └── index.ts           # Exports
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   └── styles/           # Shared styles
├── docs/                 # Documentation
│   ├── MIGRATION.md      # Platform migration documentation
│   └── component-standards-guide.md  # Component standards
└── public/               # Static assets for web
```

## Platform Extensions

This project uses file extensions to differentiate between platform-specific implementations:

- `.tsx` - Shared code and interfaces
- `.native.tsx` - React Native specific code (iOS & Android)
- `.web.tsx` - Web specific code

Bundlers automatically select the correct implementation:
- Metro bundler prefers `.native.tsx` over `.tsx` for mobile
- Webpack prefers `.web.tsx` over `.tsx` for web

### Example Usage

```tsx
// Import a component - bundler will choose the right implementation
import { Button } from '@/components/ui/Button';

function MyScreen() {
  return (
    <Button
      label="Press Me"
      onPress={() => console.log('Button pressed')}
      variant="primary"
    />
  );
}
```

## Styling Utilities

We use platform-specific styling utilities for cross-platform development:

```tsx
// Cross-platform shadow
import { createShadow } from '@/utils/styleUtils';

const styles = StyleSheet.create({
  card: {
    ...createShadow({
      offsetY: 2,
      opacity: 0.1,
      radius: 4,
    }),
  }
});

// Responsive styles
import { createResponsiveStyles } from '@/utils/styleUtils';

const styles = createResponsiveStyles({
  base: { padding: 16 },
  medium: { padding: 24 },
  large: { padding: 32 },
});

// Platform-specific styles
import { platformSelect } from '@/utils/styleUtils';

const fontSize = platformSelect({
  ios: 16,
  android: 14,
  web: 18,
  default: 16,
});
```

## Development Workflow

1. **Feature Development**:
   - Create shared interfaces in `.tsx` files
   - Implement mobile versions in `.native.tsx`
   - Implement web versions in `.web.tsx`
   - Export through `index.ts`

2. **Testing**:
   - Write tests for shared logic
   - Test on both mobile and web platforms

3. **Documentation**:
   - Create README files for complex components
   - Document props and usage examples

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
