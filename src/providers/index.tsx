import { ThemeProvider } from '../theme';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {/* Other providers */}
      {children}
    </ThemeProvider>
  );
} 