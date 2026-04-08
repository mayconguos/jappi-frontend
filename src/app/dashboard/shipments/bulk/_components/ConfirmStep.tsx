'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ParseResult } from '@/lib/bulk-shipment-parser';
import { rowToApiPayload } from '@/lib/bulk-shipment-parser';
import api from '@/app/services/api';

interface ConfirmStepProps {
  result: ParseResult;
  idCompany: number | string;
  onBack: () => void;
  onFinish: (successCount: number, failCount: number) => void;
}

type SendStatus = 'idle' | 'sending' | 'done';

interface RowResult {
  rowIndex: number;
  customer_name: string;
  success: boolean;
  error?: string;
}

export default function ConfirmStep({ result, idCompany, onBack, onFinish }: ConfirmStepProps) {
  const [status, setStatus] = useState<SendStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [rowResults, setRowResults] = useState<RowResult[]>([]);

  const validRows = result.rows.filter((r) => r.isValid);
  const total = validRows.length;

  const handleSend = async () => {
    console.log('handleSend');
    // setStatus('sending');
    // setProgress(0);
    // const results: RowResult[] = [];

    // // Obtener token
    // const token = localStorage.getItem('token');
    // const headers = { authorization: `${token}` };

    // for (let i = 0; i < validRows.length; i++) {
    //   const row = validRows[i];
    //   const payload = rowToApiPayload(row, idCompany);

    //   try {
    //     await api.post('/shipping', payload, { headers });
    //     results.push({ rowIndex: row.rowIndex, customer_name: row.customer_name, success: true });
    //   } catch (err: any) {
    //     const msg = err?.response?.data?.message || err?.message || 'Error desconocido';
    //     results.push({ rowIndex: row.rowIndex, customer_name: row.customer_name, success: false, error: msg });
    //   }

    //   setProgress(i + 1);
    //   setRowResults([...results]);
    // }

    setStatus('done');
    // const successCount = results.filter((r) => r.success).length;
    // const failCount = results.filter((r) => !r.success).length;
    onFinish(successCount, failCount);
  };

  const successCount = rowResults.filter((r) => r.success).length;
  const failCount = rowResults.filter((r) => !r.success).length;
  const progressPercent = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      {status === 'idle' && (
        <>
          {/* Resumen */}
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-8 text-center shadow-sm">
            <div className="text-5xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Todo listo!</h2>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
              Se van a procesar <span className="text-slate-800 font-bold">{total} envíos</span> válidos
              en el sistema de Japi Express.
            </p>
            <div className="inline-flex items-center gap-4 bg-white rounded-xl px-6 py-3 border border-gray-100 shadow-sm mb-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{total}</p>
                <p className="text-[11px] text-gray-400">Envíos a crear</p>
              </div>
            </div>
          </div>

          {/* Advertencia */}
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 leading-relaxed">
              Esta acción creará {total} envíos en el sistema. Esta operación no se puede deshacer masivamente.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Revisar datos
            </button>

            <Button onClick={handleSend} variant="primary" size="lg" className="px-10">
              Crear {total} envíos ahora →
            </Button>
          </div>
        </>
      )}

      {status === 'sending' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-6">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-3" />
            <p className="text-lg font-semibold text-slate-800">Enviando envíos...</p>
            <p className="text-sm text-gray-400 mt-1">
              {progress} de {total} procesados
            </p>
          </div>

          {/* Barra de progreso */}
          <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-right text-xs text-gray-400 mt-1.5">{progressPercent}%</p>

          {/* Mini resultados en tiempo real */}
          {rowResults.length > 0 && (
            <div className="mt-4 space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {rowResults.map((r) => (
                <div
                  key={r.rowIndex}
                  className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border ${r.success
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                      : 'bg-red-50 border-red-100 text-red-700'
                    }`}
                >
                  {r.success ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span className="font-medium truncate">{r.customer_name}</span>
                  {!r.success && r.error && (
                    <span className="text-red-400 ml-auto truncate max-w-[200px]">{r.error}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {status === 'done' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center space-y-4 shadow-sm">
          <div className="text-5xl">
            {failCount === 0 ? '🎉' : '⚠️'}
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            {failCount === 0 ? '¡Carga completada!' : 'Carga con algunos errores'}
          </h2>
          <div className="flex items-center justify-center gap-6">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-8 py-4 text-center shadow-sm">
              <p className="text-3xl font-bold text-emerald-600">{successCount}</p>
              <p className="text-xs text-gray-400 mt-1">Enviados</p>
            </div>
            {failCount > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-2xl px-8 py-4 text-center shadow-sm">
                <p className="text-3xl font-bold text-red-600">{failCount}</p>
                <p className="text-xs text-gray-400 mt-1">Fallidos</p>
              </div>
            )}
          </div>

          {/* Detalle de fallos */}
          {failCount > 0 && (
            <div className="text-left mt-4 space-y-1.5 max-h-40 overflow-y-auto">
              {rowResults
                .filter((r) => !r.success)
                .map((r) => (
                  <div key={r.rowIndex} className="flex items-start gap-2 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-red-700 font-medium">{r.customer_name}</span>
                      {r.error && <p className="text-red-400 mt-0.5">{r.error}</p>}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
