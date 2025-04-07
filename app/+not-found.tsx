import { RouteErrorScreen } from '@/components/RouteErrorScreen';
import { useRouter } from 'expo-router';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <RouteErrorScreen
      error={new Error('Page not found')}
      retry={() => router.back()}
    />
  );
} 