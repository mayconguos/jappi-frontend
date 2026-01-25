'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { RegisterFormData } from '@/lib/validations/auth';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useLocationCatalog } from '@/hooks/useLocationCatalog';

interface CompanyDataStepProps {
  form: UseFormReturn<RegisterFormData>;
  watchedValues: RegisterFormData;
}

// Función utilitaria para Capitalizar
const toTitleCase = (str: string) => {
  return str.replace(/\b\w/g, c => c.toUpperCase());
};

export function CompanyDataStep({ form, watchedValues }: CompanyDataStepProps) {
  const { formState: { errors }, setValue, trigger, watch } = form;
  const { loading, error, getRegionOptions, getDistrictOptions, getSectorOptions } = useLocationCatalog();

  // Observar cambios en la región y distrito seleccionados
  const selectedRegion = watch('company.addresses.0.id_region');
  const selectedDistrict = watch('company.addresses.0.id_district');

  // Verificar si el distrito seleccionado tiene sectores
  const districtHasSectors = selectedDistrict ? getSectorOptions(selectedDistrict).length > 0 : false;

  const handleRegionChange = (value: string) => {
    const regionId = parseInt(value);
    setValue('company.addresses.0.id_region', regionId);

    // Siempre limpiar el distrito y sector cuando cambie la región
    setValue('company.addresses.0.id_district', 0);
    setValue('company.addresses.0.id_sector', 0);

    // Trigger validation
    trigger('company.addresses.0.id_region');
  };

  const handleDistrictChange = (value: string) => {
    const districtId = parseInt(value);
    setValue('company.addresses.0.id_district', districtId);

    // Siempre limpiar el sector cuando cambie el distrito
    setValue('company.addresses.0.id_sector', 0);

    trigger('company.addresses.0.id_district');
  };

  const handleSectorChange = (value: string) => {
    const sectorId = parseInt(value);
    setValue('company.addresses.0.id_sector', sectorId);
    trigger('company.addresses.0.id_sector');
  };

  return (
    <div className="space-y-6">
      {/* Datos básicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          name="company.company_name"
          type="text"
          label="Nombre de la Empresa *"
          className="capitalize"
          autoComplete="organization"
          error={errors.company?.company_name?.message}
          value={watchedValues.company?.company_name || ''}
          onChange={async (e) => {
            const value = e.target.value;
            const titleValue = toTitleCase(value);
            setValue('company.company_name', titleValue);
            await trigger('company.company_name');
          }}
        />

        <Input
          name="company.ruc"
          type="text"
          label="RUC"
          maxLength={11}
          autoComplete="off"
          error={errors.company?.ruc?.message}
          value={watchedValues.company?.ruc || ''}
          onChange={async (e) => {
            const value = e.target.value;
            const numericValue = value.replace(/\D/g, '');
            setValue('company.ruc', numericValue);
            await trigger('company.ruc');
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative">
          <Input
            name="company.phones.0"
            type="text"
            label="Teléfono *"
            prefix="+51"
            autoComplete="tel"
            placeholder="900 000 000"
            maxLength={15}
            error={errors.company?.phones?.[0]?.message}
            value={watchedValues.company?.phones?.[0] || ''}
            onChange={async (e) => {
              const value = e.target.value;
              const cleanValue = value.replace(/[^\d\-\+\(\)\s]/g, '');
              setValue('company.phones.0', cleanValue);
              await trigger('company.phones.0');
            }}
          />
        </div>

        <div className="relative z-30">
          <Select
            label="Región *"
            value={
              watchedValues.company?.addresses?.[0]?.id_region &&
                watchedValues.company.addresses[0].id_region > 0
                ? watchedValues.company.addresses[0].id_region.toString()
                : ''
            }
            onChange={handleRegionChange}
            options={loading ? [] : getRegionOptions()}
            error={errors.company?.addresses?.[0]?.id_region?.message || (error ? 'Error al cargar regiones' : '')}
          />
          {loading && (
            <p className="text-gray-500 text-sm mt-1">Cargando regiones...</p>
          )}
        </div>
      </div>

      {/* Ubicación */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-300">
        <div className={`relative z-20 transition-all duration-500 ease-in-out ${selectedRegion
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 -translate-y-2 scale-95 pointer-events-none absolute'
          } ${!districtHasSectors ? 'md:col-span-2' : ''
          }`}>
          {selectedRegion && (
            <Select
              label="Distrito *"
              value={
                watchedValues.company?.addresses?.[0]?.id_district &&
                  watchedValues.company.addresses[0].id_district > 0
                  ? watchedValues.company.addresses[0].id_district.toString()
                  : ''
              }
              onChange={handleDistrictChange}
              options={getDistrictOptions(selectedRegion)}
              error={errors.company?.addresses?.[0]?.id_district?.message}
            />
          )}
        </div>

        <div className={`relative z-10 transition-all duration-500 ease-in-out ${districtHasSectors
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 -translate-y-2 scale-95 pointer-events-none absolute hidden'
          }`}>
          {districtHasSectors && (
            <Select
              label="Sector *"
              value={
                watchedValues.company?.addresses?.[0]?.id_sector &&
                  watchedValues.company.addresses[0].id_sector > 0
                  ? watchedValues.company.addresses[0].id_sector.toString()
                  : ''
              }
              onChange={handleSectorChange}
              options={getSectorOptions(selectedDistrict)}
              error={errors.company?.addresses?.[0]?.id_sector?.message}
            />
          )}
        </div>
      </div>

      <div>
        <Input
          name="company.addresses.0.address"
          type="text"
          label="Dirección *"
          className="capitalize"
          autoComplete="street-address"
          error={errors.company?.addresses?.[0]?.address?.message}
          value={watchedValues.company?.addresses?.[0]?.address || ''}
          onChange={async (e) => {
            const value = e.target.value;
            const titleValue = toTitleCase(value);
            setValue('company.addresses.0.address', titleValue);
            await trigger('company.addresses.0.address');
          }}
        />
      </div>
    </div>
  );
}