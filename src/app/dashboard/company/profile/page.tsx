'use client';

import { useState, useEffect, useMemo } from 'react';
import { Save, User, Building, CreditCard } from 'lucide-react';

import api from '@/app/services/api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { BankAccountManager } from '@/components/ui/bank-account-manager';
import { useLocationCatalog } from '@/hooks/useLocationCatalog';

interface CompanyProfile {
  // Datos personales
  nombres: string;
  apellidos: string;
  dni: string;
  email: string;

  // Datos de la empresa
  nombreEmpresa: string;
  direccion: string;
  distrito: string;
  telefono: string;
  ruc: string;

  // Ubicación
  ubicacion?: {
    lat: number;
    lng: number;
    address: string;
  };

  // Cuentas bancarias
  cuentasBancarias: Array<{
    id: string;
    banco: string;
    tipoCuenta: string;
    numeroCuenta: string;
    isPrimary?: boolean;
  }>;
}

export default function CompanyProfilePage() {
  const [profile, setProfile] = useState<CompanyProfile>({
    nombres: '',
    apellidos: '',
    dni: '',
    email: '',
    nombreEmpresa: '',
    direccion: '',
    distrito: '',
    telefono: '',
    ruc: '',
    cuentasBancarias: []
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Hook para el catálogo de ubicaciones
  const { catalog } = useLocationCatalog();

  // Crear lista de todos los distritos de todas las regiones
  const allDistrictOptions = useMemo(() => {
    if (!catalog) return [];
    
    const allDistricts: Array<{ label: string; value: string }> = [];
    catalog.forEach(region => {
      region.districts.forEach(district => {
        allDistricts.push({
          label: `${district.district_name} (${region.region_name})`,
          value: district.id_district.toString()
        });
      });
    });
    
    return allDistricts.sort((a, b) => a.label.localeCompare(b.label));
  }, [catalog]);

  // Cargar datos del perfil
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const response = await api.get('/company/profile', {
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

  const handleInputChange = (field: keyof CompanyProfile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const handleBankAccountsChange = (cuentasBancarias: Array<{
    id: string;
    banco: string;
    tipoCuenta: string;
    numeroCuenta: string;
    isPrimary?: boolean;
  }>) => {
    setProfile(prev => ({
      ...prev,
      cuentasBancarias
    }));
  };

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

      {/* Sección: Datos Personales */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="text-blue-600" size={20} />
          <h2 className="text-xl font-semibold text-gray-800">Datos Personales</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombres *
            </label>
            <Input
              value={profile.nombres}
              onChange={(e) => handleInputChange('nombres', e.target.value)}
              placeholder="Ingresa tus nombres"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apellidos *
            </label>
            <Input
              value={profile.apellidos}
              onChange={(e) => handleInputChange('apellidos', e.target.value)}
              placeholder="Ingresa tus apellidos"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              DNI *
            </label>
            <Input
              value={profile.dni}
              onChange={(e) => handleInputChange('dni', e.target.value)}
              placeholder="12345678"
              maxLength={8}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico *
            </label>
            <Input
              type="email"
              value={profile.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="correo@ejemplo.com"
            />
          </div>
        </div>
      </div>

      {/* Sección: Datos de la Empresa */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <Building className="text-blue-600" size={20} />
          <h2 className="text-xl font-semibold text-gray-800">Datos de la Empresa</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Empresa *
            </label>
            <Input
              value={profile.nombreEmpresa}
              onChange={(e) => handleInputChange('nombreEmpresa', e.target.value)}
              placeholder="Nombre de tu empresa"
            />
          </div>

          <div className="md:col-span-1 lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección *
            </label>
            <Input
              value={profile.direccion}
              onChange={(e) => handleInputChange('direccion', e.target.value)}
              placeholder="Av. Ejemplo 123, Oficina 456"
            />
          </div>

          <div>
            <Select
              label="Distrito *"
              value={profile.distrito}
              onChange={(value) => handleInputChange('distrito', value)}
              options={allDistrictOptions}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono *
            </label>
            <Input
              value={profile.telefono}
              onChange={(e) => handleInputChange('telefono', e.target.value)}
              placeholder="987654321"
              maxLength={9}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              RUC (opcional)
            </label>
            <Input
              value={profile.ruc}
              onChange={(e) => handleInputChange('ruc', e.target.value)}
              placeholder="12345678901"
              maxLength={11}
            />
          </div>
        </div>
      </div>

      {/* Sección: Cuentas Bancarias */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <CreditCard className="text-blue-600" size={20} />
          <h2 className="text-xl font-semibold text-gray-800">Gestión de Cuentas Bancarias</h2>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Administra las cuentas bancarias de tu empresa. Puedes tener múltiples cuentas,
            pero una debe ser marcada como principal para los pagos.
          </p>

          <BankAccountManager
            accounts={profile.cuentasBancarias}
            onAccountsChange={handleBankAccountsChange}
          />
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
    </div>
  );
}
