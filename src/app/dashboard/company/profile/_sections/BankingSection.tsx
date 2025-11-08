import { useState } from 'react';
import { Edit, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { SaveButton } from '@/components/ui/save-button';
import { BankAccountModal } from '@/app/dashboard/company/profile/_modals/bank-account-modal';

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

  // Función para obtener el nombre del banco
  const getBankName = (bankId: number) => {
    const banks: { [key: number]: string } = {
      1: 'BCP',
      2: 'BBVA',
      3: 'Interbank',
      4: 'Scotiabank',
      5: 'Banco de la Nación',
    };
    return banks[bankId] || `Banco ${bankId}`;
  };

  // Función para obtener el tipo de cuenta
  const getAccountTypeName = (typeId: number) => {
    const types: { [key: number]: string } = {
      1: 'Ahorros',
      2: 'Corriente',
    };
    return types[typeId] || `Tipo ${typeId}`;
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
                    <p className="font-medium text-gray-900 truncate">{getBankName(account.bank)}</p>
                    <p className="text-sm text-gray-600 mt-1">
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