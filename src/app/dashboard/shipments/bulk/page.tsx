'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLocationCatalog } from '@/hooks/useLocationCatalog';
import type { ParseResult } from '@/lib/bulk-shipment-parser';
import { RotateCcw } from 'lucide-react';

import StepIndicator from './_components/StepIndicator';
import TemplateDownloadStep from './_components/TemplateDownloadStep';
import UploadStep from './_components/UploadStep';
import PreviewStep from './_components/PreviewStep';
import ConfirmStep from './_components/ConfirmStep';
import { Button } from '@/components/ui/button';

type Step = 1 | 2 | 3 | 4;

export default function BulkShipmentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { catalog, loading: catalogLoading } = useLocationCatalog();

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [finishResult, setFinishResult] = useState<{ success: number; fail: number } | null>(null);

  const idCompany = user?.id_company || user?.id;

  const handleParsed = (result: ParseResult) => {
    setParseResult(result);
    setCurrentStep(3);
  };

  const handleConfirm = () => {
    setCurrentStep(4);
  };

  const handleFinish = (successCount: number, failCount: number) => {
    setFinishResult({ success: successCount, fail: failCount });
  };

  const handleReset = () => {
    setCurrentStep(1);
    setParseResult(null);
    setFinishResult(null);
  };

  const isSuccess = finishResult && finishResult.fail === 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16">

      {/* ── Step Indicator ─────────────────────────────────────────── */}
      {!finishResult && (
        <div className="mb-4 bg-white border border-gray-100 rounded-2xl px-6 py-4 shadow-sm">
          <StepIndicator currentStep={currentStep} />
        </div>
      )}



      {/* ── Main Content Card ──────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-7 shadow-sm">

        {/* PASO 1 */}
        {currentStep === 1 && (
          <TemplateDownloadStep
            onNext={() => setCurrentStep(2)}
            catalog={catalog}
            catalogLoading={catalogLoading}
          />
        )}

        {/* PASO 2 */}
        {currentStep === 2 && (
          <UploadStep
            onBack={() => setCurrentStep(1)}
            onParsed={handleParsed}
            catalog={catalog}
            catalogLoading={catalogLoading}
          />
        )}

        {/* PASO 3 */}
        {currentStep === 3 && parseResult && (
          <PreviewStep
            result={parseResult}
            onBack={() => setCurrentStep(2)}
            onConfirm={handleConfirm}
          />
        )}

        {/* PASO 4 */}
        {currentStep === 4 && parseResult && idCompany && (
          <>
            {!finishResult ? (
              <ConfirmStep
                result={parseResult}
                idCompany={idCompany}
                onBack={() => setCurrentStep(3)}
                onFinish={handleFinish}
              />
            ) : (
              /* Pantalla final post-envío */
              <div className="text-center py-6 animate-in fade-in zoom-in-95 duration-500 space-y-6">
                {/* Icon */}
                <div
                  className={`
                    mx-auto w-24 h-24 rounded-3xl flex items-center justify-center text-5xl
                    border shadow-sm
                    ${isSuccess
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-amber-50 border-amber-200'
                    }
                  `}
                >
                  {isSuccess ? '🎉' : '⚠️'}
                </div>

                {/* Text */}
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">
                    {isSuccess ? '¡Carga completada con éxito!' : 'Carga finalizada'}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {finishResult!.success} envíos creados correctamente
                    {finishResult!.fail > 0 ? `, ${finishResult!.fail} fallaron.` : '.'}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <div className="flex flex-col items-center bg-emerald-50 border border-emerald-100 rounded-2xl px-8 py-4 min-w-[100px] shadow-sm">
                    <span className="text-3xl font-black text-emerald-600">{finishResult!.success}</span>
                    <span className="text-[11px] text-gray-400 mt-1 uppercase tracking-wide">Exitosos</span>
                  </div>
                  {finishResult!.fail > 0 && (
                    <div className="flex flex-col items-center bg-red-50 border border-red-100 rounded-2xl px-8 py-4 min-w-[100px] shadow-sm">
                      <span className="text-3xl font-black text-red-600">{finishResult!.fail}</span>
                      <span className="text-[11px] text-gray-400 mt-1 uppercase tracking-wide">Fallidos</span>
                    </div>
                  )}
                </div>

                {/* CTAs */}
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:border-gray-300 hover:text-slate-700 transition-all duration-200 bg-white shadow-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Nueva carga masiva
                  </button>
                  <Button
                    onClick={() => router.push('/dashboard/shipments/list')}
                    variant="primary"
                  >
                    Ver mis envíos →
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
