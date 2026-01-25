'use client';

import { UseFormReturn } from 'react-hook-form';
import { User, MapPin, CheckCircle2, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

import { useLocationCatalog } from '@/hooks/useLocationCatalog';
import { type ShipmentFormData } from '@/lib/validations/shipment';

interface RecipientSectionProps {
  form: UseFormReturn<ShipmentFormData>;
  isActive: boolean;
  isCompleted: boolean;
  onContinue: () => void;
  onEdit?: () => void;
}

export default function RecipientSection({ form, isActive, isCompleted, onContinue, onEdit }: RecipientSectionProps) {
  const { getRegionOptions, getDistrictOptions, getSectorOptions } = useLocationCatalog();
  const { formState: { errors }, watch, setValue, trigger } = form;
  const watchedValues = watch();

  const selectedRegion = watchedValues.recipient?.address?.id_region;
  const selectedDistrict = watchedValues.recipient?.address?.id_district;

  const districtHasSectors = selectedDistrict ? getSectorOptions(selectedDistrict).length > 0 : false;

  const regionOptions = getRegionOptions();
  const recipientDistrictOptions = getDistrictOptions(selectedRegion || 0);
  const recipientSectorOptions = getSectorOptions(selectedDistrict || 0);

  return (
    <div className={clsx(
      "bg-white rounded-[24px] shadow-sm transition-all duration-500 border",
      isActive ? "overflow-visible" : "overflow-hidden",
      isCompleted ? "border-emerald-200" : (isActive ? "border-[var(--surface-dark)] ring-1 ring-[var(--surface-dark)]/20 shadow-lg" : "border-slate-100 opacity-60")
    )}>
      <div
        className={clsx(
          "px-8 py-6 flex items-center justify-between border-b transition-colors duration-300",
          isCompleted ? "bg-emerald-50 border-emerald-100" : (isActive ? "bg-white border-slate-100" : "bg-slate-50 border-transparent")
        )}
      >
        <div className="flex items-center gap-4">
          <div className={clsx(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
            isCompleted ? "bg-emerald-500 text-white shadow-emerald-200" : (isActive ? "bg-[var(--surface-dark)] text-white shadow-lg shadow-[var(--surface-dark)]/30" : "bg-slate-200 text-slate-400")
          )}>
            {isCompleted ? <CheckCircle2 size={24} /> : <User size={20} />}
          </div>
          <div>
            <h3 className={clsx("text-lg font-bold transition-colors", isCompleted ? "text-emerald-800" : "text-slate-900")}>
              Datos del Destinatario
            </h3>
            <p className="text-sm text-slate-500">
              {isCompleted ? "Información del cliente completada" : "Quién recibe el paquete"}
            </p>
          </div>
        </div>

        {isCompleted && onEdit && (
          <Button variant="ghost" size="sm" onClick={onEdit} className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 rounded-full">
            <span className="mr-2 text-xs font-bold uppercase">Editar</span>
            <ChevronDown size={16} />
          </Button>
        )}
      </div>

      <div className={clsx(
        "transition-all duration-500 ease-in-out",
        (isActive || isCompleted) ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0",
        isActive ? "overflow-visible" : "overflow-hidden"
      )}>
        <div className={clsx("p-8 space-y-8", isCompleted && "pointer-events-none opacity-80 grayscale-[0.3]")}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Input
                label="Nombre completo *"
                value={watchedValues.recipient?.full_name || ''}
                onChange={async (value) => {
                  setValue('recipient.full_name', value.toUpperCase());
                  await trigger('recipient.full_name');
                }}
                error={errors.recipient?.full_name?.message}
              />
            </div>

            <div>
              <Input
                label="Teléfono *"
                value={watchedValues.recipient?.phone || ''}
                onChange={async (value) => {
                  const numericValue = value.replace(/\D/g, '');
                  setValue('recipient.phone', numericValue);
                  await trigger('recipient.phone');
                }}
                error={errors.recipient?.phone?.message}
                maxLength={9}
              />
            </div>

            <div>
              <Input
                label="Correo electrónico"
                type="email"
                value={watchedValues.recipient?.email || ''}
                onChange={async (value) => {
                  setValue('recipient.email', value.toLowerCase());
                  await trigger('recipient.email');
                }}
                error={errors.recipient?.email?.message}
              />
            </div>
          </div>

          <div className="mt-2">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MapPin size={16} />
              Dirección de entrega
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative z-30">
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

              <div className="relative z-20">
                <div className={`transition-all duration-300 ease-in-out ${selectedRegion
                  ? 'opacity-100 translate-y-0 max-h-96'
                  : 'opacity-0 -translate-y-2 max-h-0 overflow-hidden pointer-events-none absolute top-0 left-0 right-0'
                  }`}>
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
              </div>

              <div className="relative z-10">
                <div className={`transition-all duration-300 ease-in-out ${districtHasSectors
                  ? 'opacity-100 translate-y-0 max-h-96'
                  : 'opacity-0 -translate-y-2 max-h-0 overflow-hidden pointer-events-none absolute top-0 left-0 right-0'
                  }`}>
                  <Select
                    label="Sector *"
                    value={watchedValues.recipient?.address?.id_sector?.toString() || ''}
                    options={recipientSectorOptions}
                    onChange={async (value) => {
                      setValue('recipient.address.id_sector', parseInt(value));
                      await trigger('recipient.address.id_sector');
                    }}
                    error={
                      errors.recipient?.address?.id_sector?.message ||
                      (districtHasSectors &&
                        (!watchedValues.recipient?.address?.id_sector || watchedValues.recipient?.address?.id_sector === 0)
                        ? 'Debes seleccionar un sector'
                        : '')
                    }
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
              <div>
                <Input
                  label="Dirección *"
                  value={watchedValues.recipient?.address?.address || ''}
                  onChange={async (value) => {
                    setValue('recipient.address.address', value.toUpperCase());
                    await trigger('recipient.address.address');
                  }}
                  error={errors.recipient?.address?.address?.message}
                />
              </div>
            </div>
          </div>

          {!isCompleted && isActive && (
            <div className="pt-6 flex justify-end">
              <Button
                onClick={onContinue}
                type="button"
                className="bg-[var(--surface-dark)] hover:bg-[var(--surface-dark)]/90 text-white px-8 rounded-full shadow-lg shadow-[var(--surface-dark)]/20 hover:shadow-xl hover:scale-105 transition-all"
              >
                Continuar al Pago
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}