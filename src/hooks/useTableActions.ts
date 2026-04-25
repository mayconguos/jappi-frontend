'use client';

import { useState, useCallback } from 'react';
import { useApi } from '@/hooks';
import { Courier } from '@/types/courier';

// ─── Types ─────────────────────────────────────────────────────────────────
export interface CarrierChange {
  entityId: number;
  courierId: number;
  courierName: string;
}

export interface PendingStatusChange<TStatus extends string> {
  entityId: number;
  status: TStatus;
}

export interface UseTableActionsReturn<TStatus extends string> {
  // Courier state
  couriers: Courier[];
  isFetchingCouriers: boolean;
  fetchCouriers: () => Promise<void>;

  // Single carrier modal
  isConfirmModalOpen: boolean;
  setIsConfirmModalOpen: (v: boolean) => void;
  isUpdatingCarrier: boolean;
  selectedChange: CarrierChange | null;
  setSelectedChange: (v: CarrierChange | null) => void;

  // Single status modal
  isConfirmStatusModalOpen: boolean;
  setIsConfirmStatusModalOpen: (v: boolean) => void;
  isUpdatingStatus: boolean;
  pendingStatusChange: PendingStatusChange<TStatus> | null;
  setPendingStatusChange: (v: PendingStatusChange<TStatus> | null) => void;

  // Multi-select
  selectedIds: number[];
  setSelectedIds: (ids: number[]) => void;
  handleSelectOne: (id: number) => void;
  handleSelectAll: (ids: number[]) => void;

  // Batch modals
  isBatchModalOpen: boolean;
  setIsBatchModalOpen: (v: boolean) => void;
  isBatchStatusModalOpen: boolean;
  setIsBatchStatusModalOpen: (v: boolean) => void;
  batchCarrier: string;
  setBatchCarrier: (v: string) => void;
  batchStatus: TStatus | '';
  setBatchStatus: (v: TStatus | '') => void;

  // Feedback modals
  successModal: string | null;
  setSuccessModal: (v: string | null) => void;
  warningModal: { title: string; message: string } | null;
  setWarningModal: (v: { title: string; message: string } | null) => void;

  // Cancel
  entityToCancel: number | null;
  setEntityToCancel: (v: number | null) => void;

  // API helpers
  put: ReturnType<typeof useApi>['put'];
  get: ReturnType<typeof useApi>['get'];
  setIsUpdatingCarrier: (v: boolean) => void;
  setIsUpdatingStatus: (v: boolean) => void;
}

export function useTableActions<TStatus extends string>(): UseTableActionsReturn<TStatus> {
  const { get, put } = useApi<any>();

  // Courier
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [isFetchingCouriers, setIsFetchingCouriers] = useState(false);

  // Single carrier modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isUpdatingCarrier, setIsUpdatingCarrier] = useState(false);
  const [selectedChange, setSelectedChange] = useState<CarrierChange | null>(null);

  // Single status modal
  const [isConfirmStatusModalOpen, setIsConfirmStatusModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<PendingStatusChange<TStatus> | null>(null);

  // Multi-select
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Batch modals
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isBatchStatusModalOpen, setIsBatchStatusModalOpen] = useState(false);
  const [batchCarrier, setBatchCarrier] = useState<string>('');
  const [batchStatus, setBatchStatus] = useState<TStatus | ''>('');

  // Feedback modals
  const [successModal, setSuccessModal] = useState<string | null>(null);
  const [warningModal, setWarningModal] = useState<{ title: string; message: string } | null>(null);

  // Cancel
  const [entityToCancel, setEntityToCancel] = useState<number | null>(null);

  const fetchCouriers = useCallback(async () => {
    if (couriers.length > 0 || isFetchingCouriers) return;
    setIsFetchingCouriers(true);
    try {
      const resp = await get('/user?type=couriers');
      if (resp && Array.isArray(resp)) setCouriers(resp);
    } catch (err) {
      console.error('Error fetching couriers', err);
    } finally {
      setIsFetchingCouriers(false);
    }
  }, [get, couriers.length, isFetchingCouriers]);

  const handleSelectOne = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAll = (ids: number[]) => {
    setSelectedIds(prev => prev.length === ids.length ? [] : ids);
  };

  return {
    couriers, isFetchingCouriers, fetchCouriers,
    isConfirmModalOpen, setIsConfirmModalOpen,
    isUpdatingCarrier, setIsUpdatingCarrier,
    selectedChange, setSelectedChange,
    isConfirmStatusModalOpen, setIsConfirmStatusModalOpen,
    isUpdatingStatus, setIsUpdatingStatus,
    pendingStatusChange, setPendingStatusChange,
    selectedIds, setSelectedIds, handleSelectOne, handleSelectAll,
    isBatchModalOpen, setIsBatchModalOpen,
    isBatchStatusModalOpen, setIsBatchStatusModalOpen,
    batchCarrier, setBatchCarrier,
    batchStatus, setBatchStatus,
    successModal, setSuccessModal,
    warningModal, setWarningModal,
    entityToCancel, setEntityToCancel,
    put, get,
  };
}
