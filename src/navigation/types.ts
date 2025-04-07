import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SmartHomeStackParamList } from './SmartHomeNavigator';

export type RootStackParamList = {
  MainTabs: undefined;
  Home: undefined;
  PerformanceMonitor: undefined;
  Settings: undefined;
  Profile: undefined;
  Analytics: undefined;
  ProductList: undefined;
  ProductDetail: {
    product: {
      id: string;
      name: string;
      price: number;
      description: string;
      image: string;
      category: string;
      stock: number;
      ecoFriendly: {
        isEcoFriendly: boolean;
        packagingType: 'recyclable' | 'biodegradable' | 'reusable' | 'standard';
        plasticReduction: number;
      };
      nutritionInfo?: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
      };
      ratings: {
        average: number;
        count: number;
      };
    };
  };
  Cart: undefined;
  Checkout: undefined;
  Orders: undefined;
  Payments: undefined;
  WasteCollection: undefined;
  ARContainerScanner: undefined;
  AIConfigScreen: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ARContainerScan: undefined;
  RecyclePointSelection: undefined;
  MaterialsContribution: undefined;
  CommunityChallenge: undefined;
  SmartHome: undefined;
  BarcodeScanner: {
    onMaterialSelect?: (materialId: string) => void;
  };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type HomeScreenProps = RootStackScreenProps<'Home'>;
export type ProductListScreenProps = RootStackScreenProps<'ProductList'>;
export type PaymentsScreenProps = RootStackScreenProps<'Payments'>;
export type ProfileScreenProps = RootStackScreenProps<'Profile'>;
export type WasteCollectionScreenProps = RootStackScreenProps<'WasteCollection'>;
export type ARContainerScannerScreenProps = RootStackScreenProps<'ARContainerScanner'>;
export type AIConfigScreenProps = RootStackScreenProps<'AIConfigScreen'>;

export type MainTabParamList = {
  Home: undefined;
  Recycle: undefined;
  SmartHome: undefined;
  Profile: undefined;
};

export type NavigatorParamList = {
  Root: undefined;
  Auth: undefined;
  SmartHome: NavigatorScreenParams<SmartHomeStackParamList>;
};

export type AppStackParamList = RootStackParamList & 
  MainTabParamList &
  SmartHomeStackParamList; 