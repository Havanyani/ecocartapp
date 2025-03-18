import { AccessibilityInfo } from 'react-native';

export class AccessibilityTestUtils {
  static async checkAccessibilityLabels(element: any): Promise<string[]> {
    const missingLabels: string[] = [];
    
    const checkElement = (el: any) => {
      if (el.props) {
        if (el.props.accessible && !el.props.accessibilityLabel) {
          missingLabels.push(`${el.type} is missing accessibilityLabel`);
        }
        
        React.Children.forEach(el.props.children, checkElement);
      }
    };
    
    checkElement(element);
    return missingLabels;
  }

  static async verifyScreenReaderFocus(elementId: string): Promise<boolean> {
    return new Promise((resolve) => {
      AccessibilityInfo.isScreenReaderEnabled().then((enabled) => {
        if (!enabled) {
          resolve(true);
          return;
        }

        AccessibilityInfo.addAccessibilityFocusChangeListener(
          (focusedId) => {
            resolve(focusedId === elementId);
          }
        );
      });
    });
  }

  static getAccessibilityTree(element: any): object {
    const buildTree = (el: any): object => {
      if (!el) return {};

      const node: any = {
        type: el.type,
        accessibilityRole: el.props?.accessibilityRole,
        accessibilityLabel: el.props?.accessibilityLabel,
        children: [],
      };

      if (el.props?.children) {
        React.Children.forEach(el.props.children, (child: any) => {
          node.children.push(buildTree(child));
        });
      }

      return node;
    };

    return buildTree(element);
  }
} 