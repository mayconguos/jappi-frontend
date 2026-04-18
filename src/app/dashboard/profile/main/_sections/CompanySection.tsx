import { useState, useEffect } from 'react';
import { Edit, Plus, Trash2, Building2, MapPin, Phone, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SaveButton } from '@/components/ui/save-button';
import { AddressModal } from '@/app/dashboard/profile/main/_modals/address-modal';

import { useLocationCatalog } from '@/hooks/useLocationCatalog';

interface Address {
  address: string;
  id_region: number;
  id_district: number;
  id_sector?: number;
}

interface Company {
  company_name: string;
  addresses: Address[];
  phones: string[];
  ruc: string;
  bank_accounts: Array<{
    account_number: string;
    account_type: number;
    cci_number: string;
    account_holder: string;
    bank: number;
  }>;
  payment_apps: Array<{
    app_name: string;
    phone_number: string;
    account_holder: string;
    document_number: string;
  }>;
}

interface CompanySectionProps {
  company: Company;
  onSave: (updates: Partial<Company>) => Promise<boolean>; // Actualizado para enviar cambios locales
  savedRuc?: string;
}

export default function CompanySection({
  company,
  onSave,
  savedRuc
}: CompanySectionProps) {
  // Estado local para los datos del formulario (copia "draft")
  const [formData, setFormData] = useState<Company>(company);

  // Sincronizar estado local cuando cambian las props (ej. al guardar o cargar)
  useEffect(() => {
    setFormData(company);
  }, [company]);

  // Estados para el modal de direcciones
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null);

  // Hook para el catálogo de ubicaciones
  const { catalog } = useLocationCatalog();

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

  // Funciones internas para manejar teléfonos (Actualizan estado local)
  const handlePhoneChange = (index: number, value: string) => {
    const updatedPhones = [...formData.phones];
    updatedPhones[index] = value;
    setFormData(prev => ({ ...prev, phones: updatedPhones }));
  };

  const addPhone = () => {
    if (formData.phones.length < 4) {
      setFormData(prev => ({ ...prev, phones: [...prev.phones, ''] }));
    }
  };

  const removePhone = (index: number) => {
    if (formData.phones.length > 1) {
      const updatedPhones = formData.phones.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, phones: updatedPhones }));
    }
  };

  // Función interna para manejar direcciones (Actualizan estado local)
  const removeAddress = (index: number) => {
    if (formData.addresses.length > 1) {
      const updatedAddresses = formData.addresses.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, addresses: updatedAddresses }));
    }
  };

  // Funciones para el modal de direcciones
  const openAddressModal = (index?: number) => {
    setEditingAddressIndex(index ?? null);
    setAddressModalOpen(true);
  };

  const closeAddressModal = () => {
    setAddressModalOpen(false);
    setEditingAddressIndex(null);
  };

  const handleAddressSave = (address: Address) => {
    const updatedAddresses = [...formData.addresses];

    if (editingAddressIndex !== null) {
      // Editando una dirección existente
      updatedAddresses[editingAddressIndex] = address;
    } else {
      // Agregando nueva dirección
      updatedAddresses.push(address);
    }

    setFormData(prev => ({ ...prev, addresses: updatedAddresses }));
    closeAddressModal();
  };

  // Función para guardar cambios locales
  const handleLocalSave = async () => {
    return await onSave(formData);
  };


  return (
    <div className="p-4 md:p-6 space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* Información Básica */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 shrink-0">
            <Building2 size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Datos de la Empresa</h3>
            <p className="text-xs text-gray-500 mt-0.5">Información legal y tributaria de tu negocio</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="group">
            <div className="flex items-center gap-1.5 mb-1.5 px-1">
              <Building2 size={14} className="text-gray-400 group-hover:text-emerald-600 transition-colors" />
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Nombre de la Empresa</span>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 transition-all group-hover:bg-white group-hover:shadow-md group-hover:shadow-gray-200/50 group-hover:border-emerald-500/20">
              <p className="text-base font-medium text-gray-900">
                {formData.company_name || <span className="italic text-gray-400 font-normal">No especificado</span>}
              </p>
            </div>
          </div>

          <div className="group">
            <div className="flex items-center gap-1.5 mb-1.5 px-1">
              <FileText size={14} className="text-gray-400 group-hover:text-emerald-600 transition-colors" />
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">RUC</span>
            </div>
            {!!savedRuc ? (
              <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 transition-all group-hover:bg-white group-hover:shadow-md group-hover:shadow-gray-200/50 group-hover:border-emerald-500/20">
                <p className="text-base font-medium text-gray-900">{formData.ruc}</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 transition-all group-hover:shadow-md group-hover:shadow-gray-200/50 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
                <input
                  type="text"
                  value={formData.ruc || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, ruc: e.target.value }))}
                  placeholder="Ej. 20123456789"
                  maxLength={11}
                  className="w-full bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-base font-medium text-gray-900 placeholder:text-gray-400 mt-1"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Direcciones */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 shrink-0">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">Sedes y Direcciones</h3>
              <p className="text-xs text-gray-500 mt-0.5">Gestiona los recojos y entregas ({formData.addresses.length}/4)</p>
            </div>
          </div>
          {formData.addresses.length < 4 && (
            <Button
              type="button"
              onClick={() => openAddressModal()}
              variant="secondary"
              size="sm"
              className="h-8 rounded-lg px-3 text-xs border-gray-200 hover:border-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-all font-medium text-gray-600 shadow-sm bg-white"
            >
              <Plus size={14} className="mr-1.5" />
              Nueva Dirección
            </Button>
          )}
        </div>

        {formData.addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 bg-gray-50/50 border border-dashed border-gray-200 rounded-xl hover:border-emerald-600/30 transition-colors">
            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 mb-3 hover:text-emerald-600 transition-colors">
              <MapPin size={24} />
            </div>
            <p className="text-gray-500 text-sm font-medium mb-4">No hay direcciones registradas para esta empresa</p>
            <Button
              type="button"
              onClick={() => openAddressModal()}
              className="rounded-lg px-6 h-9 text-sm shadow-md shadow-emerald-600/10 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus size={16} className="mr-1.5" />
              Agregar primera dirección
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formData.addresses.map((address, index) => (
              <div key={index} className="group relative p-4 bg-white border border-gray-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-10">
                    <p className="font-bold text-gray-800 text-sm mb-1.5 truncate group-hover:text-emerald-700 transition-colors">
                      {address.address}
                    </p>
                    <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50/80 px-2 py-1 rounded-md w-fit border border-gray-100">
                      <MapPin size={12} className="text-gray-400 shrink-0" />
                      <p className="text-xs font-medium truncate">
                        {[
                          getRegionName(address.id_region),
                          getDistrictName(address.id_district),
                          getSectorName(address.id_sector)
                        ].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openAddressModal(index)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors"
                      title="Editar dirección"
                    >
                      <Edit size={14} />
                    </button>
                    {formData.addresses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAddress(index)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        title="Eliminar dirección"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Teléfonos */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 shrink-0">
              <Phone size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">Canales de Contacto</h3>
              <p className="text-xs text-gray-500 mt-0.5">Teléfonos para notificaciones ({formData.phones.length}/4)</p>
            </div>
          </div>
          {formData.phones.length < 4 && (
            <Button
              type="button"
              onClick={addPhone}
              variant="secondary"
              size="sm"
              className="h-8 rounded-lg px-3 text-xs border-gray-200 hover:border-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-all font-medium text-gray-600 shadow-sm bg-white"
            >
              <Plus size={14} className="mr-1.5" />
              Añadir Teléfono
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {formData.phones.map((phone, index) => (
            <div key={index} className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all shadow-sm">
              <div className="pl-3 py-2 flex items-center justify-center text-emerald-600 bg-emerald-50/50 border-r border-gray-100 pr-2">
                <Phone size={14} />
              </div>
              <input
                type="text"
                value={phone}
                onChange={(e) => handlePhoneChange(index, e.target.value)}
                placeholder="Ej. 987 654 321"
                maxLength={12}
                className="flex-1 w-full bg-transparent border-none focus:outline-none focus:ring-0 px-3 py-2 text-sm font-medium text-gray-800 placeholder:text-gray-300"
              />
              {formData.phones.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePhone(index)}
                  className="px-3 py-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors border-l border-gray-100"
                  title="Eliminar teléfono"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Botón de guardar */}
      <div className="flex justify-end pt-5 mt-2 border-t border-gray-100">
        <SaveButton onSave={handleLocalSave} />
      </div>

      {/* Modal de direcciones */}
      <AddressModal
        isOpen={addressModalOpen}
        onClose={closeAddressModal}
        onSave={handleAddressSave}
        address={editingAddressIndex !== null ? formData.addresses[editingAddressIndex as number] : null}
        title={editingAddressIndex !== null ? "Editar Dirección" : "Agregar Nueva Dirección"}
      />
    </div>
  );
}