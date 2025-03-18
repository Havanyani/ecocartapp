import { CreditBalance, PaymentIntent, PaymentMethod, PaymentService } from '@/services/PaymentService';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface PaymentState {
  paymentMethods: PaymentMethod[];
  creditBalance: CreditBalance | null;
  paymentHistory: PaymentIntent[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  paymentMethods: [],
  creditBalance: null,
  paymentHistory: [],
  isLoading: false,
  error: null,
};

const paymentService = PaymentService.getInstance();

// Async thunks
export const fetchPaymentMethods = createAsyncThunk(
  'payment/fetchPaymentMethods',
  async () => {
    const response = await paymentService.getPaymentMethods();
    return response;
  }
);

export const addPaymentMethod = createAsyncThunk(
  'payment/addPaymentMethod',
  async (paymentMethodData: Omit<PaymentMethod, 'id' | 'isDefault'>) => {
    const response = await paymentService.addPaymentMethod(paymentMethodData);
    return response;
  }
);

export const removePaymentMethod = createAsyncThunk(
  'payment/removePaymentMethod',
  async (id: string) => {
    await paymentService.removePaymentMethod(id);
    return id;
  }
);

export const setDefaultPaymentMethod = createAsyncThunk(
  'payment/setDefaultPaymentMethod',
  async (id: string) => {
    await paymentService.setDefaultPaymentMethod(id);
    return id;
  }
);

export const fetchCreditBalance = createAsyncThunk(
  'payment/fetchCreditBalance',
  async () => {
    const response = await paymentService.getCreditBalance();
    return response;
  }
);

export const redeemCredits = createAsyncThunk(
  'payment/redeemCredits',
  async (amount: number) => {
    const response = await paymentService.redeemCredits(amount);
    return response;
  }
);

export const createPaymentIntent = createAsyncThunk(
  'payment/createPaymentIntent',
  async ({ amount, currency }: { amount: number; currency: string }) => {
    const response = await paymentService.createPaymentIntent(amount, currency);
    return response;
  }
);

export const confirmPayment = createAsyncThunk(
  'payment/confirmPayment',
  async ({ paymentIntentId, paymentMethodId }: { paymentIntentId: string; paymentMethodId: string }) => {
    const response = await paymentService.confirmPayment(paymentIntentId, paymentMethodId);
    return response;
  }
);

export const fetchPaymentHistory = createAsyncThunk(
  'payment/fetchPaymentHistory',
  async () => {
    const response = await paymentService.getPaymentHistory();
    return response;
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Payment Methods
      .addCase(fetchPaymentMethods.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentMethods = action.payload;
      })
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch payment methods';
      })
      // Add Payment Method
      .addCase(addPaymentMethod.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addPaymentMethod.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentMethods.push(action.payload);
      })
      .addCase(addPaymentMethod.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to add payment method';
      })
      // Remove Payment Method
      .addCase(removePaymentMethod.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removePaymentMethod.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentMethods = state.paymentMethods.filter(
          (method) => method.id !== action.payload
        );
      })
      .addCase(removePaymentMethod.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to remove payment method';
      })
      // Set Default Payment Method
      .addCase(setDefaultPaymentMethod.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(setDefaultPaymentMethod.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentMethods = state.paymentMethods.map((method) => ({
          ...method,
          isDefault: method.id === action.payload,
        }));
      })
      .addCase(setDefaultPaymentMethod.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to set default payment method';
      })
      // Fetch Credit Balance
      .addCase(fetchCreditBalance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCreditBalance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.creditBalance = action.payload;
      })
      .addCase(fetchCreditBalance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch credit balance';
      })
      // Redeem Credits
      .addCase(redeemCredits.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(redeemCredits.fulfilled, (state, action) => {
        state.isLoading = false;
        state.creditBalance = action.payload;
      })
      .addCase(redeemCredits.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to redeem credits';
      })
      // Create Payment Intent
      .addCase(createPaymentIntent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentHistory.push(action.payload);
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create payment intent';
      })
      // Confirm Payment
      .addCase(confirmPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(confirmPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.paymentHistory.findIndex(
          (payment) => payment.id === action.payload.id
        );
        if (index !== -1) {
          state.paymentHistory[index] = action.payload;
        }
      })
      .addCase(confirmPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to confirm payment';
      })
      // Fetch Payment History
      .addCase(fetchPaymentHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentHistory = action.payload;
      })
      .addCase(fetchPaymentHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch payment history';
      });
  },
});

export const { clearError } = paymentSlice.actions;
export default paymentSlice.reducer; 