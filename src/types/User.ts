export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'admin' | 'delivery';
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    darkMode: boolean;
    language: string;
  };
  addresses: Array<{
    id: string;
    type: 'home' | 'work' | 'other';
    street: string;
    city: string;
    state: string;
    zipCode: string;
    isDefault: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  stats: {
    totalOrders: number;
    totalSpent: number;
    plasticCollected: number;
    creditsEarned: number;
    creditsUsed: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'order' | 'collection' | 'credit';
    description: string;
    timestamp: string;
  }>;
}

export interface UserSettings {
  notifications: {
    orderUpdates: boolean;
    collectionReminders: boolean;
    promotions: boolean;
    news: boolean;
  };
  privacy: {
    showProfile: boolean;
    showActivity: boolean;
    showStats: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    currency: string;
    timezone: string;
  };
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface UserRegistrationData extends UserCredentials {
  name: string;
  phone?: string;
  acceptTerms: boolean;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  preferences?: Partial<User['preferences']>;
  addresses?: User['addresses'];
} 