export interface Product {
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
    plasticReduction: number; // grams of plastic reduced compared to standard packaging
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
}

export interface CartItem extends Product {
  quantity: number;
  selectedPackaging: Product['ecoFriendly']['packagingType'];
} 