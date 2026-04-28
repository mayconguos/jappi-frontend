'use client';

import { useState, useEffect, useCallback } from 'react';

import { useAuth } from '@/context/AuthContext';

import DeliveryLoader from '@/components/ui/delivery-loader';

import CarrierPickupsTable from '@/components/tables/CarrierPickupsTable';

import api from '@/app/services/api';

// ─── Tipos ─────────────────────────────────────────────────────
export type CarrierPickupStatus = 'pending' | 'scheduled' | 'picked_up' | 'received';

export interface CarrierPickup {
  id: number;
  status: CarrierPickupStatus;
  pickup_date: string;
  phone: string;
  origin: string;
  company_name: string;
  address: string;
  district_name: string;
  sector_name: string;
}

// ─── Helper de Mapeo ───────────────────────────────────────────
const mapApiPickup = (raw: any): CarrierPickup => ({
  id: raw.id,
  status: raw.status as CarrierPickupStatus,
  pickup_date: raw.pickup_date
    ? new Date(raw.pickup_date).toISOString().split('T')[0].split('-').reverse().join('/')
    : 'Sin fecha',
  phone: raw.phone || 'Sin teléfono',
  origin: raw.origin === 'supply' ? 'Abastecimiento' : 'Envío',
  company_name: raw.company_name || 'Sin empresa',
  address: raw.address || 'Sin dirección',
  district_name: raw.district_name || '',
  sector_name: raw.sector_name || '',
});

// ─── Page ──────────────────────────────────────────────────────
export default function CarrierPickupsPage() {
  const { user } = useAuth();

  const [pickups, setPickups] = useState<CarrierPickup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);

  // ─── Fetch ─────────────────────────────────────────────────
  const fetchPickups = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const resp = await api.get(`/courier/${user.id}/pickups`, {
        headers: { authorization: `${token}` }
      });
      const data = Array.isArray(resp.data) ? resp.data : (resp.data?.data || []);
      setPickups(data.map(mapApiPickup));
    } catch (err) {
      console.error('Error fetching carrier pickups:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchPickups(); }, [fetchPickups]);

  // ─── Confirmar Recojo ──────────────────────────────────────
  const handleConfirmPickup = async (pickupId: number) => {
    setIsConfirming(true);
    try {
      const token = localStorage.getItem('token');
      await api.put(`/pickup/status`, [{ id_pickup: pickupId, status: 'picked_up' }], {
        headers: { authorization: `${token}` }
      });
      // Actualizar estado local sin re-fetch
      setPickups(prev =>
        prev.map(p => p.id === pickupId ? { ...p, status: 'picked_up' as CarrierPickupStatus } : p)
      );
    } catch (err) {
      console.error('Error confirmando recojo:', err);
    } finally {
      setIsConfirming(false);
    }
  };

  // ─── KPIs ──────────────────────────────────────────────────
  const totalPickups = pickups.length;
  const pickedUp = pickups.filter(p => p.status === 'picked_up').length;

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500">

      {/* KPIs — Mobile: barra compacta */}
      <div className="flex md:hidden items-center gap-2 bg-white border border-gray-100 shadow-sm rounded-xl px-4 py-2.5">
        <div className="flex flex-1 items-center justify-center gap-1.5">
          <span className="text-xs font-medium text-gray-400">Recojos</span>
          <span className="text-sm font-bold text-gray-900">{isLoading ? '—' : totalPickups}</span>
        </div>
        <span className="w-px h-4 bg-gray-200" />
        <div className="flex flex-1 items-center justify-center gap-1.5">
          <span className="text-xs font-medium text-gray-400">Recogidos</span>
          <span className="text-sm font-bold text-emerald-600">{isLoading ? '—' : pickedUp}</span>
        </div>
      </div>

      {/* KPIs — Desktop: grid de tarjetas */}
      <div className="hidden md:grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Recojos</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{isLoading ? '—' : totalPickups}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Recogidos</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{isLoading ? '—' : pickedUp}</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <DeliveryLoader message="Cargando recojos asignados..." />
          </div>
        ) : (
          <CarrierPickupsTable
            pickups={pickups}
            isConfirming={isConfirming}
            onConfirmPickup={handleConfirmPickup}
          />
        )}
      </div>
    </div>
  );
}
