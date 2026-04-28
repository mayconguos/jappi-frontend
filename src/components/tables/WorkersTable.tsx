import { Edit, Trash2, User, Mail, CreditCard, Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUserRoleLabel } from '@/constants/userRoles';
import { Worker } from '@/app/dashboard/accounts/workers/page';

interface WorkersTableProps {
  workers: Worker[];
  currentPage: number;
  itemsPerPage?: number;
  onEdit: (worker: Worker) => void;
  onDelete: (worker: Worker) => void;
}

export default function WorkersTable({
  workers,
  currentPage,
  itemsPerPage = 10,
  onEdit,
  onDelete,
}: Readonly<WorkersTableProps>) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-2 py-3 text-center w-8">#</th>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Rol / Cargo</th>
              <th className="px-4 py-3">Documento</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right pr-6">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {workers.map((worker, index) => {
              const isSoftDeleted = worker.status === 2;
              const statusActive = worker.status === 1 || worker.status === 0;

              return (
                <tr
                  key={worker.id}
                  className={`hover:bg-slate-50/50 transition-colors group ${isSoftDeleted ? 'bg-slate-50/80' : ''}`}
                >
                  {/* Número correlativo */}
                  <td className="px-2 py-3 whitespace-nowrap text-center font-mono text-[11px] font-bold text-slate-300">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>

                  {/* Usuario (Nombre / Correo) */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center border shadow-sm shrink-0 ${
                        isSoftDeleted ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-slate-50 border-slate-100 text-emerald-600'
                      }`}>
                        <User size={16} />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className={`text-sm font-semibold leading-tight group-hover:text-emerald-700 transition-colors ${
                          isSoftDeleted ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-900'
                        }`}>
                          {worker.first_name} {worker.last_name || ''}
                        </span>
                        <div className="flex items-center gap-1.5 text-slate-400 mt-0.5">
                          <Mail size={12} className="shrink-0" />
                          <span className="text-[10px] font-bold uppercase tracking-tight italic">{worker.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Rol / Cargo */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
                      isSoftDeleted ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                    }`}>
                      <Shield size={10} className="mr-1" />
                      {getUserRoleLabel(worker.id_role)}
                    </span>
                  </td>

                  {/* Documento */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white rounded-lg text-[11px] font-bold text-slate-700 border border-slate-200 shadow-sm">
                      <CreditCard size={10} className="text-slate-400" />
                      {worker.document_number || 'S/D'}
                    </span>
                  </td>

                  {/* Estado */}
                  <td className="px-4 py-3">
                    {isSoftDeleted ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-slate-100 text-slate-500 border-slate-200">
                        Eliminado
                      </span>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
                        statusActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          statusActive ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]'
                        }`} />
                        {statusActive ? 'Activo' : 'Inactivo'}
                      </span>
                    )}
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3 text-right pr-6">
                    {!isSoftDeleted && (
                      <div className="flex items-center justify-end gap-1.5 opacity-40 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onEdit(worker)}
                          className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg hover:shadow-md hover:shadow-emerald-100 transition-all"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Eliminar"
                          onClick={() => onDelete(worker)}
                          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg hover:shadow-md hover:shadow-red-100 transition-all"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}

            {/* Empty state */}
            {workers.length === 0 && (
              <tr>
                <td colSpan={6} className="py-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                      <AlertCircle className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-1">No hay usuarios</h3>
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
