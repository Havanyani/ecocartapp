import { ecoCartReducer, EcoCartState } from './slices/ecoCartSlice';

export interface RootState {
  ecoCart: EcoCartState;
}

export const rootReducer = {
  ecoCart: ecoCartReducer
}; 