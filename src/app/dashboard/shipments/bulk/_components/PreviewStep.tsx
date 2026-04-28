'use client';

import { useState } from 'react';
import { ArrowLeft, CheckCircle2, X, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ParseResult, BulkShipmentRow } from '@/lib/bulk-shipment-parser';

interface PreviewStepProps {
  result: ParseResult;
  onBack: () => void;
  onConfirm: () => void;
}

export default function PreviewStep({ result, onBack, onConfirm }: PreviewStepProps) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const { rows, totalRows, validCount, errorCount } = result;
  const canConfirm = errorCount === 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total filas" value={totalRows} color="blue" icon="📦" />
        <StatCard label="Válidos" value={validCount} color="emerald" icon="✅" />
        <StatCard label="Con errores" value={errorCount} color={errorCount > 0 ? 'red' : 'slate'} icon="❌" />
      </div>

      {/* Banner de bloqueo */}
      {!canConfirm && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">No se puede enviar aún</p>
            <p className="text-xs text-red-500 mt-0.5">
              Corrige los {errorCount} error{errorCount > 1 ? 'es' : ''} en el archivo Excel y vuelve a subirlo.
            </p>
          </div>
        </div>
      )}

      {/* Tabla de preview */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
          <p className="text-sm font-semibold text-slate-700">Vista previa de envíos</p>
          <p className="text-xs text-gray-400">{totalRows} filas detectadas</p>
        </div>

        {/* Header de tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-gray-400 font-semibold uppercase tracking-wide text-[10px] w-12">Fila</th>
                <th className="text-left px-4 py-3 text-gray-400 font-semibold uppercase tracking-wide text-[10px]">Estado</th>
                <th className="text-left px-4 py-3 text-gray-400 font-semibold uppercase tracking-wide text-[10px]">Destinatario</th>
                <th className="text-left px-4 py-3 text-gray-400 font-semibold uppercase tracking-wide text-[10px]">Teléfono</th>
                <th className="text-left px-4 py-3 text-gray-400 font-semibold uppercase tracking-wide text-[10px]">Servicio</th>
                <th className="text-left px-4 py-3 text-gray-400 font-semibold uppercase tracking-wide text-[10px]">Fecha</th>
                <th className="text-left px-4 py-3 text-gray-400 font-semibold uppercase tracking-wide text-[10px]">Producto</th>
                <th className="text-center px-4 py-3 text-gray-400 font-semibold w-10"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <RowPreview
                  key={row.rowIndex}
                  row={row}
                  isExpanded={expandedRow === row.rowIndex}
                  onToggle={() =>
                    setExpandedRow((prev) => (prev === row.rowIndex ? null : row.rowIndex))
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a subir
        </button>

        <Button
          onClick={onConfirm}
          disabled={!canConfirm}
          variant="primary"
          size="lg"
          className="px-10"
        >
          Confirmar y enviar {validCount} envíos →
        </Button>
      </div>
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: 'blue' | 'emerald' | 'red' | 'slate';
  icon: string;
}) {
  const colorMap = {
    blue: 'bg-blue-50 border-blue-100 text-blue-600',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    red: 'bg-red-50 border-red-100 text-red-600',
    slate: 'bg-gray-50 border-gray-100 text-gray-400',
  };

  return (
    <div className={`${colorMap[color]} border rounded-2xl p-5 text-center shadow-sm`}>
      <div className="text-3xl mb-1">{icon}</div>
      <div className={`text-3xl font-bold ${colorMap[color].split(' ').pop()}`}>{value}</div>
      <div className="text-xs text-gray-400 mt-1 font-medium">{label}</div>
    </div>
  );
}

function RowPreview({
  row,
  isExpanded,
  onToggle,
}: {
  row: BulkShipmentRow;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const hasWarnings = row.warnings.length > 0;
  const rowBg = row.isValid
    ? isExpanded
      ? 'bg-emerald-50/50'
      : 'hover:bg-emerald-50/50'
    : isExpanded
      ? 'bg-red-50/60'
      : 'hover:bg-red-50/40';

  return (
    <>
      <tr
        className={`
          border-b border-gray-50 transition-colors
          ${row.isValid ? 'border-l-2 border-l-emerald-400' : 'border-l-2 border-l-red-400'}
          ${rowBg}
        `}
      >
        <td className="px-4 py-3 text-gray-400 font-mono text-[11px]">{row.rowIndex}</td>
        <td className="px-4 py-3">
          {row.isValid ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-emerald-700 bg-emerald-100 text-[10px] font-semibold">
              <CheckCircle2 className="w-3 h-3" /> Válido
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-red-700 bg-red-100 text-[10px] font-semibold">
              <X className="w-3 h-3" /> {row.errors.length} error{row.errors.length > 1 ? 'es' : ''}
            </span>
          )}
          {hasWarnings && (
            <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-amber-700 bg-amber-100 text-[10px] font-semibold">
              <AlertTriangle className="w-3 h-3" /> {row.warnings.length}
            </span>
          )}
        </td>
        <td className="px-4 py-3 text-slate-700 font-medium truncate max-w-[140px]">{row.customer_name || '—'}</td>
        <td className="px-4 py-3 text-gray-500 font-mono text-[11px]">{row.phone || '—'}</td>
        <td className="px-4 py-3">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
              row.service_type === 'express'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {row.service_type || '—'}
          </span>
        </td>
        <td className="px-4 py-3 text-gray-400 font-mono text-[11px]">{row.date || '—'}</td>
        <td className="px-4 py-3 text-gray-500 truncate max-w-[120px] text-[11px]">{row.product_name || '—'}</td>
        <td className="px-4 py-3 text-center">
          <button
            type="button"
            onClick={onToggle}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors mx-auto focus:ring-2 focus:ring-blue-400 outline-none"
            title={isExpanded ? "Contraer" : "Ver detalles"}
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </td>
      </tr>

      {/* Expanded errors/warnings */}
      {isExpanded && (row.errors.length > 0 || row.warnings.length > 0) && (
        <tr className="border-b border-gray-50">
          <td colSpan={8} className="px-6 py-3 bg-gray-50/80">
            {row.errors.length > 0 && (
              <div className="space-y-1.5 mb-2">
                {row.errors.map((err, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-red-600">
                    <X className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    {err}
                  </div>
                ))}
              </div>
            )}
            {row.warnings.length > 0 && (
              <div className="space-y-1.5">
                {row.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-amber-600">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    {w}
                  </div>
                ))}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
