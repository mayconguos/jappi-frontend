'use client';

import { useState } from 'react';
import { Download, CheckCircle2, AlertCircle, BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadBulkShipmentTemplate } from '@/lib/bulk-shipment-template';
import { TEMPLATE_VERSION_LABEL } from '@/lib/template-version';
import type { LocationCatalog } from '@/hooks/useLocationCatalog';

interface TemplateDownloadStepProps {
  onNext: () => void;
  catalog: LocationCatalog | null;
  catalogLoading: boolean;
}

export default function TemplateDownloadStep({ onNext, catalog, catalogLoading }: TemplateDownloadStepProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadBulkShipmentTemplate(catalog);
      setDownloaded(true);
    } catch (error) {
      console.error('Error al descargar plantilla:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const canDownload = !catalogLoading && !isDownloading;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Card */}
      <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Descarga la Plantilla</h2>
        <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto leading-relaxed">
          Usa nuestra plantilla Excel pre-formateada con validaciones integradas.
          Los campos en <span className="text-amber-500 font-semibold">amarillo</span> son obligatorios
          y los <span className="text-slate-600 font-semibold">grises</span> son opcionales.
        </p>

        {/* Catalog status pill */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {catalogLoading ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Cargando catálogo de ubicaciones...
            </span>
          ) : catalog ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Catálogo incluido en la plantilla ({catalog.length} regiones)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
              <AlertCircle className="w-3.5 h-3.5" />
              Catálogo no disponible — la plantilla se generará sin hoja de referencia
            </span>
          )}
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={!canDownload}
          className={`
            inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-base
            transition-all duration-300 border
            ${downloaded
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
              : canDownload
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-transparent shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:scale-95'
                : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generando plantilla {TEMPLATE_VERSION_LABEL}...
            </>
          ) : downloaded ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Descargada — plantilla {TEMPLATE_VERSION_LABEL}
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Descargar Plantilla Excel {TEMPLATE_VERSION_LABEL}
            </>
          )}
        </button>

        {/* Version badge */}
        <p className="mt-3 text-[11px] text-gray-400">
          Plantilla {TEMPLATE_VERSION_LABEL} · Solo se aceptan archivos generados con esta versión
        </p>
      </div>

      {/* Instrucciones */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            step: '1',
            icon: <Download className="w-3.5 h-3.5" />,
            title: 'Descarga y abre la plantilla',
            desc: 'Abre el archivo .xlsx en Excel o Google Sheets. Verás la hoja "Envíos" y una hoja "Catálogo" de referencia.',
            color: 'blue',
          },
          {
            step: '2',
            icon: <BookOpen className="w-3.5 h-3.5" />,
            title: 'Consulta el catálogo',
            desc: 'Ve a la hoja "Catálogo" para ver los IDs de Región, Distrito y Sector. Al ingresar un ID en Envíos, las columnas Q/R/S confirman el nombre automáticamente.',
            color: 'amber',
          },
          {
            step: '3',
            icon: <CheckCircle2 className="w-3.5 h-3.5" />,
            title: 'Guarda y sube',
            desc: 'Guarda como .xlsx (no cambies el formato) y tenlo listo para el siguiente paso.',
            color: 'emerald',
          },
        ].map((item) => (
          <div
            key={item.step}
            className="bg-white border border-gray-100 rounded-xl p-3 flex gap-3 shadow-sm hover:shadow-md transition-shadow"
          >
            <div
              className={`
                w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5
                ${item.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                  item.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                    'bg-emerald-100 text-emerald-600'}
              `}
            >
              {item.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 mb-0.5">{item.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Warning */}
      <div className="mt-3 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
        <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-700 leading-relaxed">
          <span className="font-semibold">Importante:</span> Solo se aceptarán archivos generados
          con la plantilla {TEMPLATE_VERSION_LABEL} oficial. Subir una versión anterior o un archivo
          distinto será rechazado en el paso de Upload.
        </p>
      </div>

      {/* Siguiente */}
      <div className="mt-6 flex justify-end">
        <Button
          onClick={onNext}
          variant="primary"
          size="lg"
          className="px-10"
        >
          Continuar — Subir Excel →
        </Button>
      </div>
    </div>
  );
}
