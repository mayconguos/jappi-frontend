'use client';

import { useState, useEffect } from 'react';
import { X, MapPin } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Select } from './select';
import { useLocationCatalog } from '@/hooks/useLocationCatalog';

interface Address {
  address: string;
  id_region: number;
  id_district: number;
  id_sector: number;
}

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: Address) => void;
  address?: Address | null;
  title?: string;
}

export function AddressModal({ 
  isOpen, 
  onClose, 
  onSave, 
  address = null,
  title = "Agregar Dirección"
}: AddressModalProps) {
  const [formData, setFormData] = useState<Address>({
    address: '',
    id_region: 1,
    id_district: 1,
    id_sector: 1
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const { catalog, getRegionOptions, getDistrictOptions, getSectorOptions } = useLocationCatalog();

  // Funciones auxiliares para obtener nombres de ubicación
  const getRegionName = (id: number) => {
    return catalog?.find(r => r.id_region === id)?.region_name || '';
  };

  const getDistrictName = (id: number) => {
    if (!catalog) return '';
    for (const region of catalog) {
      const district = region.districts.find(d => d.id_district === id);
      if (district) return district.district_name;
    }
    return '';
  };

  const getSectorName = (id: number) => {
    if (!catalog) return '';
    for (const region of catalog) {
      for (const district of region.districts) {
        const sector = district.sectors.find(s => s.id_sector === id);
        if (sector) return sector.sector_name;
      }
    }
    return '';
  };

  // Inicializar el formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      if (address) {
        setFormData(address);
      } else {
        setFormData({
          address: '',
          id_region: 1,
          id_district: 1,
          id_sector: 1
        });
      }
      setErrors({});
    }
  }, [isOpen, address]);

  const handleRegionChange = (value: string) => {
    const regionId = parseInt(value);
    const districts = getDistrictOptions(regionId);
    const firstDistrictId = districts.length > 0 ? parseInt(districts[0].value) : 1;
    const sectors = getSectorOptions(firstDistrictId);
    const firstSectorId = sectors.length > 0 ? parseInt(sectors[0].value) : 1;

    setFormData(prev => ({
      ...prev,
      id_region: regionId,
      id_district: firstDistrictId,
      id_sector: firstSectorId
    }));
  };

  const handleDistrictChange = (value: string) => {
    const districtId = parseInt(value);
    const sectors = getSectorOptions(districtId);
    const firstSectorId = sectors.length > 0 ? parseInt(sectors[0].value) : 1;

    setFormData(prev => ({
      ...prev,
      id_district: districtId,
      id_sector: firstSectorId
    }));
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    }

    if (!formData.id_region) {
      newErrors.id_region = 'La región es requerida';
    }

    if (!formData.id_district) {
      newErrors.id_district = 'El distrito es requerido';
    }

    if (!formData.id_sector) {
      newErrors.id_sector = 'El sector es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleCancel = () => {
    setFormData({
      address: '',
      id_region: 1,
      id_district: 1,
      id_sector: 1
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <MapPin className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Dirección */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección completa *
            </label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Av. Ejemplo 123, Oficina 456"
              className={errors.address ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          {/* Ubicación geográfica */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Select
                label="Región *"
                value={formData.id_region?.toString() || ''}
                onChange={handleRegionChange}
                options={getRegionOptions()}
                className={errors.id_region ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
              />
              {errors.id_region && (
                <p className="mt-1 text-sm text-red-600">{errors.id_region}</p>
              )}
            </div>

            <div>
              <Select
                label="Distrito *"
                value={formData.id_district?.toString() || ''}
                onChange={handleDistrictChange}
                options={getDistrictOptions(formData.id_region)}
                className={errors.id_district ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
              />
              {errors.id_district && (
                <p className="mt-1 text-sm text-red-600">{errors.id_district}</p>
              )}
            </div>

            <div>
              <Select
                label="Sector *"
                value={formData.id_sector?.toString() || ''}
                onChange={(value) => setFormData(prev => ({ ...prev, id_sector: parseInt(value) }))}
                options={getSectorOptions(formData.id_district)}
                className={errors.id_sector ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
              />
              {errors.id_sector && (
                <p className="mt-1 text-sm text-red-600">{errors.id_sector}</p>
              )}
            </div>
          </div>

          {/* Preview de la ubicación */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Vista previa de la ubicación:</h4>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Región:</span> {getRegionName(formData.id_region)} <br />
              <span className="font-medium">Distrito:</span> {getDistrictName(formData.id_district)} <br />
              <span className="font-medium">Sector:</span> {getSectorName(formData.id_sector)}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            onClick={handleCancel}
            variant="outline"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {address ? 'Actualizar' : 'Agregar'} Dirección
          </Button>
        </div>
      </div>
    </div>
  );
}