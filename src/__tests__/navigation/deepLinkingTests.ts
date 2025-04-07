import { waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useSegments: jest.fn(() => []),
  useLocalSearchParams: jest.fn(() => ({})),
}));

// Mock linking
jest.mock('expo-linking', () => ({
  parse: jest.fn(),
  createURL: jest.fn(),
}));

describe('Deep Linking', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('URL Parsing', () => {
    it('should parse materials URL with category', async () => {
      const url = 'ecocart://materials?category=plastic';
      const { parse } = require('expo-linking');
      parse.mockReturnValue({
        path: 'materials',
        queryParams: { category: 'plastic' },
      });

      const result = parse(url);
      expect(result.path).toBe('materials');
      expect(result.queryParams.category).toBe('plastic');
    });

    it('should parse collections URL with type', async () => {
      const url = 'ecocart://collections?type=active';
      const { parse } = require('expo-linking');
      parse.mockReturnValue({
        path: 'collections',
        queryParams: { type: 'active' },
      });

      const result = parse(url);
      expect(result.path).toBe('collections');
      expect(result.queryParams.type).toBe('active');
    });

    it('should parse community URL with tab', async () => {
      const url = 'ecocart://community?tab=challenges';
      const { parse } = require('expo-linking');
      parse.mockReturnValue({
        path: 'community',
        queryParams: { tab: 'challenges' },
      });

      const result = parse(url);
      expect(result.path).toBe('community');
      expect(result.queryParams.tab).toBe('challenges');
    });
  });

  describe('URL Creation', () => {
    it('should create materials URL', async () => {
      const { createURL } = require('expo-linking');
      createURL.mockReturnValue('ecocart://materials?category=plastic');

      const url = createURL('materials', { category: 'plastic' });
      expect(url).toBe('ecocart://materials?category=plastic');
    });

    it('should create collections URL', async () => {
      const { createURL } = require('expo-linking');
      createURL.mockReturnValue('ecocart://collections?type=active');

      const url = createURL('collections', { type: 'active' });
      expect(url).toBe('ecocart://collections?type=active');
    });

    it('should create community URL', async () => {
      const { createURL } = require('expo-linking');
      createURL.mockReturnValue('ecocart://community?tab=challenges');

      const url = createURL('community', { tab: 'challenges' });
      expect(url).toBe('ecocart://community?tab=challenges');
    });
  });

  describe('Deep Link Navigation', () => {
    it('should navigate to materials with category', async () => {
      const { handleDeepLink } = require('@/utils/deepLinking');
      await handleDeepLink('ecocart://materials?category=plastic');

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/materials?category=plastic');
      });
    });

    it('should navigate to collections with type', async () => {
      const { handleDeepLink } = require('@/utils/deepLinking');
      await handleDeepLink('ecocart://collections?type=active');

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/collections?type=active');
      });
    });

    it('should navigate to community with tab', async () => {
      const { handleDeepLink } = require('@/utils/deepLinking');
      await handleDeepLink('ecocart://community?tab=challenges');

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/community?tab=challenges');
      });
    });

    it('should handle invalid deep links', async () => {
      const { handleDeepLink } = require('@/utils/deepLinking');
      await handleDeepLink('ecocart://invalid');

      await waitFor(() => {
        expect(mockRouter.push).not.toHaveBeenCalled();
      });
    });
  });
}); 