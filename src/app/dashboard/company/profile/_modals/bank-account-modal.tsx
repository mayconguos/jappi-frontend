'use client';

import { useEffect, useState } from 'react';
import { CreditCard, X } from 'lucide-react';

import { BANCOS, TIPOS_CUENTA } from '@/constants/formOptions';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

interface BankAccount {
  account_number: string;
  account_type: number;
  cci_number: string;
  account_holder: string;
  bank: number;
}

interface BankAccountModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSave: (account: BankAccount) => void;
  readonly account?: BankAccount | null;
  readonly title?: string;
  readonly defaultAccountHolder?: string;
}

export function BankAccountModal({
  isOpen,
  onClose,
  onSave,
  account = null,
  title = "Agregar Cuenta Bancaria",
  defaultAccountHolder = ""
}: BankAccountModalProps) {
  const [formData, setFormData] = useState<BankAccount>({
    account_number: '',
    account_type: 0,
    cci_number: '',
    account_holder: '',
    bank: 0
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Función para obtener el nombre del banco
  const getBankName = (bankId: number) => {
    const banco = BANCOS.find(b => b.value === bankId);
    return banco?.label || '';
  };

  // Función para obtener el tipo de cuenta
  const getAccountTypeName = (typeId: number) => {
    const tipo = TIPOS_CUENTA.find(t => t.value === typeId);
    return tipo?.label || '';
  };

  // Inicializar el formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      if (account) {
        // Editando una cuenta existente - usar valores guardados
        setFormData(account);
      } else {
        // Agregando nueva cuenta - campos vacíos
        setFormData({
          account_number: '',
          account_type: 0, // 0 indica vacío
          cci_number: '',
          account_holder: defaultAccountHolder,
          bank: 0 // 0 indica vacío
        });
      }
      setErrors({});
    }
  }, [isOpen, account, defaultAccountHolder]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.account_number.trim()) {
      newErrors.account_number = 'El número de cuenta es requerido';
    } else if (formData.account_number.length < 10) {
      newErrors.account_number = 'El número de cuenta debe tener al menos 10 dígitos';
    }

    if (!formData.bank || formData.bank === 0) {
      newErrors.bank = 'El banco es requerido';
    }

    if (!formData.account_type || formData.account_type === 0) {
      newErrors.account_type = 'El tipo de cuenta es requerido';
    }

    if (!formData.account_holder.trim()) {
      newErrors.account_holder = 'El titular de la cuenta es requerido';
    }

    // CCI es opcional, pero si se proporciona debe tener 20 dígitos
    if (formData.cci_number && formData.cci_number.length !== 20) {
      newErrors.cci_number = 'El CCI debe tener exactamente 20 dígitos';
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
      account_number: '',
      account_type: 0,
      cci_number: '',
      account_holder: defaultAccountHolder,
      bank: 0
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
            <CreditCard className="[color:var(--button-hover-color)]" size={24} />
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
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Select
                label="Banco *"
                value={formData.bank === 0 ? '' : formData.bank?.toString() || ''}
                onChange={(value) => setFormData(prev => ({ ...prev, bank: value ? Number.parseInt(value, 10) : 0 }))}
                options={BANCOS.map(banco => ({ label: banco.label, value: banco.value.toString() }))}
                className={errors.bank ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
              />
              {errors.bank && (
                <p className="mt-1 text-sm text-red-600">{errors.bank}</p>
              )}
            </div>

            <div>
              <Select
                label="Tipo de Cuenta *"
                value={formData.account_type === 0 ? '' : formData.account_type?.toString() || ''}
                onChange={(value) => setFormData(prev => ({ ...prev, account_type: value ? Number.parseInt(value, 10) : 0 }))}
                options={TIPOS_CUENTA.map(tipo => ({ label: tipo.label, value: tipo.value.toString() }))}
                className={errors.account_type ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
              />
              {errors.account_type && (
                <p className="mt-1 text-sm text-red-600">{errors.account_type}</p>
              )}
            </div>
          </div>

          {/* Número de cuenta */}
          <div>
            <Input
              label="Número de Cuenta *"
              value={formData.account_number}
              onChange={(value) => setFormData(prev => ({ ...prev, account_number: value }))}
              placeholder="1234567890123456"
              maxLength={20}
              error={errors.account_number}
            />
          </div>

          {/* CCI */}
          <div>
            <Input
              label="CCI (Código de Cuenta Interbancaria)"
              value={formData.cci_number}
              onChange={(value) => setFormData(prev => ({ ...prev, cci_number: value }))}
              placeholder="12345678901234567890"
              maxLength={20}
              error={errors.cci_number}
            />
          </div>

          {/* Titular */}
          <div>
            <Input
              label="Titular de la Cuenta *"
              value={formData.account_holder}
              onChange={(value) => setFormData(prev => ({ ...prev, account_holder: value }))}
              placeholder="Nombre completo del titular"
              error={errors.account_holder}
            />
          </div>

          {/* Preview de la cuenta */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Vista previa de la cuenta:</h4>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Banco:</span> {getBankName(formData.bank)} <br />
              <span className="font-medium">Tipo:</span> {getAccountTypeName(formData.account_type)} <br />
              <span className="font-medium">Número:</span> {formData.account_number || 'No especificado'} <br />
              <span className="font-medium">Titular:</span> {formData.account_holder || 'No especificado'}
              {formData.cci_number && (
                <>
                  <br />
                  <span className="font-medium">CCI:</span> {formData.cci_number}
                </>
              )}
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
          >
            {account ? 'Actualizar' : 'Agregar'} Cuenta
          </Button>
        </div>
      </div>
    </div>
  );
}