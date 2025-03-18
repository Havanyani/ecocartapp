import { RootState } from '@/store';
import {
    assignDelivery,
    clearError,
    getDeliveryStatus,
    getPersonnelById,
    searchPersonnel,
    updateDeliveryStatus,
    updatePersonnelLocation,
    updatePersonnelStatus,
} from '@/store/slices/deliveryPersonnelSlice';
import { DeliveryPersonnel, DeliveryPersonnelSearchParams, DeliveryStatus, DeliveryStatusUpdateParams } from '@/types/DeliveryPersonnel';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export function useDeliveryPersonnel() {
  const dispatch = useDispatch();
  const { personnel, selectedPersonnel, deliveryStatuses, isLoading, error } = useSelector(
    (state: RootState) => state.deliveryPersonnel
  );

  const handleSearchPersonnel = useCallback(
    (params: DeliveryPersonnelSearchParams) => {
      return dispatch(searchPersonnel(params));
    },
    [dispatch]
  );

  const handleGetPersonnelById = useCallback(
    (personnelId: string) => {
      return dispatch(getPersonnelById(personnelId));
    },
    [dispatch]
  );

  const handleUpdatePersonnelStatus = useCallback(
    (personnelId: string, status: DeliveryPersonnel['status']) => {
      return dispatch(updatePersonnelStatus({ personnelId, status }));
    },
    [dispatch]
  );

  const handleUpdatePersonnelLocation = useCallback(
    (personnelId: string, location: DeliveryPersonnel['currentLocation']) => {
      return dispatch(updatePersonnelLocation({ personnelId, location }));
    },
    [dispatch]
  );

  const handleGetDeliveryStatus = useCallback(
    (orderId: string) => {
      return dispatch(getDeliveryStatus(orderId));
    },
    [dispatch]
  );

  const handleUpdateDeliveryStatus = useCallback(
    (params: DeliveryStatusUpdateParams) => {
      return dispatch(updateDeliveryStatus(params));
    },
    [dispatch]
  );

  const handleAssignDelivery = useCallback(
    (orderId: string, personnelId: string) => {
      return dispatch(assignDelivery({ orderId, personnelId }));
    },
    [dispatch]
  );

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const getDeliveryStatusByOrderId = useCallback(
    (orderId: string): DeliveryStatus | undefined => {
      return deliveryStatuses[orderId];
    },
    [deliveryStatuses]
  );

  const getAvailablePersonnel = useCallback((): DeliveryPersonnel[] => {
    return personnel.filter((p) => p.status === 'AVAILABLE');
  }, [personnel]);

  const getPersonnelByVehicleType = useCallback(
    (vehicleType: DeliveryPersonnel['vehicle']['type']): DeliveryPersonnel[] => {
      return personnel.filter((p) => p.vehicle.type === vehicleType);
    },
    [personnel]
  );

  return {
    personnel,
    selectedPersonnel,
    deliveryStatuses,
    isLoading,
    error,
    searchPersonnel: handleSearchPersonnel,
    getPersonnelById: handleGetPersonnelById,
    updatePersonnelStatus: handleUpdatePersonnelStatus,
    updatePersonnelLocation: handleUpdatePersonnelLocation,
    getDeliveryStatus: handleGetDeliveryStatus,
    updateDeliveryStatus: handleUpdateDeliveryStatus,
    assignDelivery: handleAssignDelivery,
    clearError: handleClearError,
    getDeliveryStatusByOrderId,
    getAvailablePersonnel,
    getPersonnelByVehicleType,
  };
} 