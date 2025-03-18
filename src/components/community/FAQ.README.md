# FAQ Component

The FAQ component provides a clean and interactive interface for displaying frequently asked questions with collapsible answers. It supports categorization, searching, and various customization options.

## Features

- **Expandable Q&A Format**: Users can tap on questions to reveal or hide answers
- **Category Filtering**: Filter FAQs by predefined categories
- **Search Functionality**: Search for specific keywords within questions and answers
- **Responsive Design**: Works across different screen sizes
- **Accessibility Support**: Includes appropriate accessibility labels and hints
- **Theming Support**: Adapts to the app's theme colors

## Installation

The FAQ component is included in the EcoCart app and requires no additional installation.

## Usage

```tsx
import { FAQ, FAQItem } from '@/components/community/FAQ';

// Example FAQ data
const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'How do I earn eco points?',
    answer: 'You can earn eco points by recycling items, participating in community clean-ups, and making sustainable purchases through our marketplace.',
    category: 'Points & Rewards'
  },
  {
    id: '2',
    question: 'Can I track my environmental impact?',
    answer: 'Yes! The dashboard shows your environmental impact metrics including carbon saved, waste diverted from landfills, and total recycled materials.',
    category: 'Features'
  },
  // Add more FAQs as needed
];

// Basic usage
function FAQScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FAQ faqs={faqData} />
    </SafeAreaView>
  );
}

// Customized usage
function CustomFAQScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FAQ 
        faqs={faqData} 
        title="Recycling Help Center"
        showSearch={true}
        showCategories={true}
      />
    </SafeAreaView>
  );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `faqs` | `FAQItem[]` | Yes | - | Array of FAQ items to display |
| `showSearch` | `boolean` | No | `true` | Whether to show the search input |
| `showCategories` | `boolean` | No | `true` | Whether to show category filters |
| `title` | `string` | No | 'Frequently Asked Questions' | The title displayed at the top of the component |

## Types

```typescript
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface FAQProps {
  faqs: FAQItem[];
  showSearch?: boolean;
  showCategories?: boolean;
  title?: string;
}
```

## Styling

The FAQ component uses the app's theme for colors and styling. It automatically adapts to light and dark mode through the `useTheme` hook.

## Accessibility

The FAQ component includes the following accessibility features:
- Proper accessibility labels for questions
- Accessibility hints that describe whether pressing will expand or collapse the answer
- Appropriate role assignments for interactive elements

## Best Practices

- Group related FAQs under the same category for better organization
- Keep questions concise and specific
- Provide comprehensive yet clear answers
- Use plain language and avoid jargon
- Update FAQs regularly based on user feedback and common support questions

## Related Components

- `CommunityForum` - For more complex community discussions
- `HelpCenter` - A broader help interface that might include FAQs along with other support resources 