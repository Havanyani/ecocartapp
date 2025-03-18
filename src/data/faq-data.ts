/**
 * FAQ data for EcoCart
 * This data is used by the AI Assistant to provide answers to common questions
 */

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const faqCategories = [
  'Account',
  'Shopping',
  'Recycling',
  'Carbon Offsets',
  'App Features',
  'Payments',
  'Sustainability',
  'Rewards'
];

/**
 * Frequently asked questions about EcoCart and sustainability
 */
export const faqData: FAQItem[] = [
  {
    id: 'account-1',
    question: 'How do I create an EcoCart account?',
    answer: 'Creating an EcoCart account is easy! Download the EcoCart app from the App Store or Google Play, then open the app and tap "Sign Up". You can create an account using your email, Google account, or Apple ID. Follow the on-screen instructions to complete your profile.',
    category: 'Account'
  },
  {
    id: 'account-2',
    question: 'How do I reset my password?',
    answer: 'To reset your password, go to the login screen and tap "Forgot Password". Enter the email associated with your account, and we\'ll send you a password reset link. Click the link in the email and follow the instructions to create a new password.',
    category: 'Account'
  },
  {
    id: 'account-3',
    question: 'Can I use EcoCart without creating an account?',
    answer: 'While some basic features are available without an account, creating a free EcoCart account allows you to track your environmental impact, earn rewards, and access personalized sustainability recommendations. We recommend creating an account for the full EcoCart experience.',
    category: 'Account'
  },
  {
    id: 'shopping-1',
    question: 'How does EcoCart help me shop sustainably?',
    answer: 'EcoCart helps you shop sustainably by providing sustainability ratings for products, suggesting eco-friendly alternatives, and tracking the environmental impact of your purchases. We analyze factors like carbon footprint, packaging, manufacturing practices, and company policies to help you make informed choices.',
    category: 'Shopping'
  },
  {
    id: 'shopping-2',
    question: 'What is the product sustainability score?',
    answer: 'The EcoCart sustainability score rates products on a scale of 1-100 based on multiple factors including carbon footprint, resource usage, packaging, ethical labor practices, and company sustainability initiatives. Higher scores indicate more sustainable products. Tap on any score to see a detailed breakdown of the rating.',
    category: 'Shopping'
  },
  {
    id: 'shopping-3',
    question: 'How does EcoCart find sustainable products?',
    answer: 'EcoCart uses a combination of product data analysis, third-party certifications, manufacturer information, and proprietary algorithms to identify sustainable products. We continuously update our database as new information becomes available and sustainability standards evolve.',
    category: 'Shopping'
  },
  {
    id: 'recycling-1',
    question: 'How does the recycling feature work?',
    answer: 'EcoCart\'s recycling feature helps you properly recycle items by scanning product barcodes or taking photos of items. The app identifies the material and provides specific recycling instructions for your location. You can also find nearby recycling centers and schedule pickups for special items in participating areas.',
    category: 'Recycling'
  },
  {
    id: 'recycling-2',
    question: 'How accurate is the recycling information?',
    answer: 'Our recycling information is regularly updated and verified through partnerships with local waste management authorities, recycling centers, and environmental organizations. While we strive for accuracy, recycling guidelines can vary even within regions. Always check your local municipality\'s website for the most specific guidelines.',
    category: 'Recycling'
  },
  {
    id: 'recycling-3',
    question: 'Can I schedule recycling pickups through the app?',
    answer: 'Yes, in participating areas, you can schedule special recycling pickups through the app. Go to the Recycling section, tap "Schedule Pickup", and follow the instructions. This service is available for items like electronics, batteries, and other hard-to-recycle materials. Availability and fees vary by location.',
    category: 'Recycling'
  },
  {
    id: 'carbon-1',
    question: 'What are carbon offsets and how do they work?',
    answer: 'Carbon offsets are investments in environmental projects that reduce carbon emissions to compensate for emissions produced elsewhere. When you purchase carbon offsets through EcoCart, your money goes to verified projects like renewable energy, reforestation, and methane capture. These projects are certified by third-party organizations to ensure they deliver the promised environmental benefits.',
    category: 'Carbon Offsets'
  },
  {
    id: 'carbon-2',
    question: 'How does EcoCart calculate my carbon footprint?',
    answer: 'EcoCart calculates your carbon footprint based on your shopping habits, transportation choices, and lifestyle factors you input into the app. For purchases, we analyze product data including materials, manufacturing processes, and shipping distances. Our calculations follow established carbon accounting methodologies and are regularly updated as new research becomes available.',
    category: 'Carbon Offsets'
  },
  {
    id: 'carbon-3',
    question: 'Are carbon offsets tax-deductible?',
    answer: 'In many countries, carbon offset purchases may be tax-deductible as charitable contributions if they go to qualifying nonprofit organizations. However, tax laws vary by country and region. EcoCart provides receipts for all carbon offset purchases, but we recommend consulting with a tax professional for advice specific to your situation.',
    category: 'Carbon Offsets'
  },
  {
    id: 'features-1',
    question: 'What is the Impact Dashboard?',
    answer: 'The Impact Dashboard is your personal sustainability hub that shows the positive environmental impact of your actions. It tracks metrics like carbon emissions avoided, plastic waste reduced, water saved, and trees protected through your sustainable shopping choices and carbon offset purchases. You can share your impact on social media and set goals for improvement.',
    category: 'App Features'
  },
  {
    id: 'features-2',
    question: 'How do EcoCart Rewards work?',
    answer: 'EcoCart Rewards is our points-based loyalty program. You earn points for sustainable actions like choosing eco-friendly products, recycling through the app, and completing sustainability challenges. These points can be redeemed for discounts on sustainable products, carbon offset purchases, or donations to environmental nonprofits.',
    category: 'App Features'
  },
  {
    id: 'features-3',
    question: 'Is my data secure in the EcoCart app?',
    answer: 'Yes, EcoCart takes data security and privacy seriously. We use industry-standard encryption to protect your personal information and payment details. We do not sell your personal data to third parties. You can review our complete Privacy Policy in the app settings or on our website to learn more about how we handle your data.',
    category: 'App Features'
  },
  {
    id: 'payments-1',
    question: 'What payment methods does EcoCart accept?',
    answer: 'EcoCart accepts major credit and debit cards (Visa, Mastercard, American Express, Discover), PayPal, Apple Pay, and Google Pay. In some regions, we also support local payment methods. All payment information is securely encrypted and processed through trusted payment providers.',
    category: 'Payments'
  },
  {
    id: 'payments-2',
    question: 'How do I update my payment information?',
    answer: 'To update your payment information, go to Settings > Payment Methods in the app. You can add new payment methods, set a default method, or remove existing methods. For subscription changes, go to Settings > Subscription where you can also update the payment method used for your subscription.',
    category: 'Payments'
  },
  {
    id: 'sustainability-1',
    question: 'How does EcoCart verify sustainable products?',
    answer: 'EcoCart verifies sustainable products through a multi-step process: 1) Analyzing product materials and manufacturing data, 2) Checking for recognized sustainability certifications (like ENERGY STAR, Fair Trade, or Forest Stewardship Council), 3) Reviewing company sustainability practices and commitments, and 4) Considering third-party ratings and consumer feedback. Our sustainability criteria are regularly updated based on the latest environmental research.',
    category: 'Sustainability'
  },
  {
    id: 'sustainability-2',
    question: 'What sustainability certifications does EcoCart recognize?',
    answer: 'EcoCart recognizes many reputable sustainability certifications including: Energy Star, EPEAT, USDA Organic, Fair Trade Certified, Rainforest Alliance, Forest Stewardship Council (FSC), B Corp, LEED, Cradle to Cradle, Global Organic Textile Standard (GOTS), Leaping Bunny, Green Seal, and many more. We regularly evaluate and update our list of recognized certifications.',
    category: 'Sustainability'
  },
  {
    id: 'rewards-1',
    question: 'How do I earn EcoCart Rewards points?',
    answer: 'You can earn EcoCart Rewards points through various actions: 1) Purchasing sustainable products (1 point per $1 spent), 2) Recycling items using the app scanner (5-25 points depending on the item), 3) Completing daily and weekly sustainability challenges (10-50 points), 4) Referring friends (100 points per friend who joins), and 5) Participating in community cleanup events (100+ points). Points appear in your account immediately or within 24 hours of verified actions.',
    category: 'Rewards'
  },
  {
    id: 'rewards-2',
    question: 'What can I redeem EcoCart Rewards points for?',
    answer: 'EcoCart Rewards points can be redeemed for: 1) Discounts on sustainable products from partner brands (typically 100 points = $1 off), 2) Carbon offset purchases (500 points = 1 ton of carbon offset), 3) Donations to environmental nonprofits (starting at 200 points), 4) Exclusive sustainable product offerings, and 5) Premium app features. Go to the Rewards section in the app to see all current redemption options.',
    category: 'Rewards'
  }
];

/**
 * Get frequently asked questions by category
 * @param category The category to filter by
 * @returns FAQItems for the specified category
 */
export function getFAQsByCategory(category: string): FAQItem[] {
  return faqData.filter(faq => faq.category === category);
}

/**
 * Search FAQs by query string
 * @param query The search query
 * @returns FAQItems matching the query
 */
export function searchFAQs(query: string): FAQItem[] {
  const lowerCaseQuery = query.toLowerCase();
  return faqData.filter(
    faq => 
      faq.question.toLowerCase().includes(lowerCaseQuery) || 
      faq.answer.toLowerCase().includes(lowerCaseQuery)
  );
}

export default faqData; 