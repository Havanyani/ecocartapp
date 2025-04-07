export interface Slide {
  id: string;
  title: string;
  description: string;
  image: string;
  color: string;
}

export const slides: Slide[] = [
  {
    id: '1',
    title: 'Welcome to EcoCart',
    description: 'Your partner in sustainable shopping and recycling. Make a positive impact on the environment with every purchase.',
    image: 'https://picsum.photos/id/10/500/500',
    color: '#4CAF50', // Green
  },
  {
    id: '2',
    title: 'Track Your Impact',
    description: 'Monitor your recycling efforts and see the environmental impact you\'re making in real-time.',
    image: 'https://picsum.photos/id/20/500/500',
    color: '#2196F3', // Blue
  },
  {
    id: '3',
    title: 'Earn & Redeem',
    description: 'Earn eco-credits for your recycling efforts and redeem them for discounts on eco-friendly products.',
    image: 'https://picsum.photos/id/30/500/500',
    color: '#FFC107', // Amber
  },
  {
    id: '4',
    title: 'Join Our Community',
    description: 'Connect with like-minded individuals, participate in community events, and make a bigger impact together.',
    image: 'https://picsum.photos/id/40/500/500',
    color: '#9C27B0', // Purple
  },
]; 