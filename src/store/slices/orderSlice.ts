import { Order, OrderService } from '@/services/OrderService';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  loading: false,
  error: null,
};

const orderService = OrderService.getInstance();

export const fetchOrders = createAsyncThunk<Order[], void>(
  'orders/fetchOrders',
  async () => {
    const response = await orderService.getOrders();
    return response;
  }
);

export const updateOrderStatus = createAsyncThunk<
  Order,
  { orderId: string; itemId: string; status: Order['items'][0]['status'] }
>(
  'orders/updateOrderStatus',
  async ({ orderId, itemId, status }) => {
    const response = await OrderService.updateOrderItemStatus(orderId, itemId, status);
    return response.data;
  }
);

export const cancelOrder = createAsyncThunk<Order, string>(
  'orders/cancelOrder',
  async (orderId) => {
    const response = await orderService.cancelOrder(orderId);
    return response;
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrders: (state) => {
      state.orders = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action: PayloadAction<Order[]>) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch orders';
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        const index = state.orders.findIndex((order) => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update order status';
      })
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        const index = state.orders.findIndex((order) => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to cancel order';
      });
  },
});

export const { clearOrders } = orderSlice.actions;
export default orderSlice.reducer; 