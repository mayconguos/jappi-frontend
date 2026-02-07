'use client';

import { ArrowDownLeft } from 'lucide-react';
import Link from 'next/link';
import { useInventory } from '@/context/InventoryContext';

// Components
import InventoryStats from '@/components/dashboard/inventory/InventoryStats';
import RecentActivityTable from '@/components/tables/RecentActivityTable';
import InventoryAlerts from '@/components/dashboard/inventory/InventoryAlerts';

export default function InventoryMainPage() {
  const { products, requests } = useInventory();

  // Calculate statistics
  const totalProducts = products.length;
  const lowStockList = products.filter(p => p.quantity < 10 && p.status === 'active');
  const lowStockCount = lowStockList.length;
  const activeRequests = requests.filter(r => r.status === 'pending' || r.status === 'in_transit').length;

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Resumen de Inventario
          </h1>
          <p className="text-slate-500 mt-1">
            Vista general del estado de tu almacén y movimientos recientes.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/inventory/requests?new=true"
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            <ArrowDownLeft size={18} />
            Nueva Solicitud
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <InventoryStats
        totalProducts={totalProducts}
        lowStockProducts={lowStockCount}
        activeRequests={activeRequests}
      />

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Table */}
        <RecentActivityTable requests={requests} />

        {/* Alerts & Quick Actions */}
        <InventoryAlerts lowStockProducts={lowStockList} />
      </div>
    </div>
  );
}
