import { FAQ, FAQItem } from '@/components/community/FAQ';
import { useTheme } from '@/theme';
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

// Sample FAQ data with different categories
const SAMPLE_FAQS: FAQItem[] = [
  {
    id: '1',
    question: 'How do I earn eco points in the app?',
    answer: 'You can earn eco points by recycling items, participating in community clean-ups, completing eco challenges, and making sustainable purchases through our marketplace. Points are awarded based on the environmental impact of each action.',
    category: 'Points & Rewards'
  },
  {
    id: '2',
    question: 'Can I track my environmental impact over time?',
    answer: 'Yes! The dashboard shows your environmental impact metrics including carbon saved, waste diverted from landfills, and total recycled materials. You can view this data over daily, weekly, monthly, and yearly periods.',
    category: 'Features'
  },
  {
    id: '3',
    question: 'How accurate is the carbon footprint calculation?',
    answer: 'Our carbon footprint calculations are based on peer-reviewed scientific research and industry standards. We use data from the EPA, the Carbon Trust, and other reputable sources. While estimations have a margin of error of approximately 5-10%, they provide a valuable benchmark for tracking your progress.',
    category: 'Technical'
  },
  {
    id: '4',
    question: 'Can I connect with other eco-conscious users?',
    answer: 'Absolutely! The Community section allows you to connect with other users, join local groups, and participate in discussions. You can share tips, organize events, and collaborate on environmental initiatives with like-minded individuals.',
    category: 'Community'
  },
  {
    id: '5',
    question: 'How do I redeem my eco points?',
    answer: 'Navigate to the Rewards section to see all available redemption options. These include discounts at partner stores, sustainable product offers, and donations to environmental organizations. Simply select the reward you want and follow the redemption instructions.',
    category: 'Points & Rewards'
  },
  {
    id: '6',
    question: 'Is my personal data secure?',
    answer: 'We take data security very seriously. All personal information is encrypted using industry-standard protocols, and we never share your data with third parties without your explicit consent. You can review our detailed privacy policy in the app settings.',
    category: 'Technical'
  },
  {
    id: '7',
    question: 'How can I participate in local cleanup events?',
    answer: 'Local cleanup events are listed in the Events section of the Community tab. You can browse upcoming events, register to participate, and even create your own events. The app will notify you about events in your area based on your location settings.',
    category: 'Community'
  },
  {
    id: '8',
    question: 'What happens if I scan an item that is not recyclable?',
    answer: 'If you scan a non-recyclable item, the app will inform you and provide alternatives where possible. We will suggest proper disposal methods and, in some cases, offer sustainable replacements that you can purchase through our marketplace.',
    category: 'Features'
  },
  {
    id: '9',
    question: 'Can I use the app offline?',
    answer: 'Most features require an internet connection, but some basic functionalities like viewing your eco stats and previously scanned items work offline. The app will sync your data once you are back online.',
    category: 'Technical'
  },
  {
    id: '10',
    question: 'How can I suggest new features for the app?',
    answer: 'We love user feedback! You can suggest new features through the Feedback form in the app settings. Our product team reviews all suggestions, and many of our updates come directly from user ideas.',
    category: 'Community'
  }
];

export function FAQDemoScreen() {
  const theme = useTheme()()();
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FAQ 
        faqs={SAMPLE_FAQS}
        title="EcoCart Help Center"
        showSearch={true}
        showCategories={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 