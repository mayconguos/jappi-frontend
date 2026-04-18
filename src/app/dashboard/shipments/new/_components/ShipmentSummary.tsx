import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Truck, Receipt, CreditCard, Wallet } from 'lucide-react';
import { ShipmentFormData } from '@/lib/validations/shipment';
import { REGIONES_LIMA, PAYMENT_FORMS, PAYMENT_METHODS } from '@/constants/formOptions';

interface ShipmentSummaryProps {
  watchedValues?: Partial<ShipmentFormData>;
  isSubmitting?: boolean;
  disabled?: boolean;
  price?: number | null;
  isPriceLoading?: boolean;
}

export default function ShipmentSummary({ watchedValues, isSubmitting, disabled, price, isPriceLoading }: ShipmentSummaryProps) {
  const serviceType = watchedValues?.service?.type === 'express' ? 'Express' : 'Regular';
  const paymentFormLabel = PAYMENT_FORMS.find(f => f.value === watchedValues?.service?.payment_form)?.label || '-';
  const paymentMethodLabel = PAYMENT_METHODS.find(m => m.value === watchedValues?.service?.payment_method)?.label || '-';

  // Datos de Ruta
  const originDistrict = watchedValues?.sender?.address?.id_district
    ? REGIONES_LIMA.find(r => r.value === watchedValues.sender?.address?.id_district)?.label
    : (watchedValues?.service?.origin_type === 'stock' ? 'Almacén Japi' : '-');

  const destDistrictId = watchedValues?.recipient?.address?.id_district;
  // Nota: Para distritos reales necesitaríamos el catálogo completo, aquí simulamos o mostramos el ID si no tenemos el nombre mapeado síncronamente
  // En una app real, idealmente pasaríamos el nombre del distrito desde el componente padre o usaríamos un hook de catálogo aquí.
  // Por simplicidad visual inmediata:
  const destDistrict = destDistrictId ? 'Distrito Seleccionado' : '-';


  return (
    <Card variant="flat" className="bg-white border-gray-200 shadow-sm sticky top-24">
      <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Receipt size={18} className="text-gray-500" />
          Resumen de la Orden
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">

        {/* Sección: Ruta */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ruta</h4>
          <div className="flex flex-col gap-2 relative pl-3 border-l-2 border-slate-100">
            <div className="text-sm">
              <span className="text-gray-500 text-xs block">Origen</span>
              <span className="font-medium text-gray-900 line-clamp-1">
                {watchedValues?.service?.origin_type === 'stock' ? 'Almacén Japi' : (watchedValues?.sender?.address?.address || 'Dirección de Recojo')}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500 text-xs block">Destino</span>
              <span className="font-medium text-gray-900 line-clamp-1">
                {watchedValues?.recipient?.address?.address || 'Dirección de Entrega'}
              </span>
            </div>
          </div>
        </div>

        {/* Detalles Generales */}
        <div className="space-y-3 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 flex items-center gap-2">
              <Truck size={16} /> Tipo de Servicio
            </span>
            <span className="font-medium text-gray-900">{serviceType}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 flex items-center gap-2">
              <CreditCard size={16} /> Destino de Pago
            </span>
            <span className="font-medium text-gray-900">{paymentFormLabel}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 flex items-center gap-2">
              <Wallet size={16} /> Método de Pago
            </span>
            <span className="font-medium text-gray-900">{paymentMethodLabel}</span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          {/* Fila de Recaudación (C.O.D) */}
          {watchedValues?.service?.delivery_mode === 'pay_on_delivery' && (watchedValues?.service?.cod_amount || 0) > 0 && (
            <div className="flex items-baseline justify-between mb-3 pb-3 border-b border-dashed border-gray-200">
              <span className="text-sm font-semibold text-blue-600">A recaudar (C.O.D):</span>
              <span className="text-sm font-bold text-blue-600">
                S/ {(watchedValues.service?.cod_amount || 0).toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex items-baseline justify-between mb-1">
            <span className="text-sm font-medium text-gray-600">Subtotal</span>
            <span className="text-sm font-medium text-gray-900">
              {isPriceLoading ? (
                <span className="text-[10px] text-gray-400 animate-pulse">Calculando...</span>
              ) : (
                `S/ ${(price || 0).toFixed(2)}`
              )}
            </span>
          </div>
          {watchedValues?.service?.require_invoice && (
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-sm font-medium text-gray-600">IGV (18%)</span>
              <span className="text-sm font-medium text-gray-900">
                {isPriceLoading ? (
                  <span className="text-[10px] text-gray-400 animate-pulse">Calculando...</span>
                ) : (
                  `S/ ${((price || 0) * 0.18).toFixed(2)}`
                )}
              </span>
            </div>
          )}
          <div className="flex items-baseline justify-between">
            <span className="text-base font-bold text-gray-800">Total Estimado</span>
            <span className="text-2xl font-bold text-[#02997d]">
              {isPriceLoading ? (
                <span className="text-sm text-gray-300 animate-pulse">Cargando...</span>
              ) : (
                `S/ ${(watchedValues?.service?.require_invoice ? (price || 0) * 1.18 : (price || 0)).toFixed(2)}`
              )}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-right">
            *Precio sujeto a validación final en almacén
          </p>
        </div>

      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button
          type="submit"
          form="shipment-form"
          disabled={isSubmitting || disabled}
          className="w-full bg-[#02997d] hover:bg-[#028870] text-white h-12 rounded-xl shadow-lg shadow-teal-900/10 hover:shadow-xl hover:scale-[1.02] transition-all text-base font-bold"
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-2">⏳</span> Procesando...
            </>
          ) : (
            <>
              <span className="mr-2">🚀</span> Registrar Envío
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
