'use client';

import { Dispatch } from '@/types/dispatch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Truck, Calendar } from 'lucide-react';

interface DispatchesTableProps {
  dispatches: Dispatch[];
  currentPage: number;
  itemsPerPage?: number;
}

const ITEMS_PER_PAGE = 10;

export default function DispatchesTable({
  dispatches,
  currentPage,
  itemsPerPage = ITEMS_PER_PAGE,
}: DispatchesTableProps) {

  const getStatusDispatchBadge = (status: string) => {
    switch (status) {
      case 'to_dispatch':
        return <Badge variant="warning">Por Preparar</Badge>;
      case 'dispatched':
        return <Badge variant="success">Preparado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getOriginBadge = (origin: string) => {
    if (origin === 'stock') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
          <Package size={12} /> Stock
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
        <Truck size={12} /> Recojo
      </span>
    );
  };


  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-4 py-3 text-center w-8">#</th>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Empresa</th>
              <th className="px-4 py-3">Origen</th>
              <th className="px-4 py-3">Estado Despacho</th>
              <th className="px-4 py-3">Estado General</th>
              <th className="px-4 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dispatches.map((dispatch, index) => (
              <tr
                key={dispatch.id}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                <td className="px-2 py-3 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-mono text-slate-400 text-[10px]"> {(currentPage - 1) * 10 + index + 1}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium text-slate-800">{dispatch.product_name}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-slate-600 font-medium">
                    {dispatch.company_name}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {getOriginBadge(dispatch.origin_type)}
                  {dispatch.id_pickup && (
                    <div className="text-[10px] text-slate-400 mt-1 font-mono">
                      Ref: #{dispatch.id_pickup}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {getStatusDispatchBadge(dispatch.status_dispatch)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Badge variant="secondary" className="capitalize">
                    {dispatch.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="font-medium">{dispatch.shipping_date}</span>
                  </div>
                </td>
              </tr>
            ))}

            {dispatches.length === 0 && (
              <tr>
                <td colSpan={7} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                      <Package className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-1">No hay despachos</h3>
                    <p className="text-slate-500">No se encontraron despachos con los filtros actuales.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
