'use client';

import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal, ModalFooter } from '@/components/ui/modal';

import { useLocationCatalog } from '@/hooks/useLocationCatalog';

interface Address {
  address: string;
  id_region: number;
  id_district: number;
  id_sector?: number;
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
    id_sector: undefined
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { catalog, getRegionOptions, getDistrictOptions, getSectorOptions } = useLocationCatalog();

  // Funciones auxiliares para obtener nombres de ubicación
  const getRegionName = (id?: number) => {
    if (!id || !catalog) return '';
    return catalog?.find(r => r.id_region === id)?.region_name || '';
  };

  const getDistrictName = (id?: number) => {
    if (!id || !catalog) return '';
    for (const region of catalog) {
      const district = region.districts.find(d => d.id_district === id);
      if (district) return district.district_name;
    }
    return '';
  };

  const getSectorName = (id?: number) => {
    if (!id || !catalog) return '';
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
        // Editando una dirección existente - usar valores guardados
        setFormData(address);
      } else {

        setFormData({
          address: '',
          id_region: 0,
          id_district: 0,
          id_sector: undefined
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
    const firstSectorId = sectors.length > 0 ? parseInt(sectors[0].value) : undefined;

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
    const firstSectorId = sectors.length > 0 ? parseInt(sectors[0].value) : undefined;

    setFormData(prev => ({
      ...prev,
      id_district: districtId,
      id_sector: firstSectorId
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    }

    if (!formData.id_region || formData.id_region === 0) {
      newErrors.id_region = 'La región es requerida';
    }

    if (!formData.id_district || formData.id_district === 0) {
      newErrors.id_district = 'El distrito es requerido';
    }

    // El sector es opcional, no se valida como requerido

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
      id_region: 0,
      id_district: 0,
      id_sector: undefined
    });
    setErrors({});
    onClose();
  };

  const footerContent = (
    <ModalFooter>
      <div className="flex justify-between w-full">
        <Button
          type="button"
          variant="ghost"
          className="text-gray-500"
          onClick={handleCancel}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
        >
          {address ? 'Actualizar Dirección' : 'Agregar Dirección'}
        </Button>
      </div>
    </ModalFooter>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={title}
      description="Ingresa los datos exactos para asegurar una correcta facturación y logística."
      size="lg"
      footer={footerContent}
    >
      <div className="space-y-8 py-2">
        {/* Dirección */}
        <div className="group">
          <Input
            label="Dirección completa"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Av. Ejemplo 123, Oficina 456"
            error={errors.address}
            className="bg-white"
          />
        </div>

        {/* Ubicación geográfica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
          <div className="space-y-1">
            <Select
              label="Región *"
              value={formData.id_region === 0 ? '' : formData.id_region?.toString() || ''}
              onChange={handleRegionChange}
              options={getRegionOptions()}
              className={`${errors.id_region ? 'border-red-300' : 'border-gray-200'} bg-white`}
            />
            {errors.id_region && <p className="text-[10px] text-red-500 font-bold uppercase ml-1">{errors.id_region}</p>}
          </div>

          <div className="space-y-1">
            <Select
              label="Distrito *"
              value={formData.id_district === 0 ? '' : formData.id_district?.toString() || ''}
              onChange={handleDistrictChange}
              options={formData.id_region === 0 ? [] : getDistrictOptions(formData.id_region)}
              className={`${errors.id_district ? 'border-red-300' : 'border-gray-200'} bg-white`}
            />
            {errors.id_district && <p className="text-[10px] text-red-500 font-bold uppercase ml-1">{errors.id_district}</p>}
          </div>

          {formData.id_district !== 0 && getSectorOptions(formData.id_district).length > 0 && (
            <div className="md:col-span-2 space-y-1">
              <Select
                label="Sector (Opcional)"
                value={formData.id_sector?.toString() || ''}
                onChange={(value) => setFormData(prev => ({ ...prev, id_sector: value ? parseInt(value) : undefined }))}
                options={getSectorOptions(formData.id_district)}
                className="bg-white border-gray-200"
              />
            </div>
          )}
        </div>

        {/* Preview de la ubicación */}
        <div className="bg-gray-900 rounded-2xl p-5 shadow-inner">
          <div className="flex items-center gap-2 mb-3 text-gray-400">
            <MapPin size={14} />
            <h4 className="text-[10px] font-bold uppercase tracking-widest">Resumen de Ubicación</h4>
          </div>
          <div className="space-y-1">
            <p className="text-white font-medium flex items-center justify-between">
              <span className="text-gray-500 text-xs">Región:</span>
              <span>{getRegionName(formData.id_region) || '---'}</span>
            </p>
            <p className="text-white font-medium flex items-center justify-between">
              <span className="text-gray-500 text-xs">Distrito:</span>
              <span>{getDistrictName(formData.id_district) || '---'}</span>
            </p>
            {formData.id_sector && getSectorName(formData.id_sector) && (
              <p className="text-white font-medium flex items-center justify-between">
                <span className="text-gray-500 text-xs">Sector:</span>
                <span>{getSectorName(formData.id_sector)}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}