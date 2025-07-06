'use client';

import React, { useEffect } from 'react';
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
  const selectedRegion = watch('region');
  const selectedDistrict = watch('district');

  // Limpiar el distrito cuando cambie la región
  useEffect(() => {
    if (selectedRegion && watchedValues.district) {
      const availableDistricts = getDistrictOptions(selectedRegion);
      const currentDistrictExists = availableDistricts.some(
        district => district.value === watchedValues.district?.toString()
      );
      
      if (!currentDistrictExists) {
        setValue('district', 0);
        // También limpiar sector si existe
        if (watchedValues.sector !== undefined) {
          setValue('sector', 0);
        }
      }
    }
  }, [selectedRegion, setValue, getDistrictOptions, watchedValues.district, watchedValues.sector]);

  // Limpiar el sector cuando cambie el distrito
  useEffect(() => {
    if (selectedDistrict && watchedValues.sector !== undefined) {
      const availableSectors = getSectorOptions(selectedDistrict);
      const currentSectorExists = availableSectors.some(
        sector => sector.value === watchedValues.sector?.toString()
      );
      
      if (!currentSectorExists || availableSectors.length === 0) {
        setValue('sector', 0);
      }
    }
  }, [selectedDistrict, setValue, getSectorOptions, watchedValues.sector]);

  // Verificar si el distrito seleccionado tiene sectores
  const districtHasSectors = selectedDistrict ? getSectorOptions(selectedDistrict).length > 0 : false;

  const handleRegionChange = (value: string) => {
    const regionId = parseInt(value);
    setValue('region', regionId);
    
    // Limpiar el distrito y sector seleccionados cuando cambie la región
    setValue('district', 0);
    if (watchedValues.sector !== undefined) {
      setValue('sector', 0);
    }
    
    // Trigger validation
    trigger('region');
  };

  const handleDistrictChange = (value: string) => {
    const districtId = parseInt(value);
    setValue('district', districtId);
    
    // Limpiar el sector seleccionado cuando cambie el distrito
    if (watchedValues.sector !== undefined) {
      setValue('sector', 0);
    }
    
    trigger('district');
  };

  const handleSectorChange = (value: string) => {
    const sectorId = parseInt(value);
    setValue('sector', sectorId);
    trigger('sector');
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la Empresa *
          </label>
          <Input
            {...register('company_name')}
            type="text"
            placeholder="Nombre de tu empresa"
            autoComplete="organization"
            value={watchedValues.company_name || ''}
            onChange={async (e) => {
              const upperValue = e.target.value.toUpperCase();
              setValue('company_name', upperValue);
              await trigger('company_name');
            }}
          />
          {errors.company_name && (
            <p className="text-red-500 text-sm mt-1">{errors.company_name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono *
          </label>
          <Input
            {...register('phone')}
            type="text"
            placeholder="(01) 234-5678 o 987654321"
            autoComplete="tel"
            maxLength={15}
            onChange={async (e) => {
              // Permitir números, espacios, guiones, paréntesis y signo +
              const value = e.target.value.replace(/[^\d\-\+\(\)\s]/g, '');
              setValue('phone', value);
              await trigger('phone');
            }}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
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
            {...register('ruc')}
            type="text"
            placeholder="12345678901"
            maxLength={11}
            autoComplete="off"
            onChange={async (e) => {
              // Solo permitir números para RUC
              const value = e.target.value.replace(/\D/g, '');
              setValue('ruc', value);
              await trigger('ruc');
            }}
          />
          {errors.ruc && (
            <p className="text-red-500 text-sm mt-1">{errors.ruc.message}</p>
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
            value={watchedValues.region?.toString() || ''}
            onChange={handleRegionChange}
            options={loading ? [] : getRegionOptions()}
          />
          {errors.region && (
            <p className="text-red-500 text-sm mt-1">{errors.region.message}</p>
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
              value={watchedValues.district?.toString() || ''}
              onChange={handleDistrictChange}
              options={selectedRegion ? getDistrictOptions(selectedRegion) : []}
            />
            {errors.district && selectedRegion && (
              <p className="text-red-500 text-sm mt-1">{errors.district.message}</p>
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
              value={watchedValues.sector?.toString() || ''}
              onChange={handleSectorChange}
              options={selectedDistrict ? getSectorOptions(selectedDistrict) : []}
            />
            {errors.sector && districtHasSectors && (
              <p className="text-red-500 text-sm mt-1">{errors.sector.message}</p>
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
            {...register('address')}
            type="text"
            placeholder="Av. Ejemplo 123, Oficina 456"
            autoComplete="street-address"
            value={watchedValues.address || ''}
            onChange={async (e) => {
              const upperValue = e.target.value.toUpperCase();
              setValue('address', upperValue);
              await trigger('address');
            }}
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
