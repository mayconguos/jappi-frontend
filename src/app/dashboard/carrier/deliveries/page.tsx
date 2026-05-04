'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/app/services/api';
import DeliveryLoader from '@/components/ui/delivery-loader';
import CarrierDeliveriesTable from '@/components/tables/CarrierDeliveriesTable';
import { CarrierDelivery } from '@/types/courier';

const mapApiDelivery = (apiD: any): CarrierDelivery => ({
  id: String(apiD.id),
  shipping_date: apiD.shipping_date || '',
  total_amount: apiD.total_amount || 0,
  status: apiD.status,
  customer_name: apiD.customer_name || 'Desconocido',
  phone: apiD.phone || '',
  company_name: apiD.company_name || 'Empresa',
  address: apiD.address || '',
  district_name: apiD.district_name || '',
  sector_name: apiD.sector_name || '',
  url_01: apiD.url_01,
  url_02: apiD.url_02,
  url_03: apiD.url_03,
  signed_urls: apiD.signed_urls || []
});

export default function CarrierDeliveriesPage() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<CarrierDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado compartido para mostrar/ocultar completados
  const [showFinished, setShowFinished] = useState(false);

  const fetchDeliveries = useCallback(async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const response = await api.get(`/courier/${user.id}/shippings`);
      const data = response.data;
      setDeliveries(Array.isArray(data) ? data.map(mapApiDelivery) : []);
    } catch (error) {
      console.error('Error fetching carrier deliveries:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const totalDeliveries = deliveries.length;
  const completedDeliveries = deliveries.filter(d => ['delivered', 'cancelled', 'returned'].includes(d.status)).length;

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      
      {/* Mobile pill bar (Interactivo) */}
      <div className="flex md:hidden items-center gap-2 bg-white border border-gray-100 shadow-sm rounded-xl px-4 py-2.5">
        <button 
          onClick={() => setShowFinished(false)}
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 transition-all ${showFinished ? 'opacity-50' : 'scale-105'}`}
        >
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Entregas</span>
          <span className="text-sm font-black text-slate-900">{isLoading ? '—' : totalDeliveries}</span>
        </button>
        <span className="w-px h-6 bg-gray-100" />
        <button 
          onClick={() => setShowFinished(!showFinished)}
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 transition-all ${showFinished ? 'scale-105' : 'opacity-50'}`}
        >
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Completadas</span>
          <span className="text-sm font-black text-emerald-600">{isLoading ? '—' : completedDeliveries}</span>
        </button>
      </div>

      {/* Desktop grid (Interactivo) */}
      <div className="hidden md:grid grid-cols-2 gap-6">
        <button 
          onClick={() => setShowFinished(false)}
          className={`bg-white p-6 rounded-2xl border transition-all text-left ${showFinished ? 'border-gray-100 shadow-sm hover:border-blue-200' : 'border-blue-500 ring-4 ring-blue-50 shadow-lg'}`}
        >
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Entregas</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{isLoading ? '—' : totalDeliveries}</p>
        </button>
        <button 
          onClick={() => setShowFinished(!showFinished)}
          className={`bg-white p-6 rounded-2xl border transition-all text-left ${showFinished ? 'border-emerald-500 ring-4 ring-emerald-50 shadow-lg' : 'border-gray-100 shadow-sm hover:border-emerald-200'}`}
        >
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Completadas</p>
          <p className="text-3xl font-black text-emerald-600 mt-1">{isLoading ? '—' : completedDeliveries}</p>
          <p className="text-[10px] font-bold text-emerald-700 mt-2 uppercase tracking-tight">
            {showFinished ? '✓ Viendo historial' : '→ Toca para ver completadas'}
          </p>
        </button>
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
            showFinished={showFinished}
            onStatusChange={(id, status) => {
              setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: status as any } : d));
            }}
          />
        )}
      </div>
    </div>
  );
}
