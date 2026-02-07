import {
  Package,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';

interface InventoryStatsProps {
  totalProducts: number;
  lowStockProducts: number;
  activeRequests: number;
}

export default function InventoryStats({
  totalProducts,
  lowStockProducts,
  activeRequests
}: InventoryStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <Package size={20} />
          </div>
          <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            <TrendingUp size={12} className="mr-1" />
            Obsoleto
          </span>
        </div>
        <div className="mt-4">
          <h3 className="text-slate-500 text-sm font-medium">Total Productos</h3>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalProducts}</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
            <AlertTriangle size={20} />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-slate-500 text-sm font-medium">Stock Bajo</h3>
          <p className="text-2xl font-bold text-slate-900 mt-1">{lowStockProducts}</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
            <ArrowDownLeft size={20} />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-slate-500 text-sm font-medium">Solicitudes Activas</h3>
          <p className="text-2xl font-bold text-slate-900 mt-1">{activeRequests}</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            <ArrowUpRight size={20} />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-slate-500 text-sm font-medium">Despachos Hoy</h3>
          <p className="text-2xl font-bold text-slate-900 mt-1">0</p>
        </div>
      </div>
    </div>
  );
}
