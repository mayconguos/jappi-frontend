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
  const { register, formState: { errors }, setValue, trigger, watch } = form;
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la Empresa *
          </label>
          <Input
            {...register('company.company_name')}
            type="text"
            placeholder="Nombre de tu empresa"
            autoComplete="organization"
            value={watchedValues.company?.company_name || ''}
            onChange={async (e) => {
              const upperValue = e.target.value.toUpperCase();
              setValue('company.company_name', upperValue);
              await trigger('company.company_name');
            }}
          />
          {errors.company?.company_name && (
            <p className="text-red-500 text-sm mt-1">{errors.company.company_name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono *
          </label>
          <Input
            {...register('company.phones.0')}
            type="text"
            placeholder="(01) 234-5678 o 987654321"
            autoComplete="tel"
            maxLength={15}
            onChange={async (e) => {
              // Permitir números, espacios, guiones, paréntesis y signo +
              const value = e.target.value.replace(/[^\d\-\+\(\)\s]/g, '');
              setValue('company.phones.0', value);
              await trigger('company.phones.0');
            }}
          />
          {errors.company?.phones?.[0] && (
            <p className="text-red-500 text-sm mt-1">{errors.company.phones[0].message}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">
            Teléfono fijo o celular (6-15 dígitos)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            RUC (opcional)
          </label>
          <Input
            {...register('company.ruc')}
            type="text"
            placeholder="20606707283"
            maxLength={11}
            autoComplete="off"
            onChange={async (e) => {
              // Solo permitir números para RUC
              const value = e.target.value.replace(/\D/g, '');
              setValue('company.ruc', value);
              await trigger('company.ruc');
            }}
          />
          {errors.company?.ruc && (
            <p className="text-red-500 text-sm mt-1">{errors.company.ruc.message}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">
            11 dígitos numéricos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Select
            label="Región *"
            value={watchedValues.company?.addresses?.[0]?.id_region?.toString() || ''}
            onChange={handleRegionChange}
            options={loading ? [] : getRegionOptions()}
          />
          {errors.company?.addresses?.[0]?.id_region && (
            <p className="text-red-500 text-sm mt-1">{errors.company.addresses[0].id_region.message}</p>
          )}
          {error && (
            <p className="text-red-500 text-sm mt-1">Error al cargar regiones</p>
          )}
          {loading && (
            <p className="text-gray-500 text-sm mt-1">Cargando regiones...</p>
          )}
        </div>

        <div className="relative">          
          <div className={`transition-all duration-300 ease-in-out ${
            selectedRegion 
              ? 'opacity-100 translate-y-0 max-h-96' 
              : 'opacity-0 -translate-y-2 max-h-0 overflow-hidden pointer-events-none absolute top-0 left-0 right-0'
          }`}>
            <Select
              label="Distrito *"
              value={watchedValues.company?.addresses?.[0]?.id_district?.toString() || ''}
              onChange={handleDistrictChange}
              options={selectedRegion ? getDistrictOptions(selectedRegion) : []}
            />
            {errors.company?.addresses?.[0]?.id_district && selectedRegion && (
              <p className="text-red-500 text-sm mt-1">{errors.company.addresses[0].id_district.message}</p>
            )}
          </div>
        </div>

        <div className="relative">
          <div className={`transition-all duration-300 ease-in-out ${
            districtHasSectors
              ? 'opacity-100 translate-y-0 max-h-96' 
              : 'opacity-0 -translate-y-2 max-h-0 overflow-hidden pointer-events-none absolute top-0 left-0 right-0'
          }`}>
            <Select
              label="Sector *"
              value={watchedValues.company?.addresses?.[0]?.id_sector?.toString() || ''}
              onChange={handleSectorChange}
              options={selectedDistrict ? getSectorOptions(selectedDistrict) : []}
            />
            {errors.company?.addresses?.[0]?.id_sector && districtHasSectors && (
              <p className="text-red-500 text-sm mt-1">{errors.company.addresses[0].id_sector.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dirección *
          </label>
          <Input
            {...register('company.addresses.0.address')}
            type="text"
            placeholder="Av. Ejemplo 123, Oficina 456"
            autoComplete="street-address"
            value={watchedValues.company?.addresses?.[0]?.address || ''}
            onChange={async (e) => {
              const upperValue = e.target.value.toUpperCase();
              setValue('company.addresses.0.address', upperValue);
              await trigger('company.addresses.0.address');
            }}
          />
          {errors.company?.addresses?.[0]?.address && (
            <p className="text-red-500 text-sm mt-1">{errors.company.addresses[0].address.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
