import { Edit, Eye, Trash2, RotateCcw, Truck, Mail, User, Hash, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { Carrier } from '@/app/dashboard/accounts/carriers/page';

interface CarriersTableProps {
  carriers: Carrier[];
  currentPage: number;
  itemsPerPage?: number;
  onView: (carrier: Carrier) => void;
  onEdit: (carrier: Carrier) => void;
  onDelete: (carrier: Carrier) => void;
  onReactivate?: (carrier: Carrier) => void;
}

export default function CarriersTable({
  carriers,
  currentPage,
  itemsPerPage = 10,
  onView,
  onEdit,
  onDelete,
  onReactivate
}: Readonly<CarriersTableProps>) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
            <tr>
              <th className="w-[60px] pl-6 py-3 text-slate-400">#</th>
              <th className="px-4 py-3">Transportista</th>
              <th className="px-4 py-3">Vehículo</th>
              <th className="w-[120px] px-4 py-3 text-center">Placa</th>
              <th className="w-[140px] px-4 py-3">Estado</th>
              <th className="w-[140px] px-4 py-3 text-right pr-6">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {carriers.map((carrier, index) => {
              const isSoftDeleted = carrier.status === 2;
              const statusActive = carrier.status === 1 || carrier.status === 0;

              return (
                <tr
                  key={carrier.id}
                  className={`hover:bg-slate-50/50 transition-colors group ${isSoftDeleted ? 'bg-slate-50/80' : ''
                    }`}
                >
                  {/* Número correlativo */}
                  <td className="pl-6 py-4 font-mono text-[11px] font-bold text-slate-300">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>

                  {/* Nombre / Correo */}
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <User size={14} className={`shrink-0 ${isSoftDeleted ? 'text-slate-300' : 'text-emerald-600'}`} />
                        <span className={`text-sm font-semibold leading-tight group-hover:text-emerald-700 transition-colors ${isSoftDeleted ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-900'
                          }`}>
                          {carrier.first_name} {carrier.last_name || ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 mt-1">
                        <Mail size={12} className="shrink-0" />
                        <span className="text-[10px] font-bold uppercase tracking-tight italic">{carrier.email}</span>
                      </div>
                    </div>
                  </td>

                  {/* Vehículo / Marca */}
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1.5">
                      <span className={`inline-flex items-center w-fit px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm ${isSoftDeleted ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                        }`}>
                        <Truck size={10} className="mr-1" />
                        {carrier.vehicle_type}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-0.5">
                        {carrier.brand}
                      </span>
                    </div>
                  </td>

                  {/* Placa */}
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white rounded-lg text-[11px] font-bold text-slate-700 border border-slate-200 shadow-sm">
                      <Hash size={10} className="text-slate-400" />
                      {carrier.plate_number || 'S/P'}
                    </span>
                  </td>

                  {/* Estado */}
                  <td className="px-4 py-4">
                    {isSoftDeleted ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-slate-100 text-slate-500 border-slate-200">
                        Eliminado
                      </span>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${statusActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-red-50 text-red-700 border-red-100'
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusActive ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]'}`} />
                        {statusActive ? 'Activo' : 'Inactivo'}
                      </span>
                    )}
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-1.5">
                      {isSoftDeleted ? (
                        <Button
                          onClick={() => onReactivate?.(carrier)}
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all"
                        >
                          <RotateCcw size={14} />
                          Reactivar
                        </Button>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5 opacity-40 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onView(carrier)}
                            className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg hover:shadow-md hover:shadow-indigo-100 transition-all"
                            title="Ver Detalles"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onEdit(carrier)}
                            className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg hover:shadow-md hover:shadow-emerald-100 transition-all"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Eliminar"
                            onClick={() => onDelete(carrier)}
                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg hover:shadow-md hover:shadow-red-100 transition-all"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* Empty state */}
            {carriers.length === 0 && (
              <tr>
                <td colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                      <AlertCircle className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-1">No hay transportistas</h3>
                    <p className="text-slate-500">No se encontraron resultados en esta categoría.</p>
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