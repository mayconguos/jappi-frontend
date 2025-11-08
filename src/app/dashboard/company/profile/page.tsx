'use client';

import { useEffect, useState } from 'react';
import { Building, CreditCard, Smartphone, User } from 'lucide-react';

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
  const handleSave = async () => {
    try {
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
          onUpdate={(data) => updateCompanyData(data)}
          onSave={handleSave}
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
      <Tabs tabs={tabs} defaultTab="personal" />


    </div>
  );
}
