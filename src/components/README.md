# EcoCart Components

This directory contains all reusable components for the EcoCart application. Each component is documented with a standardized README file to ensure consistent usage and maintainability.

## Component Categories

The components are organized into the following categories:

- **[UI](./ui/README.md)**: Core UI components like buttons, inputs, and text displays
- **[Collection](./collection/README.md)**: Components for collection scheduling and tracking
- **[Community](./community/README.md)**: Social features and community engagement
- **[Form](./form/README.md)**: Form controls and validation
- **[Analytics](./analytics/README.md)**: Data visualization and analytics
- **[Gamification](./gamification/README.md)**: Points, badges, and gamification elements
- **[Notifications](./notifications/README.md)**: Notification components
- **[Materials](./materials/README.md)**: Recyclable materials management
- **[Real-Time](./real-time/README.md)**: Real-time tracking and updates
- **[Rewards](./rewards/README.md)**: Reward system components
- **[Storage](./storage/README.md)**: Storage-related components
- **[Sustainability](./sustainability/README.md)**: Sustainability tracking components
- **[Performance](./performance/README.md)**: Performance optimization components

## Documentation Standards

All component documentation follows a standardized format to ensure consistency. Each component should have a `ComponentName.README.md` file in its directory that includes:

1. **Title and Overview**: Component name and brief description
2. **Usage**: Import statements and basic usage examples
3. **Props**: Table of props with types, requirements, defaults, and descriptions
4. **Features**: Bullet points of key features
5. **Styling**: Description of styling options with examples
6. **Best Practices**: Do's and don'ts for component usage
7. **Examples**: Multiple examples showing different use cases
8. **Implementation Details**: Brief technical implementation explanation (optional)
9. **Related Components**: Links to related components
10. **Related Documentation**: Links to relevant documentation

For complete documentation standards, see [Component Documentation Guide](../docs/guides/component-documentation.md).

## Creating New Components

When creating a new component:

1. Place it in the appropriate category directory
2. Follow the [component naming conventions](../docs/guides/naming-conventions.md)
3. Create a standardized README file (use the generator script if needed)
4. Ensure the component is properly typed with TypeScript
5. Follow the design system guidelines
6. Consider accessibility requirements
7. Include appropriate tests

## Documentation Tools

We provide several tools to help with component documentation:

- **README Generator**: `node scripts/generate-readme.js [component-path]`
- **README Audit**: `node scripts/readme-audit.js`

## Contribution Guidelines

When contributing to the component library:

1. Follow the established code style and patterns
2. Ensure all components have proper documentation
3. Update documentation when changing component behavior
4. Add tests for new components
5. Submit a PR for review

## Component Design Principles

All EcoCart components should follow these design principles:

1. **Reusability**: Components should be designed for reuse across the application
2. **Composability**: Components should be composable with other components
3. **Flexibility**: Components should be flexible enough to handle various use cases
4. **Accessibility**: Components should be accessible to all users
5. **Performance**: Components should be optimized for performance
6. **Consistency**: Components should maintain consistent behavior and styling
7. **Simplicity**: Components should have a clear, focused purpose

## Questions and Support

If you have questions about components or documentation, please contact the team lead or refer to the detailed documentation in the `/docs` directory. 