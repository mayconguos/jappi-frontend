'use client';

import { useState, useEffect } from 'react';
import { Save, User, Building, CreditCard, Plus, Trash2, Smartphone, Edit } from 'lucide-react';

import api from '@/app/services/api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BankAccountManager } from '@/components/ui/bank-account-manager';
import { AddressModal } from '@/components/ui/address-modal';
import { useLocationCatalog } from '@/hooks/useLocationCatalog';

interface CompanyProfile {
  user: {
    first_name: string;
    last_name: string;
    document_type: string;
    document_number: string;
    email: string;
    password?: string;
  };
  company: {
    company_name: string;
    addresses: Array<{
      address: string;
      id_region: number;
      id_district: number;
      id_sector: number;
    }>;
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
  };
}

export default function CompanyProfilePage() {
  const [profile, setProfile] = useState<CompanyProfile>({
    user: {
      first_name: '',
      last_name: '',
      document_type: '1',
      document_number: '',
      email: ''
    },
    company: {
      company_name: '',
      addresses: [],
      phones: [],
      ruc: '',
      bank_accounts: [],
      payment_apps: []
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'personal' | 'company' | 'banking' | 'payments'>('personal');

  // Estados para el modal de direcciones
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null);

  // Hook para el catálogo de ubicaciones
  const { catalog } = useLocationCatalog();

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

  // Definir las tabs
  const tabs = [
    {
      id: 'personal' as const,
      label: 'Datos Personales',
      icon: User
    },
    {
      id: 'company' as const,
      label: 'Datos de Empresa',
      icon: Building
    },
    {
      id: 'banking' as const,
      label: 'Cuentas Bancarias',
      icon: CreditCard
    },
    {
      id: 'payments' as const,
      label: 'Apps de Pago',
      icon: Smartphone
    }
  ];

  // Asegurar que siempre haya al menos una dirección y un teléfono
  useEffect(() => {
    if (profile.company.addresses.length === 0) {
      setProfile(prev => ({
        ...prev,
        company: {
          ...prev.company,
          addresses: [{
            address: '',
            id_region: 1,
            id_district: 1,
            id_sector: 1
          }]
        }
      }));
    }
    if (profile.company.phones.length === 0) {
      setProfile(prev => ({
        ...prev,
        company: {
          ...prev.company,
          phones: ['']
        }
      }));
    }
  }, [profile.company.addresses.length, profile.company.phones.length]);

  // Cargar datos del perfil
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const response = await api.get('/company/detail', {
          headers: {
            authorization: `${token}`,
          },
        });

        if (response.data) {
          setProfile(response.data);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);



  const handleCompanyChange = (field: string, value: string | string[] | number) => {
    setProfile(prev => ({
      ...prev,
      company: {
        ...prev.company,
        [field]: value
      }
    }));
  };



  const removeAddress = (index: number) => {
    if (profile.company.addresses.length > 1) {
      setProfile(prev => ({
        ...prev,
        company: {
          ...prev.company,
          addresses: prev.company.addresses.filter((_, i) => i !== index)
        }
      }));
    }
  };

  const handlePhoneChange = (index: number, value: string) => {
    setProfile(prev => {
      const updatedPhones = [...prev.company.phones];
      updatedPhones[index] = value;
      
      return {
        ...prev,
        company: {
          ...prev.company,
          phones: updatedPhones
        }
      };
    });
  };

  const addPhone = () => {
    if (profile.company.phones.length < 5) {
      setProfile(prev => ({
        ...prev,
        company: {
          ...prev.company,
          phones: [...prev.company.phones, '']
        }
      }));
    }
  };

  const removePhone = (index: number) => {
    if (profile.company.phones.length > 1) {
      setProfile(prev => ({
        ...prev,
        company: {
          ...prev.company,
          phones: prev.company.phones.filter((_, i) => i !== index)
        }
      }));
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

  const handleAddressSave = (address: CompanyProfile['company']['addresses'][0]) => {
    setProfile(prev => {
      const updatedAddresses = [...prev.company.addresses];
      
      if (editingAddressIndex !== null) {
        // Editando una dirección existente
        updatedAddresses[editingAddressIndex] = address;
      } else {
        // Agregando nueva dirección
        updatedAddresses.push(address);
      }

      return {
        ...prev,
        company: {
          ...prev.company,
          addresses: updatedAddresses
        }
      };
    });
  };

  const handleBankAccountsChange = (bank_accounts: Array<{
    account_number: string;
    account_type: number;
    cci_number: string;
    account_holder: string;
    bank: number;
  }>) => {
    setProfile(prev => ({
      ...prev,
      company: {
        ...prev.company,
        bank_accounts
      }
    }));
  };

  const handlePaymentAppsChange = (payment_apps: Array<{
    app_name: string;
    phone_number: string;
    account_holder: string;
    document_number: string;
  }>) => {
    setProfile(prev => ({
      ...prev,
      company: {
        ...prev.company,
        payment_apps
      }
    }));
  };

  // Renderizar contenido de cada tab
  const renderPersonalTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombres
          </label>
          <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
            {profile.user.first_name || 'No especificado'}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Apellidos
          </label>
          <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
            {profile.user.last_name || 'No especificado'}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número de Documento
          </label>
          <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
            {profile.user.document_number || 'No especificado'}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Correo Electrónico
          </label>
          <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
            {profile.user.email || 'No especificado'}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompanyTab = () => (
    <div className="space-y-6">
      {/* Información Básica - Nombre y RUC en una fila */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de la Empresa
          </label>
          <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
            {profile.company.company_name || 'No especificado'}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            RUC
          </label>
          {profile.company.ruc ? (
            <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
              {profile.company.ruc}
            </div>
          ) : (
            <Input
              value={profile.company.ruc}
              onChange={(e) => handleCompanyChange('ruc', e.target.value)}
              placeholder="Ingresa el RUC de tu empresa"
              maxLength={11}
            />
          )}
        </div>
      </div>

      {/* Direcciones - Hasta 5 direcciones */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Direcciones ({profile.company.addresses.length}/5)
          </label>
          {profile.company.addresses.length < 5 && (
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

        <div className="space-y-3">
          {profile.company.addresses.length === 0 ? (
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
            profile.company.addresses.map((address, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{address.address}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {getRegionName(address.id_region)} → {getDistrictName(address.id_district)} → {getSectorName(address.id_sector)}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    type="button"
                    onClick={() => openAddressModal(index)}
                    variant="outline"
                    size="sm"
                    className="text-blue-600 hover:text-blue-800"
                    title="Editar dirección"
                  >
                    <Edit size={14} />
                  </Button>
                  {profile.company.addresses.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeAddress(index)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar dirección"
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Teléfonos - Hasta 5 números */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Teléfonos ({profile.company.phones.length}/5)
          </label>
          {profile.company.phones.length < 5 && (
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

        <div className="space-y-3">
          {profile.company.phones.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p>No hay teléfonos registrados</p>
              <Button
                type="button"
                onClick={addPhone}
                variant="outline"
                className="mt-2"
              >
                Agregar primer teléfono
              </Button>
            </div>
          ) : (
            profile.company.phones.map((phone, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-1">
                  <Input
                    value={phone}
                    onChange={(e) => handlePhoneChange(index, e.target.value)}
                    placeholder="987654321"
                    maxLength={9}
                  />
                </div>
                {profile.company.phones.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removePhone(index)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-800 p-2"
                    title="Eliminar teléfono"
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderBankingTab = () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Administra las cuentas bancarias de tu empresa. Puedes tener múltiples cuentas,
        pero una debe ser marcada como principal para los pagos.
      </p>

      <BankAccountManager
        accounts={profile.company.bank_accounts.map(acc => ({
          id: acc.account_number,
          banco: acc.bank.toString(),
          tipoCuenta: acc.account_type.toString(),
          numeroCuenta: acc.account_number,
          isPrimary: profile.company.bank_accounts.indexOf(acc) === 0
        }))}
        onAccountsChange={(accounts) => {
          const bank_accounts = accounts.map(acc => ({
            account_number: acc.numeroCuenta,
            account_type: parseInt(acc.tipoCuenta),
            cci_number: '', // Por ahora vacío, podríamos agregar un campo para esto
            account_holder: profile.user.first_name + ' ' + profile.user.last_name,
            bank: parseInt(acc.banco)
          }));
          handleBankAccountsChange(bank_accounts);
        }}
      />
    </div>
  );

  const renderPaymentsTab = () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Configura las aplicaciones de pago móvil para facilitar las transacciones.
      </p>

      {profile.company.payment_apps.map((app, index) => (
        <div key={index} className="p-4 border border-gray-200 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aplicación
              </label>
              <Input
                value={app.app_name}
                onChange={(e) => {
                  const updatedApps = [...profile.company.payment_apps];
                  updatedApps[index] = { ...app, app_name: e.target.value };
                  handlePaymentAppsChange(updatedApps);
                }}
                placeholder="Yape"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Teléfono
              </label>
              <Input
                value={app.phone_number}
                onChange={(e) => {
                  const updatedApps = [...profile.company.payment_apps];
                  updatedApps[index] = { ...app, phone_number: e.target.value };
                  handlePaymentAppsChange(updatedApps);
                }}
                placeholder="911111111"
                maxLength={9}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titular de la Cuenta
              </label>
              <Input
                value={app.account_holder}
                onChange={(e) => {
                  const updatedApps = [...profile.company.payment_apps];
                  updatedApps[index] = { ...app, account_holder: e.target.value };
                  handlePaymentAppsChange(updatedApps);
                }}
                placeholder="Nombre del titular"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Documento
              </label>
              <Input
                value={app.document_number}
                onChange={(e) => {
                  const updatedApps = [...profile.company.payment_apps];
                  updatedApps[index] = { ...app, document_number: e.target.value };
                  handlePaymentAppsChange(updatedApps);
                }}
                placeholder="Documento del titular"
              />
            </div>
          </div>
        </div>
      ))}

      {profile.company.payment_apps.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No hay aplicaciones de pago configuradas</p>
          <Button
            onClick={() => handlePaymentAppsChange([{
              app_name: '',
              phone_number: '',
              account_holder: '',
              document_number: ''
            }])}
            className="mt-2"
            variant="outline"
          >
            Agregar aplicación de pago
          </Button>
        </div>
      )}

      {profile.company.payment_apps.length > 0 && (
        <Button
          onClick={() => handlePaymentAppsChange([
            ...profile.company.payment_apps,
            {
              app_name: '',
              phone_number: '',
              account_holder: '',
              document_number: ''
            }
          ])}
          variant="outline"
          size="sm"
        >
          <Plus size={16} className="mr-2" />
          Agregar otra aplicación
        </Button>
      )}
    </div>
  );

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem('token');

      await api.put('/company/profile', profile, {
        headers: {
          authorization: `${token}`,
        },
      });

      setSuccess('Perfil actualizado correctamente');

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Error al guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Mensajes de estado */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600">{success}</p>
        </div>
      )}

      {/* Sistema de Tabs */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors duration-200 border-b-2 ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-blue-600 bg-white'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'personal' && renderPersonalTab()}
          {activeTab === 'company' && renderCompanyTab()}
          {activeTab === 'banking' && renderBankingTab()}
          {activeTab === 'payments' && renderPaymentsTab()}
        </div>
      </div>



      {/* Botón de guardar fijo en la parte inferior */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-6">
        <div className="max-w-6xl mx-auto flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save size={16} className="mr-2" />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </div>

      {/* Modal de direcciones */}
      <AddressModal
        isOpen={addressModalOpen}
        onClose={closeAddressModal}
        onSave={handleAddressSave}
        address={editingAddressIndex !== null ? profile.company.addresses[editingAddressIndex] : null}
        title={editingAddressIndex !== null ? "Editar Dirección" : "Agregar Dirección"}
      />
    </div>
  );
}
