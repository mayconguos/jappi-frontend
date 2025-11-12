'use client';

import { UseFormReturn } from 'react-hook-form';
import { User, MapPin } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

import { useLocationCatalog } from '@/hooks/useLocationCatalog';

import { DOCUMENT_TYPES } from '@/constants/documentTypes';

import { type ShipmentFormData } from '@/lib/validations/shipment';

interface RecipientSectionProps {
  form: UseFormReturn<ShipmentFormData>;
}

export default function RecipientSection({ form }: RecipientSectionProps) {
  const { getRegionOptions, getDistrictOptions, getSectorOptions } = useLocationCatalog();
  const { formState: { errors }, watch, setValue, trigger } = form;
  const watchedValues = watch();

  // Observar cambios en la región y distrito seleccionados
  const selectedRegion = watchedValues.recipient?.address?.id_region;
  const selectedDistrict = watchedValues.recipient?.address?.id_district;

  // Verificar si el distrito seleccionado tiene sectores
  const districtHasSectors = selectedDistrict ? getSectorOptions(selectedDistrict).length > 0 : false;

  const regionOptions = getRegionOptions();
  const recipientDistrictOptions = getDistrictOptions(selectedRegion || 0);
  const recipientSectorOptions = getSectorOptions(selectedDistrict || 0);

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <User className="text-[var(--surface-dark)]" size={20} />
          Datos del destinatario
        </h2>

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
            <Select
              label="Tipo de documento *"
              value={watchedValues.recipient?.document_type || ''}
              options={DOCUMENT_TYPES}
              onChange={async (value) => {
                setValue('recipient.document_type', value);
                setValue('recipient.document_number', '');
                await trigger(['recipient.document_type', 'recipient.document_number']);
              }}
              error={errors.recipient?.document_type?.message}
            />
          </div>

          <div>
            <Input
              label="Número de documento *"
              value={watchedValues.recipient?.document_number || ''}
              onChange={async (value) => {
                setValue('recipient.document_number', value);
                await trigger('recipient.document_number');
              }}
              error={errors.recipient?.document_number?.message}
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

          <div className="md:col-span-2">
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

        {/* Dirección del Destinatario */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="text-[var(--surface-dark)]" size={18} />
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
      </div>
    </div>
  );
}