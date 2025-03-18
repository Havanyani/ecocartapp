# EcoCart Types System

This directory contains the central type definitions for the EcoCart application. The type system is designed to provide type safety and consistency across the application.

## Structure

- `index.ts`: Core type definitions used across the application
- Domain-specific types are organized in their respective files (e.g., `auth.ts`, `materials.ts`)

## Type Conventions

1. **Naming Conventions**
   - Interfaces: PascalCase (e.g., `UserProfile`)
   - Types: PascalCase (e.g., `MaterialCategory`)
   - Enums: PascalCase (e.g., `CollectionStatus`)

2. **Type vs Interface**
   - Use `interface` for object shapes that may be extended
   - Use `type` for unions, intersections, and primitive type aliases
   - Prefer `interface` over `type` when both could work

3. **Documentation**
   - All types must have JSDoc comments
   - Include descriptions for complex properties
   - Document any constraints or validation rules

4. **Best Practices**
   - Keep types focused and single-responsibility
   - Use composition over inheritance
   - Make types as strict as possible
   - Use readonly where appropriate
   - Use optional properties sparingly

## Usage Examples

```typescript
// Using the Material interface
const recyclableMaterial: Material = {
  id: "123",
  name: "Plastic Bottle",
  category: "PLASTIC",
  recyclable: true,
  points: 10,
  description: "Clear PET plastic bottle"
};

// Using the CollectionSchedule interface
const schedule: CollectionSchedule = {
  id: "456",
  userId: "user123",
  materials: [recyclableMaterial],
  scheduledDate: "2024-03-20T10:00:00Z",
  status: "PENDING",
  address: {
    street: "123 Green St",
    city: "Eco City",
    state: "EC",
    postalCode: "12345",
    country: "USA"
  }
};
```

## Type Safety

The type system is designed to catch common errors at compile time:

- Incorrect property access
- Missing required properties
- Invalid enum values
- Type mismatches

## Contributing

When adding new types:

1. Add JSDoc comments
2. Follow naming conventions
3. Add to appropriate domain file
4. Update this README if needed
5. Add usage examples if complex 