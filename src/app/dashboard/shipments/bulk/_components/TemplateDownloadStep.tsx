'use client';

import { useState } from 'react';
import { Download, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadBulkShipmentTemplate } from '@/lib/bulk-shipment-template';

interface TemplateDownloadStepProps {
  onNext: () => void;
}

export default function TemplateDownloadStep({ onNext }: TemplateDownloadStepProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadBulkShipmentTemplate();
      setDownloaded(true);
    } catch (error) {
      console.error('Error al descargar plantilla:', error);
    } finally {
      setIsDownloading(false);
    }
  };

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

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className={`
            inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-base
            transition-all duration-300 border
            ${downloaded
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white border-transparent shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:scale-95'
            }
            disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0
          `}
        >
          {isDownloading ? (
            <>
              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Generando archivo...
            </>
          ) : downloaded ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Descargada correctamente
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Descargar Plantilla Excel
            </>
          )}
        </button>
      </div>

      {/* Instrucciones */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            step: '1',
            title: 'Abre la plantilla',
            desc: 'Abre el archivo .xlsx en Excel o Google Sheets.',
            color: 'blue',
          },
          {
            step: '2',
            title: 'Llena los datos',
            desc: 'Completa cada fila con la información de un envío. Usa los dropdowns para tipo y modo.',
            color: 'amber',
          },
          {
            step: '3',
            title: 'Guarda el archivo',
            desc: 'Guarda como .xlsx y tenlo listo para subir en el siguiente paso.',
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
              {item.step}
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
          <span className="font-semibold">Importante:</span> Los IDs de Región, Distrito y Sector
          deben coincidir exactamente con el catálogo de Japi Express. Consulta con tu ejecutivo
          de cuenta si tienes dudas.
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
