import { deliveryPersonnelApi } from '@/services/deliveryPersonnelApi';
import { DeliveryPersonnel, DeliveryPersonnelSearchParams, DeliveryStatus, DeliveryStatusUpdateParams } from '@/types/DeliveryPersonnel';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface DeliveryPersonnelState {
  personnel: DeliveryPersonnel[];
  selectedPersonnel: DeliveryPersonnel | null;
  deliveryStatuses: Record<string, DeliveryStatus>;
  isLoading: boolean;
  error: string | null;
}

const initialState: DeliveryPersonnelState = {
  personnel: [],
  selectedPersonnel: null,
  deliveryStatuses: {},
  isLoading: false,
  error: null,
};

export const searchPersonnel = createAsyncThunk(
  'deliveryPersonnel/searchPersonnel',
  async (params: DeliveryPersonnelSearchParams) => {
    const response = await deliveryPersonnelApi.searchPersonnel(params);
    return response;
  }
);

export const getPersonnelById = createAsyncThunk(
  'deliveryPersonnel/getPersonnelById',
  async (personnelId: string) => {
    const response = await deliveryPersonnelApi.getPersonnelById(personnelId);
    return response;
  }
);

export const updatePersonnelStatus = createAsyncThunk(
  'deliveryPersonnel/updatePersonnelStatus',
  async ({ personnelId, status }: { personnelId: string; status: DeliveryPersonnel['status'] }) => {
    const response = await deliveryPersonnelApi.updatePersonnelStatus(personnelId, status);
    return response;
  }
);

export const updatePersonnelLocation = createAsyncThunk(
  'deliveryPersonnel/updatePersonnelLocation',
  async ({ personnelId, location }: { personnelId: string; location: DeliveryPersonnel['currentLocation'] }) => {
    const response = await deliveryPersonnelApi.updatePersonnelLocation(personnelId, location);
    return response;
  }
);

export const getDeliveryStatus = createAsyncThunk(
  'deliveryPersonnel/getDeliveryStatus',
  async (orderId: string) => {
    const response = await deliveryPersonnelApi.getDeliveryStatus(orderId);
    return response;
  }
);

export const updateDeliveryStatus = createAsyncThunk(
  'deliveryPersonnel/updateDeliveryStatus',
  async (params: DeliveryStatusUpdateParams) => {
    const response = await deliveryPersonnelApi.updateDeliveryStatus(params);
    return response;
  }
);

export const assignDelivery = createAsyncThunk(
  'deliveryPersonnel/assignDelivery',
  async ({ orderId, personnelId }: { orderId: string; personnelId: string }) => {
    const response = await deliveryPersonnelApi.assignDelivery(orderId, personnelId);
    return response;
  }
);

const deliveryPersonnelSlice = createSlice({
  name: 'deliveryPersonnel',
  initialState,
  reducers: {
    setSelectedPersonnel: (state, action) => {
      state.selectedPersonnel = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Search Personnel
      .addCase(searchPersonnel.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchPersonnel.fulfilled, (state, action) => {
        state.isLoading = false;
        state.personnel = action.payload;
      })
      .addCase(searchPersonnel.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to search personnel';
      })
      // Get Personnel By ID
      .addCase(getPersonnelById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPersonnelById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedPersonnel = action.payload;
      })
      .addCase(getPersonnelById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to get personnel';
      })
      // Update Personnel Status
      .addCase(updatePersonnelStatus.fulfilled, (state, action) => {
        const index = state.personnel.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.personnel[index] = action.payload;
        }
        if (state.selectedPersonnel?.id === action.payload.id) {
          state.selectedPersonnel = action.payload;
        }
      })
      // Update Personnel Location
      .addCase(updatePersonnelLocation.fulfilled, (state, action) => {
        const index = state.personnel.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.personnel[index] = action.payload;
        }
        if (state.selectedPersonnel?.id === action.payload.id) {
          state.selectedPersonnel = action.payload;
        }
      })
      // Get Delivery Status
      .addCase(getDeliveryStatus.fulfilled, (state, action) => {
        state.deliveryStatuses[action.payload.orderId] = action.payload;
      })
      // Update Delivery Status
      .addCase(updateDeliveryStatus.fulfilled, (state, action) => {
        state.deliveryStatuses[action.payload.orderId] = action.payload;
      })
      // Assign Delivery
      .addCase(assignDelivery.fulfilled, (state, action) => {
        state.deliveryStatuses[action.payload.orderId] = action.payload;
      });
  },
});

export const { setSelectedPersonnel, clearError } = deliveryPersonnelSlice.actions;
export default deliveryPersonnelSlice.reducer; 