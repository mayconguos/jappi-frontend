'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';

import { BANCOS, TIPOS_CUENTA } from '@/constants/formOptions';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal, ModalFooter } from '@/components/ui/modal';

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
  title = "Vincular Cuenta Bancaria",
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

  // Inicializar el formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      if (account) {
        setFormData(account);
      } else {
        setFormData({
          account_number: '',
          account_type: 0,
          cci_number: '',
          account_holder: defaultAccountHolder,
          bank: 0
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
      newErrors.account_number = 'Número de cuenta demasiado corto';
    }

    if (!formData.bank || formData.bank === 0) {
      newErrors.bank = 'Selecciona una institución';
    }

    if (!formData.account_type || formData.account_type === 0) {
      newErrors.account_type = 'Selecciona el tipo de cuenta';
    }

    if (!formData.account_holder.trim()) {
      newErrors.account_holder = 'El titular es requerido';
    }

    if (formData.cci_number && formData.cci_number.length !== 20) {
      newErrors.cci_number = 'El CCI debe tener 20 dígitos';
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
    onClose();
  };

  // Convertir opciones a formato string para el componente Select
  const bankOptions = BANCOS.map(b => ({ label: b.label, value: b.value.toString() }));
  const typeOptions = TIPOS_CUENTA.map(t => ({ label: t.label, value: t.value.toString() }));

  const footerContent = (
    <ModalFooter>
      <Button
        type="button"
        variant="secondary"
        onClick={handleCancel}
      >
        Cancelar
      </Button>
      <Button
        type="button"
        onClick={handleSave}
        className="shadow-lg shadow-[var(--button-hover-color)]/20"
      >
        {account ? 'Actualizar Cuenta' : 'Vincular Cuenta'}
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={title}
      description="Los abonos se realizarán exclusivamente a la cuenta seleccionada como principal."
      size="xl"
      footer={footerContent}
    >
      <div className="space-y-8 py-2">
        {/* Entidad y Tipo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
          <div className="space-y-1">
            <Select
              label="Institución Financiera *"
              value={formData.bank === 0 ? '' : formData.bank.toString()}
              onChange={(value) => setFormData(prev => ({ ...prev, bank: parseInt(value) || 0 }))}
              options={bankOptions}
              className={errors.bank ? 'border-red-300' : ''}
            />
            {errors.bank && <p className="text-[10px] text-red-500 font-bold uppercase ml-1 tracking-wider">{errors.bank}</p>}
          </div>

          <div className="space-y-1">
            <Select
              label="Tipo de Cuenta *"
              value={formData.account_type === 0 ? '' : formData.account_type.toString()}
              onChange={(value) => setFormData(prev => ({ ...prev, account_type: parseInt(value) || 0 }))}
              options={typeOptions}
              className={errors.account_type ? 'border-red-300' : ''}
            />
            {errors.account_type && <p className="text-[10px] text-red-500 font-bold uppercase ml-1 tracking-wider">{errors.account_type}</p>}
          </div>
        </div>

        {/* Datos de la Cuenta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <Input
              label="Número de Cuenta *"
              value={formData.account_number}
              onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
              placeholder="0000-0000-0000000000"
              error={errors.account_number}
            />
          </div>

          <div className="space-y-1">
            <Input
              label="Número CCI (Opcional)"
              value={formData.cci_number || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, cci_number: e.target.value }))}
              placeholder="000-000-000000000000-00"
              maxLength={20}
              error={errors.cci_number}
            />
          </div>
        </div>

        {/* Titular */}
        <div className="group">
          <Input
            label="Titular de la Cuenta *"
            value={formData.account_holder}
            onChange={(e) => setFormData(prev => ({ ...prev, account_holder: e.target.value }))}
            placeholder="Nombre completo del titular"
            error={errors.account_holder}
          />
          <p className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[10px] text-emerald-800 font-medium leading-relaxed flex items-start gap-2">
            <ShieldCheck size={14} className="text-emerald-500 shrink-0 mt-0.5" />
            Por seguridad, la cuenta debe estar a nombre de la empresa o del representante legal registrado. No se aceptan cuentas de terceros.
          </p>
        </div>
      </div>
    </Modal>
  );
}