import { RouteErrorScreen } from '@/components/RouteErrorScreen';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ErrorScreen() {
  const router = useRouter();
  const { error } = useLocalSearchParams<{ error: string }>();

  return (
    <RouteErrorScreen
      error={new Error(error || 'An unexpected error occurred')}
      retry={() => router.back()}
    />
  );
} 