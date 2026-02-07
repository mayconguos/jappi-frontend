import { Clock, AlertTriangle } from 'lucide-react';
import { CatalogProduct } from '@/components/tables/CompanyProductsTable';

interface InventoryAlertsProps {
  lowStockProducts: CatalogProduct[];
}

export default function InventoryAlerts({ lowStockProducts }: InventoryAlertsProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Clock size={18} className="text-amber-500" />
          Alertas de Stock
        </h3>
        <div className="space-y-3">
          {lowStockProducts.length > 0 ? (
            lowStockProducts.slice(0, 3).map((p) => (
              <div key={p.id} className="flex items-start gap-3 p-3 bg-amber-50/50 rounded-lg border border-amber-100">
                <AlertTriangle size={16} className="text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">{p.product_name}</p>
                  <p className="text-xs text-amber-700 font-medium">Solo quedan {p.quantity} unidades</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">Todo el inventario parece estar en orden.</p>
          )}
        </div>
      </div>

      <div className="bg-slate-900 p-6 rounded-xl text-white shadow-lg">
        <h3 className="font-semibold mb-2">¿Necesitas ayuda?</h3>
        <p className="text-slate-300 text-sm mb-4">
          Contacta a soporte si tienes problemas con tu inventario.
        </p>
        <button className="w-full py-2 bg-white text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
          Contactar Soporte
        </button>
      </div>
    </div>
  );
}
