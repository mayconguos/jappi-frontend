'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';


import api from '@/app/services/api';

import DeliveryLoader from '@/components/ui/delivery-loader';

import CarrierDeliveriesTable from '@/components/tables/CarrierDeliveriesTable';

// ─── Tipos ─────────────────────────────────────────────────────
export type CarrierDeliveryStatus = 'pending' | 'scheduled' | 'completed' | 'failed';

export interface CarrierDelivery {
  id: string;
  status: CarrierDeliveryStatus;
  date: string;
  recipient: string;
  recipient_phone: string;
  recipient_address: string;
  origin: string;
  destination: string;
  district: string;
  items_count: number;
}

// ─── Helper de Mapeo ───────────────────────────────────────────
const mapApiDelivery = (raw: any): CarrierDelivery => ({
  id: String(raw.id),
  status: (raw.status === 'scheduled' ? 'pending' : raw.status) as CarrierDeliveryStatus,
  date: raw.shipping_date
    ? new Date(raw.shipping_date).toISOString().split('T')[0].split('-').reverse().join('/')
    : 'Sin fecha',
  recipient: raw.customer_name || 'Sin nombre',
  recipient_phone: raw.phone || 'Sin teléfono',
  recipient_address: raw.address || 'Sin dirección',
  origin: raw.company_name || 'Japi Express',
  destination: raw.address || 'Sin dirección',
  district: raw.district_name || 'Sin distrito',
  items_count: 1, // El API actual no devuelve items_count, ponemos 1 por defecto
});

export default function CarrierDeliveriesPage() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<CarrierDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ─── Fetch ─────────────────────────────────────────────────
  const fetchDeliveries = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const resp = await api.get(`/courier/${user.id}/shippings`, {
        headers: { authorization: `${token}` }
      });
      const data = Array.isArray(resp.data) ? resp.data : (resp.data?.data || []);
      setDeliveries(data.map(mapApiDelivery));
    } catch (err) {
      console.error('Error fetching carrier deliveries:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  // ─── KPIs ──────────────────────────────────────────────────
  const totalDeliveries = deliveries.length;
  const completedDeliveries = deliveries.filter(d => d.status === 'completed').length;

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500">

      {/* Mobile pill bar */}
      <div className="flex md:hidden items-center gap-2 bg-white border border-gray-100 shadow-sm rounded-xl px-4 py-2.5">
        <div className="flex flex-1 items-center justify-center gap-1.5">
          <span className="text-xs font-medium text-gray-400">Entregas</span>
          <span className="text-sm font-bold text-gray-900">{isLoading ? '—' : totalDeliveries}</span>
        </div>
        <span className="w-px h-4 bg-gray-200" />
        <div className="flex flex-1 items-center justify-center gap-1.5">
          <span className="text-xs font-medium text-gray-400">Completadas</span>
          <span className="text-sm font-bold text-emerald-600">{isLoading ? '—' : completedDeliveries}</span>
        </div>
      </div>

      {/* Desktop grid */}
      <div className="hidden md:grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Entregas</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{isLoading ? '—' : totalDeliveries}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Completadas</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{isLoading ? '—' : completedDeliveries}</p>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <DeliveryLoader message="Cargando entregas asignadas..." />
          </div>
        ) : (
          <CarrierDeliveriesTable
            deliveries={deliveries}
            onStatusChange={(id, status) => {
              setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: status as any } : d));
            }}
          />
        )}
      </div>
    </div>
  );
}

