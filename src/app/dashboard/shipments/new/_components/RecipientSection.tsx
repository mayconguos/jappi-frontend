import { UseFormReturn } from 'react-hook-form';
import { MapPin, CheckCircle2, Edit2, User, Phone, Mail } from 'lucide-react';
import { clsx } from 'clsx';
import { useState, useEffect, useRef } from 'react';

import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DeliveryConfiguration from '@/components/shipment/DeliveryConfiguration';
import api from '@/app/services/api';

import { useLocationCatalog } from '@/hooks/useLocationCatalog';
import { type ShipmentFormData } from '@/lib/validations/shipment';

interface RecipientSectionProps {
  form: UseFormReturn<ShipmentFormData>;
  isActive: boolean;
  isCompleted: boolean;
  onContinue: () => void; // Prop crítica para avanzar
  onEdit?: () => void;
  onBack?: () => void;
  price?: number | null;
  isPriceLoading?: boolean;
}

export default function RecipientSection({ form, isActive, isCompleted, onContinue, onEdit, onBack, price, isPriceLoading }: RecipientSectionProps) {
  const { getRegionOptions, getDistrictOptions, getSectorOptions } = useLocationCatalog();
  const { formState: { errors }, watch, setValue, trigger, register } = form;
  const watchedValues = watch();
  const [isValidating, setIsValidating] = useState(false);
  const [referencePrice, setReferencePrice] = useState<number | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);

  const selectedRegion = watchedValues.recipient?.address?.id_region;
  const selectedDistrict = watchedValues.recipient?.address?.id_district;
  const selectedSector = watchedValues.recipient?.address?.id_sector;

  const addressRef = useRef<HTMLDivElement>(null);
  const configRef = useRef<HTMLDivElement>(null);

  const districtHasSectors = selectedDistrict ? getSectorOptions(selectedDistrict).length > 0 : false;

  const isPersonalComplete = 
    (watchedValues.recipient?.full_name?.length || 0) > 2 && 
    (watchedValues.recipient?.phone?.length || 0) >= 9;

  const isAddressComplete = 
    isPersonalComplete && 
    (watchedValues.recipient?.address?.id_region || 0) > 0 &&
    (watchedValues.recipient?.address?.id_district || 0) > 0 &&
    (watchedValues.recipient?.address?.address?.length || 0) > 4 &&
    (!districtHasSectors || (watchedValues.recipient?.address?.id_sector || 0) > 0);

  const prevPersonalComplete = useRef(isPersonalComplete);
  const prevAddressComplete = useRef(isAddressComplete);

  useEffect(() => {
    if (isActive && !prevPersonalComplete.current && isPersonalComplete) {
      setTimeout(() => {
        addressRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    }
    prevPersonalComplete.current = isPersonalComplete;
  }, [isPersonalComplete, isActive]);

  useEffect(() => {
    if (isActive && !prevAddressComplete.current && isAddressComplete) {
      setTimeout(() => {
        configRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
    }
    prevAddressComplete.current = isAddressComplete;
  }, [isAddressComplete, isActive]);

  // Obsolete internal price fetch removed to use centralized logic from parent

  const regionOptions = getRegionOptions();
  const recipientDistrictOptions = getDistrictOptions(selectedRegion || 0);
  const recipientSectorOptions = getSectorOptions(selectedDistrict || 0);

  const handleContinue = async () => {
    setIsValidating(true);

    // Lista de campos a validar en esta sección
    const fieldsToValidate: (keyof ShipmentFormData | `recipient.${string}`)[] = [
      'recipient.full_name',
      'recipient.phone',
      'recipient.email', // Opcional pero verificamos formato correcto si está lleno
      'recipient.address.id_region',
      'recipient.address.id_district',
      'recipient.address.address',
      'recipient.address.reference'
    ];

    if (districtHasSectors) {
      fieldsToValidate.push('recipient.address.id_sector' as any);
    }

    // Ejecutar validación
    const isValid = await trigger(fieldsToValidate as any);

    setIsValidating(false);

    if (isValid) {
      onContinue();
    }
  };

  return (
    <div className={clsx(
      "transition-all duration-500 ease-in-out",
      isActive ? "opacity-100 translate-y-0" : (isCompleted ? "opacity-60" : "opacity-40 translate-y-4 pointer-events-none")
    )}>
      <Card className="overflow-hidden border-gray-200 shadow-sm bg-white">

        {/* HEADER */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className={clsx(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
              isCompleted ? "bg-emerald-100 text-emerald-600" : "bg-[#02997d]/10 text-[#02997d]"
            )}>
              {isCompleted ? <CheckCircle2 size={18} /> : <span>2</span>}
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Datos del Destinatario
              </h3>
              {!isCompleted && <p className="text-xs text-gray-500">A quién entregamos el paquete</p>}
            </div>
          </div>

          {isCompleted && onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="px-4 py-1.5 text-xs font-bold bg-white border border-gray-200 text-gray-700 rounded-lg hover:border-[#02997d] hover:text-[#02997d] hover:bg-[#02997d]/5 transition-all flex items-center shadow-sm"
            >
              <Edit2 size={14} className="mr-1.5" />
              Modificar
            </button>
          )}
        </div>

        {/* BODY */}
        <div className={clsx(
          "transition-all duration-500",
          !isActive && !isCompleted ? "max-h-0 py-0 opacity-0 overflow-hidden" : "max-h-[2000px] opacity-100"
        )}>
          <div className="p-6 space-y-8">

            {/* Grid: Datos Personales con Iconos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <User size={14} className="text-gray-400" />
                  <label className="text-sm font-medium text-gray-700">Nombre Completo / Razón Social *</label>
                </div>
                <Input
                  value={watchedValues.recipient?.full_name || ''}
                  onChange={async (e) => {
                    const value = e.target.value;
                    setValue('recipient.full_name', value.toUpperCase());
                    await trigger('recipient.full_name');
                  }}
                  error={errors.recipient?.full_name?.message}
                  className="h-10 border-gray-200 focus:border-[#02997d]"
                  placeholder="Ej. Juan Pérez / Empresa S.A.C."
                />
              </div>

              <div className="md:col-span-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <Phone size={14} className="text-gray-400" />
                  <label className="text-sm font-medium text-gray-700">Teléfono *</label>
                </div>
                <Input
                  value={watchedValues.recipient?.phone || ''}
                  onChange={async (e) => {
                    const value = e.target.value;
                    const numericValue = value.replace(/\D/g, '');
                    setValue('recipient.phone', numericValue);
                    await trigger('recipient.phone');
                  }}
                  error={errors.recipient?.phone?.message}
                  maxLength={9}
                  prefix="+51"
                  className="h-10 border-gray-200 focus:border-[#02997d]"
                  placeholder="999 999 999"
                />
              </div>

            </div>

            {/* Dirección de Entrega (Bloque Contenido) */}
            {isPersonalComplete && (
              <div ref={addressRef} className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <MapPin size={14} /> Dirección de Entrega
              </h4>

              {/* Fila 1: Selectores (Fondo Blanco) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Región */}
                <div className="relative">
                  <Select
                    label="Región *"
                    value={watchedValues.recipient?.address?.id_region?.toString() || ''}
                    options={regionOptions}
                    onChange={async (value) => {
                      setValue('recipient.address.id_region', parseInt(value));
                      setValue('recipient.address.id_district', 0);
                      setValue('recipient.address.id_sector', 0);
                      await trigger(['recipient.address.id_region', 'recipient.address.id_district']);
                    }}
                    error={errors.recipient?.address?.id_region?.message}
                  />
                </div>

                {/* Distrito */}
                <div className={clsx("transition-all duration-300 ease-in-out relative", selectedRegion ? 'opacity-100' : 'opacity-50 pointer-events-none')}>
                  <Select
                    label="Distrito *"
                    value={watchedValues.recipient?.address?.id_district?.toString() || ''}
                    options={recipientDistrictOptions}
                    onChange={async (value) => {
                      setValue('recipient.address.id_district', parseInt(value));
                      setValue('recipient.address.id_sector', 0);
                      await trigger(['recipient.address.id_district', 'recipient.address.id_sector']);
                    }}
                    error={errors.recipient?.address?.id_district?.message}
                  />
                </div>

                {/* Sector */}
                {districtHasSectors ? (
                  <div className="animate-in fade-in slide-in-from-top-2 relative">
                    <Select
                      label="Sector *"
                      value={watchedValues.recipient?.address?.id_sector?.toString() || ''}
                      options={recipientSectorOptions}
                      onChange={async (value) => {
                        setValue('recipient.address.id_sector', parseInt(value));
                        await trigger('recipient.address.id_sector');
                      }}
                      error={errors.recipient?.address?.id_sector?.message}
                    />
                  </div>
                ) : (
                  <div className="hidden md:block"></div>
                )}
              </div>

              {/* Costo de delivery Referencial (Centralized Logic) */}
              {!!selectedDistrict && (price !== null || isPriceLoading) && (
                <div className="mb-4 p-3 bg-blue-50/50 border border-blue-100 text-blue-800 rounded-lg flex items-center justify-between gap-2 max-w-sm mt-2 animate-in fade-in">
                  <span className="font-bold text-xs">Costo referencial de envío:</span>
                  <span className="font-bold text-xs">
                    {isPriceLoading ? 'Calculando...' : `S/ ${price?.toFixed(2)}`}
                  </span>
                </div>
              )}

              {/* Fila 2: Dirección Exacta - Separada */}
              <div className="mb-4">
                <Input
                  label="Dirección Exacta"
                  value={watchedValues.recipient?.address?.address || ''}
                  onChange={async (e) => {
                    const value = e.target.value;
                    setValue('recipient.address.address', value.toUpperCase());
                    await trigger('recipient.address.address');
                  }}
                  error={errors.recipient?.address?.address?.message}
                  className="border-gray-200 focus:border-[#02997d]"
                  placeholder="Av. Principal 123, Urb. Las Flores"
                />
              </div>

              <div>
                <Input
                  label="Referencia"
                  value={watchedValues.recipient?.address?.reference || ''}
                  onChange={async (e) => {
                    const value = e.target.value;
                    setValue('recipient.address.reference', value.toUpperCase());
                  }}
                  error={errors.recipient?.address?.reference?.message}
                  className="border-gray-200 focus:border-[#02997d]"
                  placeholder="Ej. Portón negro, frente al parque..."
                />
              </div>
            </div>
            )}

            {/* Configuración de Entrega (Modo de Entrega / COD / Fecha) */}
            <div ref={configRef}>
              {isAddressComplete && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm mt-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                  Configuración de Entrega
                </h4>
              <DeliveryConfiguration
                deliveryMode={watchedValues.service?.delivery_mode}
                onModeChange={async (val) => {
                  setValue('service.delivery_mode', val);
                  await trigger('service.delivery_mode');
                }}
                error={errors.service?.delivery_mode?.message}
                registerCodAmount={register('service.cod_amount', {
                  required: watchedValues.service?.delivery_mode === 'pay_on_delivery' ? "Ingresa el monto a cobrar" : false,
                  valueAsNumber: true
                })}
                codAmountError={errors.service?.cod_amount?.message}
                codIncludesDelivery={watchedValues.service?.cod_includes_delivery}
                onCodIncludesDeliveryChange={async (val) => {
                  setValue('service.cod_includes_delivery', val);
                  await trigger('service.cod_includes_delivery');
                }}
                deliveryDate={watchedValues.service?.delivery_date}
                onDateChange={async (val) => {
                  setValue('service.delivery_date', val);
                  await trigger('service.delivery_date');
                }}
                  dateError={errors.service?.delivery_date?.message}
                />
              </div>
              )}
            </div>

            {/* BOTÓN DE NAVEGACIÓN */}
            {!isCompleted && isActive && isAddressComplete && (
              <div className="pt-8 flex justify-end border-t border-gray-50 mt-4 animate-in fade-in duration-500">
                <Button
                  type="button"
                  onClick={handleContinue}
                  disabled={isValidating}
                  className="bg-gray-900 text-white hover:bg-black px-8 h-11 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  {isValidating ? 'Validando...' : (watchedValues.service?.delivery_mode === 'pay_on_delivery' ? 'Continuar al Pago' : 'Confirmar Dirección')}
                </Button>
              </div>
            )}

          </div>
        </div>
      </Card>
    </div>
  );
}