import { useState } from 'react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';

import { BANCOS, TIPOS_CUENTA } from '@/constants/formOptions';
import { BankAccountModal } from '../_modals/bank-account-modal';

import { Button } from '@/components/ui/button';
import { SaveButton } from '@/components/ui/save-button';

interface BankAccount {
  account_number: string;
  account_type: number;
  cci_number: string;
  account_holder: string;
  bank: number;
}

interface User {
  first_name: string;
  last_name: string;
}

interface BankingSectionProps {
  bankAccounts: BankAccount[];
  user: User;
  onUpdate: (bankAccounts: Array<{
    account_number: string;
    account_type: number;
    cci_number: string;
    account_holder: string;
    bank: number;
  }>) => void;
  onSave: () => Promise<boolean>;
}

export default function BankingSection({
  bankAccounts,
  user,
  onUpdate,
  onSave
}: BankingSectionProps) {
  // Estados para el modal de cuenta bancaria (preparado para futuro modal)
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [editingBankIndex, setEditingBankIndex] = useState<number | null>(null);

  // Funciones para manejar cuentas bancarias
  const addBankAccount = () => {
    if (bankAccounts.length < 4) {
      setEditingBankIndex(null); // Nueva cuenta
      setBankModalOpen(true);
    }
  };

  const removeBankAccount = (index: number) => {
    if (bankAccounts.length > 1) {
      const updatedAccounts = bankAccounts.filter((_, i) => i !== index);
      onUpdate(updatedAccounts);
    }
  };

  const openBankModal = (index?: number) => {
    setEditingBankIndex(index ?? null);
    setBankModalOpen(true);
  };

  const closeBankModal = () => {
    setBankModalOpen(false);
    setEditingBankIndex(null);
  };

  const handleSaveBankAccount = (accountData: BankAccount) => {
    if (editingBankIndex !== null) {
      // Editando cuenta existente
      const updatedAccounts = [...bankAccounts];
      updatedAccounts[editingBankIndex] = accountData;
      onUpdate(updatedAccounts);
    } else {
      // Agregando nueva cuenta
      onUpdate([...bankAccounts, accountData]);
    }
  };

  // Función para obtener el ícono del banco
  const getBankIcon = (bankId: number) => {
    switch (bankId) {
      case 1: // BBVA
        return <Image src="/icons/bbva.svg" alt="BBVA" width={70} height={48} />;
      case 2: // BCP
        return <Image src="/icons/bcp.svg" alt="BCP" width={70} height={48} />;
      case 3: // Interbank
        return <Image src="/icons/interbank.svg" alt="Interbank" width={110} height={48} />;
      case 4: // Scotiabank
        return <Image src="/icons/scotiabank.svg" alt="Scotiabank" width={110} height={48} />;
      default:
        return null;
    }
  };

  const getBankName = (bankId: number) => {
    const bank = BANCOS.find(b => b.value === bankId);
    return bank?.label || `Banco ${bankId}`;
  };

  const getAccountTypeName = (typeId: number) => {
    const accountType = TIPOS_CUENTA.find(t => t.value === typeId);
    return accountType?.label || `Tipo ${typeId}`;
  };
  return (
    <div className="space-y-6">
      {/* Cuentas Bancarias - Hasta 4 cuentas en cuadrícula 2x2 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Cuentas Bancarias ({bankAccounts.length}/4)
          </label>
          {bankAccounts.length < 4 && (
            <Button
              type="button"
              onClick={addBankAccount}
              variant="outline"
              size="sm"
              className="text-blue-600 hover:text-blue-800"
            >
              <Plus size={16} className="mr-1" />
              Agregar cuenta
            </Button>
          )}
        </div>

        {bankAccounts.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="mb-3">No hay cuentas bancarias registradas</p>
            <Button
              type="button"
              onClick={addBankAccount}
              variant="outline"
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              <Plus size={16} className="mr-2" />
              Agregar primera cuenta
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {bankAccounts.map((account, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="mb-2">
                      {getBankIcon(account.bank) || (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {getBankName(account.bank).charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {getAccountTypeName(account.account_type)} • {account.account_number}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {account.account_holder}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                    <Button
                      type="button"
                      onClick={() => openBankModal(index)}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-800 p-2"
                      title="Editar cuenta"
                    >
                      <Edit size={14} />
                    </Button>
                    {bankAccounts.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeBankAccount(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-800 p-2"
                        title="Eliminar cuenta"
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

      {/* Botón de guardar */}
      <SaveButton onSave={onSave} />

      {/* Modal de cuenta bancaria */}
      <BankAccountModal
        isOpen={bankModalOpen}
        onClose={closeBankModal}
        onSave={handleSaveBankAccount}
        account={editingBankIndex !== null ? bankAccounts[editingBankIndex] : null}
        title={editingBankIndex !== null ? "Editar Cuenta Bancaria" : "Agregar Cuenta Bancaria"}
        defaultAccountHolder={`${user.first_name} ${user.last_name}`}
      />
    </div>
  );
}