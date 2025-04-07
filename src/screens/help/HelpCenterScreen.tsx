import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useState } from 'react';
import {
    AccessibilityInfo,
    KeyboardAvoidingView,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FAQ, FAQItem } from '../../components/community/FAQ';
import { useTheme } from '../../contexts/ThemeContext';

// Platform-specific help content
const HELP_CATEGORIES = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: 'rocket-launch',
    description: 'Learn the basics of using EcoCart',
    platformSpecific: {
      ios: 'https://ecocart.app/help/ios/getting-started',
      android: 'https://ecocart.app/help/android/getting-started',
      web: 'https://ecocart.app/help/web/getting-started'
    }
  },
  {
    id: 'collection',
    title: 'Plastic Collection',
    icon: 'recycle',
    description: 'How to schedule and manage your collections',
    platformSpecific: {
      ios: 'https://ecocart.app/help/ios/collection',
      android: 'https://ecocart.app/help/android/collection',
      web: 'https://ecocart.app/help/web/collection'
    }
  },
  {
    id: 'credits',
    title: 'Eco Credits',
    icon: 'star',
    description: 'Understanding and redeeming your eco credits',
    platformSpecific: {
      ios: 'https://ecocart.app/help/ios/credits',
      android: 'https://ecocart.app/help/android/credits',
      web: 'https://ecocart.app/help/web/credits'
    }
  },
  {
    id: 'account',
    title: 'Account & Settings',
    icon: 'account-cog',
    description: 'Manage your account and app preferences',
    platformSpecific: {
      ios: 'https://ecocart.app/help/ios/account',
      android: 'https://ecocart.app/help/android/account',
      web: 'https://ecocart.app/help/web/account'
    }
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: 'wrench',
    description: 'Common issues and how to resolve them',
    platformSpecific: {
      ios: 'https://ecocart.app/help/ios/troubleshooting',
      android: 'https://ecocart.app/help/android/troubleshooting',
      web: 'https://ecocart.app/help/web/troubleshooting'
    }
  }
];

// Platform-specific FAQs
const PLATFORM_FAQS: Record<string, FAQItem[]> = {
  ios: [
    {
      id: 'ios-1',
      question: 'How do I enable notifications on iOS?',
      answer: 'To enable notifications, go to Settings > Notifications > EcoCart and toggle "Allow Notifications". You can also customize which types of notifications you want to receive.',
      category: 'iOS'
    },
    {
      id: 'ios-2',
      question: 'How do I use Face ID with EcoCart?',
      answer: 'To enable Face ID, go to Settings > Security > Enable Face ID. This will allow you to quickly access your account without entering your password each time.',
      category: 'iOS'
    },
    {
      id: 'ios-3',
      question: 'How do I add EcoCart to my Apple Wallet?',
      answer: 'To add EcoCart to your Apple Wallet, go to your profile > Wallet > Add to Apple Wallet. This will allow you to quickly access your eco credits and collection schedule.',
      category: 'iOS'
    }
  ],
  android: [
    {
      id: 'android-1',
      question: 'How do I enable notifications on Android?',
      answer: 'To enable notifications, go to Settings > Apps > EcoCart > Notifications and toggle "Show notifications". You can also customize which types of notifications you want to receive.',
      category: 'Android'
    },
    {
      id: 'android-2',
      question: 'How do I use fingerprint authentication with EcoCart?',
      answer: 'To enable fingerprint authentication, go to Settings > Security > Enable fingerprint. This will allow you to quickly access your account without entering your password each time.',
      category: 'Android'
    },
    {
      id: 'android-3',
      question: 'How do I add EcoCart to my Google Pay?',
      answer: 'To add EcoCart to your Google Pay, go to your profile > Payment > Add to Google Pay. This will allow you to quickly access your eco credits and collection schedule.',
      category: 'Android'
    }
  ],
  web: [
    {
      id: 'web-1',
      question: 'How do I enable browser notifications?',
      answer: 'To enable browser notifications, click on the notification icon in your browser\'s address bar when prompted by EcoCart. You can also go to Settings > Notifications to customize your preferences.',
      category: 'Web'
    },
    {
      id: 'web-2',
      question: 'How do I use EcoCart on multiple devices?',
      answer: 'Your EcoCart account is synchronized across all your devices. Simply log in with the same credentials on each device, and your data will be automatically synced.',
      category: 'Web'
    },
    {
      id: 'web-3',
      question: 'How do I save EcoCart for offline use?',
      answer: 'To save EcoCart for offline use, you can add it to your home screen. In Chrome, click the menu (three dots) > More tools > Add to home screen. This will create a shortcut that works even when offline.',
      category: 'Web'
    }
  ]
};

export const HelpCenterScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web'>(
    Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web'
  );
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);

  // Check if screen reader is enabled
  useEffect(() => {
    const checkScreenReader = async () => {
      const isEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      setIsScreenReaderEnabled(isEnabled);
    };
    
    checkScreenReader();
    
    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsScreenReaderEnabled
    );
    
    return () => {
      subscription.remove();
    };
  }, []);

  // Combine general FAQs with platform-specific FAQs
  const allFAQs = [
    ...PLATFORM_FAQS[platform] || [],
    // Add more general FAQs here
  ];

  const handleCategoryPress = useCallback((categoryId: string) => {
    if (Platform.OS === 'ios') {
      Haptics.selectionAsync();
    }
    setSelectedCategory(categoryId);
  }, []);

  const handleExternalLink = useCallback((url: string) => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Linking.openURL(url);
  }, []);

  const renderCategoryCard = useCallback((category: typeof HELP_CATEGORIES[0]) => (
    <TouchableOpacity
      key={category.id}
      style={[styles.categoryCard, { backgroundColor: theme.colors.card }]}
      onPress={() => handleCategoryPress(category.id)}
      accessible={true}
      accessibilityLabel={`${category.title} help category`}
      accessibilityHint={`Opens ${category.title} help content`}
      accessibilityRole="button"
    >
      <View style={styles.categoryIconContainer}>
        <MaterialCommunityIcons
          name={category.icon as any}
          size={32}
          color={theme.colors.primary}
        />
      </View>
      <View style={styles.categoryContent}>
        <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>
          {category.title}
        </Text>
        <Text style={[styles.categoryDescription, { color: theme.colors.text }]}>
          {category.description}
        </Text>
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={24}
        color={theme.colors.text}
      />
    </TouchableOpacity>
  ), [theme, handleCategoryPress]);

  const renderContactSupport = useCallback(() => (
    <View 
      style={[styles.contactSupport, { backgroundColor: theme.colors.card }]}
      accessible={true}
      accessibilityLabel="Contact support section"
      accessibilityRole="none"
    >
      <Text style={[styles.contactTitle, { color: theme.colors.text }]}>
        Need more help?
      </Text>
      <Text style={[styles.contactDescription, { color: theme.colors.text }]}>
        Our support team is available 24/7 to assist you with any questions or issues.
      </Text>
      <TouchableOpacity
        style={[styles.contactButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('SupportRequest')}
        accessible={true}
        accessibilityLabel="Contact support button"
        accessibilityHint="Opens the support request form"
        accessibilityRole="button"
      >
        <Text style={styles.contactButtonText}>Contact Support</Text>
      </TouchableOpacity>
    </View>
  ), [theme, navigation]);

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      accessible={true}
      accessibilityRole="none"
      accessibilityLabel="Help Center"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        testID="keyboard-avoiding-view"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Help Center
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.text }]}>
            Find answers to common questions and get support
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={24}
            color={theme.colors.text}
            style={styles.searchIcon}
          />
          <TextInput
            style={[
              styles.searchInput,
              {
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }
            ]}
            placeholder="Search for help..."
            placeholderTextColor={theme.colors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessible={true}
            accessibilityLabel="Search help articles"
            accessibilityHint="Enter keywords to search for help articles"
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          accessible={true}
          accessibilityRole="none"
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Help Categories
          </Text>
          
          {HELP_CATEGORIES.map(renderCategoryCard)}
          
          <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 24 }]}>
            Frequently Asked Questions
          </Text>
          
          <FAQ
            initialCategory={selectedCategory || undefined}
            showSearch={false}
            showCategories={true}
          />
          
          {renderContactSupport()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  contactSupport: {
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 32,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  contactDescription: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.7,
  },
  contactButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 