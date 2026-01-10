import { useState, useEffect } from 'react';
import { Edit, Plus, Trash2, Building2, MapPin, Phone } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SaveButton } from '@/components/ui/save-button';
import { AddressModal } from '@/app/dashboard/company/profile/_modals/address-modal';

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
    <div className="p-6 md:p-8 space-y-12 animate-in fade-in duration-500">
      {/* Información Básica */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
            <Building2 size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">Datos de la Empresa</h3>
            <p className="text-sm text-gray-500 mt-0.5">Información legal y tributaria de tu negocio</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
          <div className="group">
            <Input
              label="Nombre de la Empresa"
              value={formData.company_name || 'No especificado'}
              disabled
              className="bg-white/50"
            />
          </div>

          <div className="group">
            <Input
              label="RUC"
              value={formData.ruc || ''}
              onChange={(value) => setFormData(prev => ({ ...prev, ruc: value }))}
              placeholder="Ingresa el RUC de tu empresa"
              maxLength={11}
              disabled={!!savedRuc} // Bloqueado SOLO si ya está guardado en backend
              className="bg-white"
            />
          </div>
        </div>
      </section>

      {/* Direcciones */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
              <MapPin size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">Sedes y Direcciones</h3>
              <p className="text-sm text-gray-500 mt-0.5">Gestiona los puntos de recojo y entrega ({formData.addresses.length}/4)</p>
            </div>
          </div>
          {formData.addresses.length < 4 && (
            <Button
              type="button"
              onClick={() => openAddressModal()}
              variant="outline"
              size="sm"
              className="rounded-full px-4 border-slate-200 hover:border-[var(--button-hover-color)] hover:text-[var(--button-hover-color)] transition-all"
            >
              <Plus size={16} className="mr-1.5" />
              Nueva Dirección
            </Button>
          )}
        </div>

        {formData.addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl group hover:border-[var(--button-hover-color)]/30 transition-colors">
            <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 mb-4 group-hover:text-[var(--button-hover-color)] transition-colors">
              <MapPin size={32} />
            </div>
            <p className="text-gray-500 font-medium mb-6">No hay direcciones registradas para esta empresa</p>
            <Button
              type="button"
              onClick={() => openAddressModal()}
              className="rounded-full px-8 shadow-lg shadow-[var(--button-hover-color)]/10"
            >
              <Plus size={18} className="mr-2" />
              Agregar primera dirección
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {formData.addresses.map((address, index) => (
              <div key={index} className="group relative p-6 bg-white border border-slate-100 rounded-2xl hover:border-[var(--button-hover-color)]/30 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-12">
                    <p className="font-bold text-gray-900 text-lg mb-2 truncate group-hover:text-[var(--button-hover-color)] transition-colors">{address.address}</p>
                    <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg w-fit">
                      <MapPin size={14} />
                      <p className="text-sm font-medium">
                        {[
                          getRegionName(address.id_region),
                          getDistrictName(address.id_district),
                          getSectorName(address.id_sector)
                        ].filter(Boolean).join(' • ')}
                      </p>
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      type="button"
                      onClick={() => openAddressModal(index)}
                      variant="ghost"
                      size="icon"
                      className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600"
                      title="Editar dirección"
                    >
                      <Edit size={16} />
                    </Button>
                    {formData.addresses.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeAddress(index)}
                        variant="ghost"
                        size="icon"
                        className="w-10 h-10 rounded-full bg-red-50 hover:bg-red-100 text-red-500"
                        title="Eliminar dirección"
                      >
                        <Trash2 size={16} />
                      </Button>
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
              <Phone size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">Canales de Contacto</h3>
              <p className="text-sm text-gray-500 mt-0.5">Teléfonos registrados para notificaciones ({formData.phones.length}/4)</p>
            </div>
          </div>
          {formData.phones.length < 4 && (
            <Button
              type="button"
              onClick={addPhone}
              variant="outline"
              size="sm"
              className="rounded-full px-4 border-slate-200 hover:border-[var(--button-hover-color)] hover:text-[var(--button-hover-color)] transition-all"
            >
              <Plus size={16} className="mr-1.5" />
              Añadir Teléfono
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
          {formData.phones.map((phone, index) => (
            <div key={index} className="group flex items-end gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-[var(--button-hover-color)]/20 hover:shadow-lg hover:shadow-slate-100/50 transition-all">
              <div className="flex-1">
                <Input
                  label={`Teléfono ${index + 1}`}
                  value={phone}
                  onChange={(value) => handlePhoneChange(index, value)}
                  placeholder="987 654 321"
                  maxLength={9}
                  className="bg-transparent border-none shadow-none focus:ring-0 p-0 text-lg font-bold placeholder:text-slate-300"
                />
              </div>
              {formData.phones.length > 1 && (
                <Button
                  type="button"
                  onClick={() => removePhone(index)}
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 rounded-full bg-slate-100/50 hover:bg-red-50 text-slate-400 hover:text-red-500 shrink-0 transition-colors"
                  title="Eliminar teléfono"
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Botón de guardar */}
      <div className="flex justify-end pt-8 border-t border-gray-100">
        <SaveButton onSave={handleLocalSave} />
      </div>

      {/* Modal de direcciones */}
      <AddressModal
        isOpen={addressModalOpen}
        onClose={closeAddressModal}
        onSave={handleAddressSave}
        address={editingAddressIndex !== null ? formData.addresses[editingAddressIndex] : null}
        title={editingAddressIndex !== null ? "Editar Dirección" : "Agregar Nueva Dirección"}
      />
    </div>
  );
}