'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import Modal, { ModalFooter } from '@/components/ui/modal';
import { useLocationCatalog } from '@/hooks/useLocationCatalog';
import { 
  MapPin, 
  Trash2, 
  Plus, 
  User, 
  Truck, 
  ShoppingBag,
  Info
} from 'lucide-react';
import { CourierWithZones, CourierZone } from '@/app/dashboard/accounts/courier-zones/page';

interface CourierZoneAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courier: CourierWithZones | null;
  onSave: (courierId: number, pickupZones: CourierZone[], deliveryZones: CourierZone[]) => void;
  isLoading?: boolean;
}

export default function CourierZoneAssignmentModal({
  isOpen,
  onClose,
  courier,
  onSave,
  isLoading = false
}: CourierZoneAssignmentModalProps) {
  // Catalog context
  const { getRegionOptions, getDistrictOptions, getSectorOptions, catalog } = useLocationCatalog();

  // State
  const [pickupZones, setPickupZones] = useState<CourierZone[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<CourierZone[]>([]);

  // Current Input Selection (Pickup)
  const [pDistrict, setPDistrict] = useState<number | null>(null);
  const [pSector, setPSector] = useState<number | null>(null);

  // Current Input Selection (Delivery)
  const [dDistrict, setDDistrict] = useState<number | null>(null);
  const [dSector, setDSector] = useState<number | null>(null);

  // Initialize data when courier changes
  useEffect(() => {
    if (courier && isOpen) {
      setPickupZones([...courier.pickup_zones]);
      setDeliveryZones([...courier.delivery_zones]);
    } else {
      setPickupZones([]);
      setDeliveryZones([]);
      setPDistrict(null);
      setPSector(null);
      setDDistrict(null);
      setDSector(null);
    }
  }, [courier, isOpen]);

  if (!catalog) return null;

  // Region is fixed for now (Lima - id 1)
  const regionId = 1;
  const districtOptions = getDistrictOptions(regionId);

  // Filtering logic for options
  const filterAvailableDistricts = (zones: CourierZone[]) => {
    return districtOptions.filter(d => {
      // Hide if the whole district is already assigned (id_sector === 0)
      return !zones.some(z => z.id_district === Number(d.value) && z.id_sector === 0);
    });
  };

  const filterAvailableSectors = (districtId: number, zones: CourierZone[]) => {
    const allSectors = getSectorOptions(districtId);
    return allSectors.filter(s => {
      // Hide if this specific sector is already assigned
      return !zones.some(z => z.id_district === districtId && z.id_sector === Number(s.value));
    });
  };

  const pDistrictOptions = filterAvailableDistricts(pickupZones).map(d => ({ label: d.label, value: Number(d.value) }));
  const dDistrictOptions = filterAvailableDistricts(deliveryZones).map(d => ({ label: d.label, value: Number(d.value) }));

  const pSectorList = pDistrict ? filterAvailableSectors(pDistrict, pickupZones).map(s => ({ label: s.label, value: Number(s.value) })) : [];
  const dSectorList = dDistrict ? filterAvailableSectors(dDistrict, deliveryZones).map(s => ({ label: s.label, value: Number(s.value) })) : [];

  const handleAddZone = (type: 'pickup' | 'delivery') => {
    const districtId = type === 'pickup' ? pDistrict : dDistrict;
    const sectorId = type === 'pickup' ? pSector : dSector;

    if (!districtId) return;

    // Find names in catalog
    let districtName = '';
    let sectorName = '';

    for (const region of catalog) {
      const d = region.districts.find(d => d.id_district === districtId);
      if (d) {
        districtName = d.district_name;
        if (sectorId) {
          const s = d.sectors.find(s => s.id_sector === sectorId);
          if (s) sectorName = s.sector_name;
        }
        break;
      }
    }

    const newZone: CourierZone = {
      id: 0, 
      id_district: districtId,
      district_name: districtName,
      id_sector: sectorId || 0,
      sector_name: sectorName
    };

    if (type === 'pickup') {
      setPickupZones([...pickupZones, newZone]);
      setPDistrict(null);
      setPSector(null);
    } else {
      setDeliveryZones([...deliveryZones, newZone]);
      setDDistrict(null);
      setDSector(null);
    }
  };

  const handleRemoveZone = (type: 'pickup' | 'delivery', index: number) => {
    if (type === 'pickup') {
      const newList = [...pickupZones];
      newList.splice(index, 1);
      setPickupZones(newList);
    } else {
      const newList = [...deliveryZones];
      newList.splice(index, 1);
      setDeliveryZones(newList);
    }
  };

  const handleSave = () => {
    if (courier) {
      onSave(courier.id, pickupZones, deliveryZones);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestión de Zonas de Operación"
      description={`Configura los destinos de recojo y envío para el transportista.`}
      size="xl"
      showCloseButton
    >
      {courier && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
               <User size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{courier.first_name} {courier.last_name}</p>
              <p className="text-[11px] text-gray-500 font-medium uppercase tracking-tight">{courier.vehicle_type} - {courier.plate_number}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            {/* Pickup Zones */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <ShoppingBag size={14} />
                </div>
                Zonas de Recojo
              </h4>

              <div className="space-y-2.5">
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1.5">
                    <Select
                      label="Distrito"
                      size="compact"
                      value={pDistrict || ''}
                      options={pDistrictOptions}
                      onChange={(val) => {
                        setPDistrict(Number(val));
                        setPSector(null);
                      }}
                      placeholder="Buscar distrito..."
                    />
                  </div>
                </div>

                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Select
                      label="Sector (Opcional)"
                      size="compact"
                      value={pSector || ''}
                      options={pSectorList}
                      onChange={(val) => setPSector(Number(val))}
                      disabled={!pDistrict || getSectorOptions(pDistrict).length === 0}
                      placeholder="Seleccionar sector"
                    />
                  </div>
                  <Button
                    onClick={() => handleAddZone('pickup')}
                    disabled={!pDistrict}
                    className="h-8 w-8 p-0 shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 min-h-[140px] max-h-[300px] overflow-y-auto space-y-2 custom-scrollbar">
                {pickupZones.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 py-8 opacity-40">
                    <Info size={24} className="mb-1" />
                    <p className="text-[11px] font-bold uppercase">Sin rutas agregadas</p>
                  </div>
                )}
                {pickupZones.map((zone, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 bg-white p-2 rounded-lg border border-slate-200 group animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="flex items-center gap-2">
                      <MapPin size={12} className="text-emerald-500" />
                      <div className="flex flex-col">
                         <span className="text-xs font-bold text-gray-800">{zone.district_name}</span>
                         {zone.sector_name && <span className="text-[10px] text-gray-400 font-medium">{zone.sector_name}</span>}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveZone('pickup', idx)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Zones */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
                  <Truck size={14} />
                </div>
                Zonas de Envío
              </h4>

              <div className="space-y-2.5">
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1.5">
                    <Select
                      label="Distrito"
                      size="compact"
                      value={dDistrict || ''}
                      options={dDistrictOptions}
                      onChange={(val) => {
                        setDDistrict(Number(val));
                        setDSector(null);
                      }}
                      placeholder="Buscar distrito..."
                    />
                  </div>
                </div>

                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Select
                      label="Sector (Opcional)"
                      size="compact"
                      value={dSector || ''}
                      options={dSectorList}
                      onChange={(val) => setDSector(Number(val))}
                      disabled={!dDistrict || getSectorOptions(dDistrict).length === 0}
                      placeholder="Seleccionar sector"
                    />
                  </div>
                  <Button
                    onClick={() => handleAddZone('delivery')}
                    disabled={!dDistrict}
                    className="h-8 w-8 p-0 shrink-0 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 min-h-[140px] max-h-[300px] overflow-y-auto space-y-2 custom-scrollbar">
                {deliveryZones.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 py-8 opacity-40">
                    <Info size={24} className="mb-1" />
                    <p className="text-[11px] font-bold uppercase">Sin rutas agregadas</p>
                  </div>
                )}
                {deliveryZones.map((zone, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 bg-white p-2 rounded-lg border border-slate-200 group animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="flex items-center gap-2">
                      <MapPin size={12} className="text-blue-500" />
                      <div className="flex flex-col">
                         <span className="text-xs font-bold text-gray-800">{zone.district_name}</span>
                         {zone.sector_name && <span className="text-[10px] text-gray-400 font-medium">{zone.sector_name}</span>}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveZone('delivery', idx)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <ModalFooter className="pt-2">
        <Button
          variant="secondary"
          onClick={onClose}
          className="bg-white border text-slate-600 hover:bg-slate-50 min-w-[100px]"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={isLoading || !courier}
          className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[100px] shadow-lg shadow-emerald-900/10"
        >
          {isLoading ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
