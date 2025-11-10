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
    <div className="border border-gray-200 rounded-lg p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Input
            name="company.company_name"
            type="text"
            label="Nombre de la Empresa *"
            autoComplete="organization"
            error={errors.company?.company_name?.message}
            value={watchedValues.company?.company_name || ''}
            onChange={async (value) => {
              const upperValue = value.toUpperCase();
              setValue('company.company_name', upperValue);
              await trigger('company.company_name');
            }}
          />
        </div>

        <div>
          <Input
            name="company.phones.0"
            type="text"
            label="Teléfono *"
            autoComplete="tel"
            maxLength={15}
            error={errors.company?.phones?.[0]?.message}
            value={watchedValues.company?.phones?.[0] || ''}
            onChange={async (value) => {
              // Permitir números, espacios, guiones, paréntesis y signo +
              const cleanValue = value.replace(/[^\d\-\+\(\)\s]/g, '');
              setValue('company.phones.0', cleanValue);
              await trigger('company.phones.0');
            }}
          />
        </div>

        <div>
          <Input
            name="company.ruc"
            type="text"
            label="RUC (opcional)"
            maxLength={11}
            autoComplete="off"
            error={errors.company?.ruc?.message}
            value={watchedValues.company?.ruc || ''}
            onChange={async (value) => {
              // Solo permitir números para RUC
              const numericValue = value.replace(/\D/g, '');
              setValue('company.ruc', numericValue);
              await trigger('company.ruc');
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        <div className="relative z-20">          
          <div className={`transition-all duration-300 ease-in-out ${
            selectedRegion 
              ? 'opacity-100 translate-y-0 max-h-96' 
              : 'opacity-0 -translate-y-2 max-h-0 overflow-hidden pointer-events-none absolute top-0 left-0 right-0'
          }`}>
            <Select
              label="Distrito *"
              value={
                watchedValues.company?.addresses?.[0]?.id_district && 
                watchedValues.company.addresses[0].id_district > 0
                  ? watchedValues.company.addresses[0].id_district.toString()
                  : ''
              }
              onChange={handleDistrictChange}
              options={selectedRegion ? getDistrictOptions(selectedRegion) : []}
              error={errors.company?.addresses?.[0]?.id_district?.message}
            />
          </div>
        </div>

        <div className="relative z-10">
          <div className={`transition-all duration-300 ease-in-out ${
            districtHasSectors
              ? 'opacity-100 translate-y-0 max-h-96' 
              : 'opacity-0 -translate-y-2 max-h-0 overflow-hidden pointer-events-none absolute top-0 left-0 right-0'
          }`}>
            <Select
              label="Sector *"
              value={
                watchedValues.company?.addresses?.[0]?.id_sector && 
                watchedValues.company.addresses[0].id_sector > 0
                  ? watchedValues.company.addresses[0].id_sector.toString()
                  : ''
              }
              onChange={handleSectorChange}
              options={selectedDistrict ? getSectorOptions(selectedDistrict) : []}
              error={errors.company?.addresses?.[0]?.id_sector?.message}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <Input
            name="company.addresses.0.address"
            type="text"
            label="Dirección *"
            autoComplete="street-address"
            error={errors.company?.addresses?.[0]?.address?.message}
            value={watchedValues.company?.addresses?.[0]?.address || ''}
            onChange={async (value) => {
              const upperValue = value.toUpperCase();
              setValue('company.addresses.0.address', upperValue);
              await trigger('company.addresses.0.address');
            }}
          />
        </div>
      </div>
    </div>
  );
}