'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, FileSpreadsheet, X, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LocationCatalog } from '@/hooks/useLocationCatalog';
import { parseShipmentExcel, type ParseResult } from '@/lib/bulk-shipment-parser';

interface UploadStepProps {
  onBack: () => void;
  onParsed: (result: ParseResult) => void;
  catalogLoading: boolean;
  catalog: LocationCatalog | null;
}

export default function UploadStep({ onBack, onParsed, catalogLoading, catalog }: UploadStepProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const ACCEPTED = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ];

  const handleFile = useCallback((f: File) => {
    if (!ACCEPTED.includes(f.type) && !f.name.endsWith('.xlsx') && !f.name.endsWith('.xls')) {
      setParseError('Solo se aceptan archivos .xlsx o .xls');
      return;
    }
    setParseError(null);
    setFile(f);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  };

  const handleParse = async () => {
    if (!file) return;
    setIsParsing(true);
    setParseError(null);
    try {
      const result = await parseShipmentExcel(file, catalog);
      if (result.totalRows === 0) {
        setParseError('El archivo está vacío o no tiene filas de datos.');
        return;
      }
      onParsed(result);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Error al procesar el archivo.');
    } finally {
      setIsParsing(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Dropzone */}
      <div
        onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl transition-all duration-300
          ${file
            ? 'border-emerald-300 bg-emerald-50'
            : dragActive
              ? 'border-blue-400 bg-blue-50 scale-[1.01]'
              : 'border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-gray-50'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleInputChange}
        />

        {file ? (
          /* Archivo seleccionado */
          <div className="p-12 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center">
              <FileSpreadsheet className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-lg">{file.name}</p>
              <p className="text-sm text-gray-400 mt-1">{formatBytes(file.size)}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null); setParseError(null); }}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors mt-1"
            >
              <X className="w-3.5 h-3.5" />
              Quitar archivo
            </button>
          </div>
        ) : (
          /* Estado vacío - Botón nativo para clic */
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full p-12 flex flex-col items-center gap-4 group outline-none focus:ring-2 focus:ring-blue-400 rounded-2xl"
          >
            <div
              className={`
                w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300
                ${dragActive
                  ? 'bg-blue-100 border border-blue-300 scale-110'
                  : 'bg-white border border-gray-200 shadow-sm group-hover:scale-105 group-hover:border-gray-300'
                }
              `}
            >
              <Upload
                className={`w-8 h-8 transition-colors ${dragActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'}`}
              />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-700">
                {dragActive ? 'Suelta el archivo aquí' : 'Arrastra tu archivo Excel'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                o <span className="text-blue-600 underline underline-offset-2 font-medium">selecciona desde tu equipo</span>
              </p>
              <p className="text-xs text-gray-300 mt-3">Formatos aceptados: .xlsx, .xls</p>
            </div>
          </button>
        )}
      </div>

      {/* Error */}
      {parseError && (
        <div className="mt-4 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{parseError}</p>
        </div>
      )}

      {/* Catalog loading notice */}
      {catalogLoading && (
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
          <span className="w-3 h-3 border border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          Cargando catálogo de ubicaciones para validación...
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        <Button
          onClick={handleParse}
          disabled={!file || isParsing || catalogLoading}
          variant="primary"
          size="lg"
          className="px-10"
          isLoading={isParsing}
        >
          {isParsing ? 'Procesando...' : 'Validar archivo →'}
        </Button>
      </div>
    </div>
  );
}
