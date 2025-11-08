import { useState } from 'react';
import { Edit, Plus, Trash2 } from 'lucide-react';

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
  onUpdate: (data: { phones?: string[], addresses?: Address[], ruc?: string }) => void;
  onSave: () => Promise<boolean>;
}

export default function CompanySection({
  company,
  onUpdate,
  onSave
}: CompanySectionProps) {
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

  // Funciones internas para manejar teléfonos
  const handlePhoneChange = (index: number, value: string) => {
    const updatedPhones = [...company.phones];
    updatedPhones[index] = value;
    onUpdate({ phones: updatedPhones });
  };

  const addPhone = () => {
    if (company.phones.length < 4) {
      onUpdate({ phones: [...company.phones, ''] });
    }
  };

  const removePhone = (index: number) => {
    if (company.phones.length > 1) {
      const updatedPhones = company.phones.filter((_, i) => i !== index);
      onUpdate({ phones: updatedPhones });
    }
  };

  // Función interna para manejar direcciones
  const removeAddress = (index: number) => {
    if (company.addresses.length > 1) {
      const updatedAddresses = company.addresses.filter((_, i) => i !== index);
      onUpdate({ addresses: updatedAddresses });
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
    const updatedAddresses = [...company.addresses];

    if (editingAddressIndex !== null) {
      // Editando una dirección existente
      updatedAddresses[editingAddressIndex] = address;
    } else {
      // Agregando nueva dirección
      updatedAddresses.push(address);
    }

    onUpdate({ addresses: updatedAddresses });
    closeAddressModal();
  };


  return (
    <div className="space-y-6">
      {/* Información Básica - Nombre y RUC en una fila */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Input
            label="Nombre de la Empresa"
            value={company.company_name || 'No especificado'}
            disabled
          />
        </div>

        <div>
          <Input
            label="RUC"
            value={company.ruc || ''}
            onChange={(value) => onUpdate({ ruc: value })}
            placeholder="Ingresa el RUC de tu empresa"
            maxLength={11}
            disabled={!!company.ruc}
          />
        </div>
      </div>

      {/* Direcciones - Hasta 4 direcciones en cuadrícula 2x2 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Direcciones ({company.addresses.length}/4)
          </label>
          {company.addresses.length < 4 && (
            <Button
              type="button"
              onClick={() => openAddressModal()}
              variant="outline"
              size="sm"
              className="text-blue-600 hover:text-blue-800"
            >
              <Plus size={16} className="mr-1" />
              Agregar dirección
            </Button>
          )}
        </div>

        {company.addresses.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="mb-3">No hay direcciones registradas</p>
            <Button
              type="button"
              onClick={() => openAddressModal()}
              variant="outline"
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              <Plus size={16} className="mr-2" />
              Agregar primera dirección
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {company.addresses.map((address, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{address.address}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {[
                        getRegionName(address.id_region),
                        getDistrictName(address.id_district),
                        getSectorName(address.id_sector)
                      ].filter(Boolean).join(' → ') || 'Ubicación no especificada'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                    <Button
                      type="button"
                      onClick={() => openAddressModal(index)}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-800 p-2"
                      title="Editar dirección"
                    >
                      <Edit size={14} />
                    </Button>
                    {company.addresses.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeAddress(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-800 p-2"
                        title="Eliminar dirección"
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Teléfonos - Hasta 4 números en cuadrícula 2x2 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Teléfonos ({company.phones.length}/4)
          </label>
          {company.phones.length < 4 && (
            <Button
              type="button"
              onClick={addPhone}
              variant="outline"
              size="sm"
              className="text-blue-600 hover:text-blue-800"
            >
              <Plus size={16} className="mr-1" />
              Agregar teléfono
            </Button>
          )}
        </div>

        {company.phones.length === 0 ? (
          <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="mb-3">No hay teléfonos registrados</p>
            <Button
              type="button"
              onClick={addPhone}
              variant="outline"
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              <Plus size={16} className="mr-2" />
              Agregar primer teléfono
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {company.phones.map((phone, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      label={`Teléfono ${index + 1}`}
                      value={phone}
                      onChange={(value) => handlePhoneChange(index, value)}
                      placeholder="987654321"
                      maxLength={9}
                    />
                  </div>
                  {company.phones.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removePhone(index)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-800 p-2 flex-shrink-0"
                      title="Eliminar teléfono"
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botón de guardar */}
      <SaveButton onSave={onSave} />

      {/* Modal de direcciones */}
      <AddressModal
        isOpen={addressModalOpen}
        onClose={closeAddressModal}
        onSave={handleAddressSave}
        address={editingAddressIndex !== null ? company.addresses[editingAddressIndex] : null}
        title={editingAddressIndex !== null ? "Editar Dirección" : "Agregar Dirección"}
      />
    </div>
  );
}