import { AccessibilityInfo, AccessibilityRole } from 'react-native';

interface AccessibilityProps {
  accessible: boolean;
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
}

interface HeadingProps {
  accessible: boolean;
  accessibilityRole: 'header';
  accessibilityLevel: number;
}

interface TabProps {
  accessible: boolean;
  accessibilityLabel: string;
  accessibilityRole: 'tab';
  accessibilityState: { selected: boolean };
}

export class AccessibilityHelper {
  static announceScreenReader(message: string): void {
    AccessibilityInfo.announceForAccessibility(message);
  }

  static getAccessibilityProps(
    label: string,
    hint: string = '',
    role: AccessibilityRole = 'button'
  ): AccessibilityProps {
    return {
      accessible: true,
      accessibilityLabel: label,
      accessibilityHint: hint,
      accessibilityRole: role,
    };
  }

  static getHeadingProps(level: number = 1): HeadingProps {
    return {
      accessible: true,
      accessibilityRole: 'header',
      accessibilityLevel: level,
    };
  }

  static getTabProps(label: string, isSelected: boolean): TabProps {
    return {
      accessible: true,
      accessibilityLabel: label,
      accessibilityRole: 'tab',
      accessibilityState: { selected: isSelected },
    };
  }
} 