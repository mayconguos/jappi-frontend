'use client';

import { useEffect, useState } from 'react';
import { Building, CreditCard, Smartphone, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import secureLocalStorage from 'react-secure-storage';

import api from '@/app/services/api';

import { Tabs, TabItem } from '@/components/ui/tabs';
import DeliveryLoader from '@/components/ui/delivery-loader';

import BankingSection from './_sections/BankingSection';
import CompanySection from './_sections/CompanySection';
import PaymentsSection from './_sections/PaymentsSection';
import PersonalSection from './_sections/PersonalSection';
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
      id_sector?: number;
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

  // Estado para controlar si el RUC ya estaba guardado
  const [savedRuc, setSavedRuc] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
        const user = secureLocalStorage.getItem('user') as { id?: number | string } | null;

        if (!user || !user.id) {
          console.error('User ID not found in secure storage');
          setError('No se pudo identificar al usuario. Por favor, inicie sesión nuevamente.');
          return;
        }

        const response = await api.get(`/user/company/detail/${user.id}`, {
          headers: {
            authorization: `${token}`,
          },
        });

        if (response.data) {
          setProfile(response.data);
          // Establecer el RUC guardado inicial
          setSavedRuc(response.data.company.ruc || '');
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

  // Función coordinadora para actualizar datos de la empresa
  const updateCompanyData = (updates: Partial<CompanyProfile['company']>) => {
    setProfile(prev => ({
      ...prev,
      company: {
        ...prev.company,
        ...updates
      }
    }));
  };

  // Función de guardado que pueden usar las secciones
  const handleSave = async (updates?: Partial<CompanyProfile['company']>) => {
    try {
      setError(null);
      setSuccess(null);

      // Si hay actualizaciones, mezclarlas con el estado actual
      const updatedProfile = { ...profile };
      if (updates) {
        updatedProfile.company = { ...updatedProfile.company, ...updates };
      }

      const token = localStorage.getItem('token');

      await api.put('/company/profile', updatedProfile, {
        headers: {
          authorization: `${token}`,
        },
      });

      // Actualizar el estado local con los nuevos datos guardados
      if (updates) {
        setProfile(updatedProfile);
      }

      setSuccess('Perfil actualizado correctamente');

      // Actualizar el RUC guardado después de un guardado exitoso
      if (updatedProfile.company.ruc) {
        setSavedRuc(updatedProfile.company.ruc);
      }

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(null), 3000);

      return true;
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Error al guardar el perfil');
      return false;
    }
  };

  // Definir las tabs para el componente Tabs
  const tabs: TabItem[] = [
    {
      id: 'personal',
      label: 'Datos personales',
      icon: User,
      content: <PersonalSection user={profile.user} />
    },
    {
      id: 'company',
      label: 'Datos de empresa',
      icon: Building,
      content: (
        <CompanySection
          company={profile.company}
          onSave={handleSave}
          savedRuc={savedRuc}
        />
      )
    },
    {
      id: 'banking',
      label: 'Cuentas bancarias',
      icon: CreditCard,
      content: (
        <BankingSection
          bankAccounts={profile.company.bank_accounts}
          user={profile.user}
          onUpdate={(bankAccounts) => updateCompanyData({ bank_accounts: bankAccounts })}
          onSave={handleSave}
        />
      )
    },
    {
      id: 'payments',
      label: 'Apps de pago',
      icon: Smartphone,
      content: (
        <PaymentsSection
          paymentApps={profile.company.payment_apps}
          onUpdate={(paymentApps) => updateCompanyData({ payment_apps: paymentApps })}
          onSave={handleSave}
        />
      )
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <DeliveryLoader
          size="lg"
          message="Cargando perfil..."
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">

      {/* Mensajes de estado con estética moderna */}
      <div className="fixed top-24 right-8 z-50 flex flex-col gap-3 w-full max-w-md pointer-events-none">
        {error && (
          <div className="p-4 bg-red-50/90 backdrop-blur-sm border border-red-100 rounded-xl shadow-lg shadow-red-500/10 flex items-center gap-3 animate-in slide-in-from-right-8 pointer-events-auto">
            <AlertCircle className="text-red-500 shrink-0" size={20} />
            <p className="text-red-800 font-medium text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50/90 backdrop-blur-sm border border-emerald-100 rounded-xl shadow-lg shadow-emerald-500/10 flex items-center gap-3 animate-in slide-in-from-right-8 pointer-events-auto">
            <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
            <p className="text-emerald-800 font-medium text-sm">{success}</p>
          </div>
        )}
      </div>

      {/* Sistema de Tabs */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <Tabs tabs={tabs} defaultTab="personal" />
      </div>
    </div>
  );
}
