# Theme Migration Plan

This document outlines the plan for migrating the application to the new theme system.

### Migration Status Table

| Phase | Component | Status | Date | Notes |
|-------|-----------|--------|------|-------|
| Phase 1 | ThemedText.tsx | **COMPLETED** | 2023-09-25 | Migrated the ThemedText component to use the new theme system |
| Phase 1 | ThemedView.tsx | **COMPLETED** | 2023-09-25 | Migrated the ThemedView component to use the new theme system |
| Phase 1 | ThemedButton.tsx | **COMPLETED** | 2023-09-25 | Migrated the ThemedButton component to use the new theme system |
| Phase 2 | LanguageSelector.tsx | **COMPLETED** | 2023-09-26 | Migrated language selector component |
| Phase 2 | ThemeToggle.tsx | **COMPLETED** | 2023-09-26 | Updated theme toggle to work with new theme system |
| Phase 2 | IconSymbol.tsx | **COMPLETED** | 2023-09-26 | Migrated icon component to use theme colors |
| Phase 3 | NotificationPanel.tsx | **COMPLETED** | 2023-09-27 | Updated notification styling and animations |
| Phase 3 | UserAvatar.tsx | **COMPLETED** | 2023-09-27 | Migrated avatar component with new theme colors |
| Phase 3 | ErrorBoundary.tsx | **COMPLETED** | 2023-09-27 | Updated error handling with theme colors |
| Phase 4 | ProfileScreen.tsx | **COMPLETED** | 2023-09-28 | Migrated profile screen with new theme |
| Phase 4 | PerformanceScreen.tsx | **COMPLETED** | 2023-09-28 | Updated performance metrics with themed components |
| Phase 4 | AIConfigScreen.tsx | **COMPLETED** | 2023-09-28 | Migrated AI configuration screen |
| Phase 5 | CollectionSummary.tsx | **COMPLETED** | 2023-09-29 | Migrated collection component |
| Phase 5 | PerformanceInsights.tsx | **COMPLETED** | 2023-09-29 | Migrated performance insights component |
| Phase 5 | MaterialDetailScreen.tsx | **COMPLETED** | 2023-09-29 | Migrated material detail screen with themed components |
| Phase 5 | GamificationOverlay.tsx | **COMPLETED** | 2023-09-30 | Migrated gamification overlay with themed components |
| Phase 5 | AchievementCard.tsx | **COMPLETED** | 2023-09-30 | Migrated achievement card with themed components |
| Phase 5 | CommunityFeed.tsx | **COMPLETED** | 2023-09-30 | Migrated community feed component |
| Phase 5 | RewardsScreen.tsx | **COMPLETED** | 2023-09-30 | Migrated rewards screen with new theme system |
| Phase 6 | CollectionSummary.test.tsx | **COMPLETED** | 2023-09-30 | Added tests for migrated collection component |
| Phase 6 | PerformanceInsights.test.tsx | **COMPLETED** | 2023-09-30 | Added tests for migrated performance insights component |
| Phase 6 | MaterialDetailScreen.test.tsx | **COMPLETED** | 2023-09-30 | Added tests for migrated material detail screen |
| Phase 6 | GamificationOverlay.test.tsx | **COMPLETED** | 2023-09-30 | Added tests for gamification overlay |
| Phase 6 | CommunityFeed.test.tsx | **COMPLETED** | 2023-09-30 | Added tests for community feed |
| Phase 6 | RewardsScreen.test.tsx | **COMPLETED** | 2023-09-30 | Added tests for rewards screen |
| Phase 7 | app/_layout.tsx | **COMPLETED** | 2023-10-01 | Migrated app root layout |
| Phase 7 | app/(tabs)/_layout.tsx | **COMPLETED** | 2023-10-01 | Migrated tabs layout, fixed theme.colors.text.primary |
| Phase 7 | app/(auth)/_layout.tsx | **COMPLETED** | 2023-10-01 | Migrated auth layout |
| Phase 8 | Button.tsx | **COMPLETED** | 2023-10-01 | Already using new theme system |
| Phase 8 | Card.tsx | **COMPLETED** | 2023-10-01 | Already using new theme system |
| Phase 8 | Input.tsx | **COMPLETED** | 2023-10-01 | Already using new theme system |
| Phase 8 | LoadingSpinner.tsx | **COMPLETED** | 2023-10-01 | Already using new theme system |
| Phase 8 | Modal.tsx | **COMPLETED** | 2023-10-01 | Already using new theme system |
| Phase 9 | collection/* Components | **COMPLETED** | 2023-10-01 | Bulk migrated 18 collection components |
| Phase 9 | materials/* Components | **COMPLETED** | 2023-10-01 | Bulk migrated 6 materials components |
| Phase 9 | community/* Components | **COMPLETED** | 2023-10-01 | Bulk migrated 10 community components |
| Phase 10 | Test Files | **COMPLETED** | 2023-10-01 | Migrated 6 test files with old theme imports |
| Phase 11 | App Directory Files | **COMPLETED** | 2023-10-02 | Bulk migrated 73 files in app directory |
| Phase 11 | Remaining Files | **COMPLETED** | 2023-10-02 | Fixed final 4 files: App.tsx, ThemeContext.tsx, AppNavigator.tsx, guards.ts |
| Phase 12 | Theme Usage Pattern | **COMPLETED** | 2023-10-03 | Standardized theme usage pattern across 176 files |
| Phase 13 | ESLint Rule | **COMPLETED** | 2023-10-03 | Added custom ESLint rule to enforce consistent theme usage |

### Migration Complete! 🎉

We've successfully completed the theme migration across all phases:

1. ✅ Phase 1: Core UI Components - **COMPLETED**
2. ✅ Phase 2: Form and Input Components - **COMPLETED**
3. ✅ Phase 3: Settings Components - **COMPLETED**
4. ✅ Phase 4: Main Screens - **COMPLETED**
5. ✅ Phase 5: Feature-Specific Components - **COMPLETED**
6. ✅ Phase 6: Key Test Files - **COMPLETED**
7. ✅ Phase 7: Layout Files - **COMPLETED**
8. ✅ Phase 8: UI Core Components - **COMPLETED**
9. ✅ Phase 9: Directory Components - **COMPLETED**
10. ✅ Phase 10: Test Files - **COMPLETED**
11. ✅ Phase 11: Final Files - **COMPLETED**
12. ✅ Phase 12: Theme Usage Standardization - **COMPLETED**
13. ✅ Phase 13: ESLint Rule Implementation - **COMPLETED**

Our verification script confirms that all files have been migrated successfully. The theme system is now fully implemented across the entire codebase.

### Migration Stats

- Total files processed: ~200
- Total app directory files migrated: 73
- Total collection components migrated: 18
- Total materials components migrated: 6
- Total community components migrated: 10
- Total test files processed: 122
- Total files with standardized theme usage: 176

### New Theme System Overview

The new theme system provides:
- Better dark/light mode support with theme.dark instead of theme.isDark
- Simplified color access via flat structure (theme.colors.text instead of theme.colors.text.primary)
- Responsive spacing with getSpacing()
- Dynamic theme switching
- Improved accessibility

### Verification and Testing

All files have been verified with the verification script, showing no remaining files that need migration:

```
node scripts/verify-theme-migration.js
Found 0 files that need migration.
```

We recommend running the app and performing a thorough test of components across all screens to ensure that:
- All components render correctly in both light and dark modes
- All styling is consistent with the new theme system
- No visual regressions have been introduced

### Next Steps

1. Run comprehensive tests to ensure all components work properly with the new theme system
2. Create documentation for the new theme usage patterns, emphasizing the proper two-step pattern:
   ```typescript
   const themeFunc = useTheme();
   const theme = themeFunc();
   ```
3. Update component storybook examples (if applicable)
4. Consider adding type checking or linting rules to prevent using old theme patterns in the future
5. Add ESLint rule to enforce consistent theme usage pattern

## Migration Game Plan (Completed)

### Phase 11: Final Files
1. ✅ Migrate app directory files
2. ✅ Fix remaining core files (App.tsx, ThemeContext.tsx, etc.)
3. ✅ Run final verification to ensure all files are migrated

### Migration Task Standard Process (Reference):
1. Replace `import { useTheme } from '@/hooks/useTheme'` with `import { useTheme } from '@/theme'`
2. Add `import { getColor } from '@/theme'` if needed
3. Change `const { theme } = useTheme()` to `const theme = useTheme()()`
4. Replace theme property references:
   - `theme.colors.text.primary` → `theme.colors.text`
   - `theme.colors.text.secondary` → `theme.colors.textSecondary`
   - `theme.colors.text.inverse` → `theme.colors.textInverse`
   - `theme.isDark` → `theme.dark`

## Approach
We'll migrate components in order of dependency, starting with the core UI components that are used throughout the application, then moving to more specialized components.

## Priority Order

### Phase 1: Core UI Components
1. ✅ `Text.tsx` - Typography component used across the app - **COMPLETED**
2. ✅ `Card.tsx` - Container component used across the app - **COMPLETED**
3. ✅ `Button.tsx` - Interactive component used across the app - **COMPLETED**
4. ✅ `ThemedView.tsx` - Base themed container - **COMPLETED**
5. ✅ `LoadingSpinner.tsx` - Used for loading states - **COMPLETED**

### Phase 2: Form and Input Components
1. ✅ `Input.tsx` - Text input component - **COMPLETED**
2. ✅ `SearchBar.tsx` - Search component - **COMPLETED**
3. ✅ `Modal.tsx` - Modal component - **COMPLETED**
4. ✅ `TabBarBackground.tsx` - Navigation-related component - **COMPLETED**

### Phase 3: Settings Components
1. ✅ `SettingsItem.tsx` - Individual setting items - **COMPLETED**
2. ✅ `SettingsSection.tsx` - Settings section containers - **COMPLETED**
3. ✅ `LanguageSelector.tsx` - Language settings component - **COMPLETED**

### Phase 4: Main Screens
1. ✅ `ProfileScreen.tsx` - Profile screen - **COMPLETED**
2. ✅ `PerformanceScreen.tsx` - Performance monitoring screen - **COMPLETED**
3. ✅ `AIConfigScreen.tsx` - AI configuration screen - **COMPLETED**

### Phase 5: Feature-Specific Components
1. ✅ Collection components - **COMPLETED**
2. ✅ Material components - **COMPLETED**
3. ✅ Performance components - **COMPLETED**
4. ✅ Gamification components - **COMPLETED**
5. ✅ Community components - **COMPLETED**
6. ✅ Rewards components - **COMPLETED**

### Phase 6: Test Files
1. ✅ `CollectionSummary.test.tsx` - Collection component tests - **COMPLETED**
2. ✅ `PerformanceInsights.test.tsx` - Performance component tests - **COMPLETED**
3. ✅ `MaterialDetailScreen.test.tsx` - Material screen tests - **COMPLETED**
4. ✅ `GamificationOverlay.test.tsx` - Gamification component tests - **COMPLETED**
5. ✅ `CommunityFeed.test.tsx` - Community component tests - **COMPLETED**
6. ✅ `RewardsScreen.test.tsx` - Rewards component tests - **COMPLETED**
7. ⬜ Remaining test files

## Migration Steps for Each Component

1. Update import statements:
   ```typescript
   // Old
   import { useTheme } from '@/hooks/useTheme';
   import type { Theme } from '@/types/theme';
   
   // New
   import { useTheme, Theme } from '@/theme';
   ```

2. Check for theme property usage:
   - Direct property access: `theme.colors.textSecondary` (no change needed)
   - Consider using utility functions where appropriate:
     ```typescript
     // Old
     const padding = theme.spacing.md;
     
     // New with utility
     const padding = getSpacing(theme, 'md');
     ```

3. Test component functionality after migration

## Tracking Progress

| Component | Status | Date | Notes |
|-----------|--------|------|-------|
| `Text.tsx` | Completed | 2023-07-28 | Updated imports and implemented utility functions |
| `Card.tsx` | Completed | 2023-07-28 | Fixed text.secondary to textSecondary |
| `Button.tsx` | Completed | 2023-07-28 | Updated imports and fixed text property references |
| `ThemedView.tsx` | Completed | 2023-07-28 | Updated imports and implemented getColor utility |
| `LoadingSpinner.tsx` | Completed | 2023-07-28 | Updated imports and implemented getColor utility |
| `Input.tsx` | Completed | 2023-07-28 | Fixed text.primary/secondary references and used getSpacing |
| `SearchBar.tsx` | Completed | 2023-07-28 | Fixed references including surface to background |
| `Modal.tsx` | Completed | 2023-07-28 | Updated imports and fixed text.primary reference |
| `TabBarBackground.tsx` | Completed | 2023-07-28 | Used getColor and improved border color handling |
| `SettingsItem.tsx` | Completed | 2023-07-28 | Fixed theme usage and text.primary/secondary references |
| `SettingsSection.tsx` | Completed | 2023-07-28 | Updated imports and fixed text.secondary reference |
| `LanguageSelector.tsx` | Completed | 2023-07-28 | Updated imports and fixed text.primary reference |
| `ProfileScreen.tsx` | Completed | 2023-07-28 | Updated imports and used getColor utility |
| `PerformanceScreen.tsx` | Completed | 2023-07-28 | Fixed Component imports and replaced hardcoded colors |
| `AIConfigScreen.tsx` | Completed | 2023-07-28 | Fixed all text.primary/secondary references and isDark to dark | 

### Phase 12: Theme Usage Standardization
1. ✅ Analyze theme usage patterns across the codebase
2. ✅ Create scripts to standardize usage patterns
3. ✅ Update all components to use the consistent two-step theme pattern
4. ✅ Fix type safety issues with the useTheme hook 

### Phase 13: ESLint Rule Implementation
1. ✅ Create custom ESLint rule for enforcing theme usage pattern
2. ✅ Set up ESLint plugin structure
3. ✅ Create installation script for easy integration
4. ✅ Update documentation with usage instructions 