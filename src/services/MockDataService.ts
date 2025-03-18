// Define interfaces for mock data
export interface EnvironmentalImpact {
  trees: number;
  bottles: number;
  water: number;
}

export interface Collection {
  id: string;
  date: Date;
  weight?: number;
  credits?: number;
  status: 'completed' | 'pending' | 'cancelled';
  impact?: EnvironmentalImpact;
  scheduledTime?: string;
}

export interface UserStats {
  plasticCollected: number;
  totalCredits: number;
  level: string;
  points: number;
  nextLevelPoints: number;
}

export interface UserPreferences {
  pushNotifications: boolean;
  emailNotifications: boolean;
  collectionReminders: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  stats: UserStats;
  preferences: UserPreferences;
}

// Mock data
export const mockCollections: Collection[] = [
  {
    id: '1',
    date: new Date('2024-03-15'),
    weight: 2.5,
    credits: 12.50,
    status: 'completed',
    impact: {
      trees: 0.3,
      bottles: 62,
      water: 42.5,
    }
  },
  {
    id: '2',
    date: new Date('2024-03-22'),
    status: 'pending',
    scheduledTime: '09:00-12:00',
  },
  // Additional mock collections
  {
    id: '3',
    date: new Date('2024-03-28'),
    weight: 1.8,
    credits: 9.00,
    status: 'completed',
    impact: {
      trees: 0.2,
      bottles: 45,
      water: 30.6,
    }
  },
  {
    id: '4',
    date: new Date('2024-04-05'),
    status: 'pending',
    scheduledTime: '14:00-16:00',
  },
  {
    id: '5',
    date: new Date('2024-02-28'),
    weight: 3.2,
    credits: 16.00,
    status: 'completed',
    impact: {
      trees: 0.4,
      bottles: 80,
      water: 54.4,
    }
  }
];

export const mockUserProfile: UserProfile = {
  id: 'user123',
  name: 'John Doe',
  email: 'john.doe@example.com',
  stats: {
    plasticCollected: 52.4,
    totalCredits: 262,
    level: 'Silver',
    points: 750,
    nextLevelPoints: 1000,
  },
  preferences: {
    pushNotifications: true,
    emailNotifications: true,
    collectionReminders: true,
  }
};

export const mockWeeklyData: number[] = [3.2, 2.8, 4.1, 3.5];

// Materials data for the app
export interface Material {
  id: string;
  name: string;
  type: string;
  recyclable: boolean;
  creditValue: number;
  description: string;
  imageUrl: string;
  environmentalImpact: string;
}

export const mockMaterials: Material[] = [
  {
    id: 'pet1',
    name: 'PET Bottles',
    type: 'Plastic',
    recyclable: true,
    creditValue: 0.05,
    description: 'Clear plastic bottles used for beverages.',
    imageUrl: 'https://example.com/images/pet-bottle.jpg',
    environmentalImpact: 'High - Takes 450 years to decompose naturally.'
  },
  {
    id: 'hdpe2',
    name: 'HDPE Containers',
    type: 'Plastic',
    recyclable: true,
    creditValue: 0.04,
    description: 'Milk jugs, detergent bottles, and other rigid containers.',
    imageUrl: 'https://example.com/images/hdpe-container.jpg',
    environmentalImpact: 'High - Takes 100+ years to decompose naturally.'
  },
  {
    id: 'ldpe4',
    name: 'LDPE Bags',
    type: 'Plastic',
    recyclable: true,
    creditValue: 0.02,
    description: 'Plastic bags, shrink wrap, and other flexible packaging.',
    imageUrl: 'https://example.com/images/ldpe-bag.jpg',
    environmentalImpact: 'Medium - Takes 20-1000 years to decompose naturally.'
  },
  {
    id: 'pp5',
    name: 'PP Containers',
    type: 'Plastic',
    recyclable: true,
    creditValue: 0.03,
    description: 'Yogurt cups, medicine bottles, bottle caps.',
    imageUrl: 'https://example.com/images/pp-container.jpg',
    environmentalImpact: 'Medium - Takes 20-30 years to decompose naturally.'
  },
  {
    id: 'ps6',
    name: 'PS Foam',
    type: 'Plastic',
    recyclable: false,
    creditValue: 0.01,
    description: 'Styrofoam cups, food containers, packing peanuts.',
    imageUrl: 'https://example.com/images/ps-foam.jpg',
    environmentalImpact: 'Very High - Takes 500+ years to decompose and easily fragments into microplastics.'
  }
];

// Collection points data
export interface CollectionPoint {
  id: string;
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  operatingHours: string;
  acceptedMaterials: string[];
  contactPhone: string;
}

export const mockCollectionPoints: CollectionPoint[] = [
  {
    id: 'cp1',
    name: 'Downtown Recycling Center',
    address: '123 Main St, Anytown, USA',
    coordinates: {
      latitude: 40.7128,
      longitude: -74.0060
    },
    operatingHours: 'Mon-Fri: 8am-6pm, Sat: 9am-4pm',
    acceptedMaterials: ['pet1', 'hdpe2', 'ldpe4', 'pp5'],
    contactPhone: '555-123-4567'
  },
  {
    id: 'cp2',
    name: 'Northside Collection Point',
    address: '456 Oak Ave, Anytown, USA',
    coordinates: {
      latitude: 40.7328,
      longitude: -74.0260
    },
    operatingHours: 'Mon-Sat: 7am-7pm',
    acceptedMaterials: ['pet1', 'hdpe2', 'pp5'],
    contactPhone: '555-234-5678'
  },
  {
    id: 'cp3',
    name: 'Eastside Drop-off Center',
    address: '789 Pine Rd, Anytown, USA',
    coordinates: {
      latitude: 40.7228,
      longitude: -73.9860
    },
    operatingHours: '24/7 Drop-off',
    acceptedMaterials: ['pet1', 'hdpe2', 'ldpe4', 'pp5', 'ps6'],
    contactPhone: '555-345-6789'
  }
];

// Analytics mock data
export interface DailyCollection {
  date: string;
  count: number;
  weight: number;
}

export interface MaterialBreakdown {
  materialId: string;
  percentage: number;
  weight: number;
}

export interface UserActivity {
  date: string;
  activeUsers: number;
  newUsers: number;
}

export interface AnalyticsData {
  dailyCollections: DailyCollection[];
  materialBreakdown: MaterialBreakdown[];
  userActivity: UserActivity[];
}

export const mockAnalyticsData: AnalyticsData = {
  dailyCollections: [
    { date: '2024-03-01', count: 24, weight: 76.5 },
    { date: '2024-03-02', count: 18, weight: 62.3 },
    { date: '2024-03-03', count: 12, weight: 38.9 },
    { date: '2024-03-04', count: 28, weight: 84.2 },
    { date: '2024-03-05', count: 32, weight: 97.8 },
    { date: '2024-03-06', count: 26, weight: 79.1 },
    { date: '2024-03-07', count: 22, weight: 68.4 }
  ],
  materialBreakdown: [
    { materialId: 'pet1', percentage: 42, weight: 215.6 },
    { materialId: 'hdpe2', percentage: 28, weight: 143.7 },
    { materialId: 'ldpe4', percentage: 12, weight: 61.6 },
    { materialId: 'pp5', percentage: 15, weight: 77.0 },
    { materialId: 'ps6', percentage: 3, weight: 15.4 }
  ],
  userActivity: [
    { date: '2024-03-01', activeUsers: 156, newUsers: 12 },
    { date: '2024-03-02', activeUsers: 142, newUsers: 8 },
    { date: '2024-03-03', activeUsers: 128, newUsers: 5 },
    { date: '2024-03-04', activeUsers: 168, newUsers: 15 },
    { date: '2024-03-05', activeUsers: 183, newUsers: 19 },
    { date: '2024-03-06', activeUsers: 175, newUsers: 14 },
    { date: '2024-03-07', activeUsers: 162, newUsers: 11 }
  ]
}; 