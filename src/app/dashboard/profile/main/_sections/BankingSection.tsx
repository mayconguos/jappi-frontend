import { useState } from 'react';
import { Edit, Plus, Trash2, Landmark } from 'lucide-react';
import Image from 'next/image';

import { TIPOS_CUENTA } from '@/constants/formOptions';
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

  // const getBankName = (bankId: number) => {
  //   const bank = BANCOS.find(b => b.value === bankId);
  //   return bank?.label || `Banco ${bankId}`;
  // };

  const getAccountTypeName = (typeId: number) => {
    const accountType = TIPOS_CUENTA.find(t => t.value === typeId);
    return accountType?.label || `Tipo ${typeId}`;
  };
  return (
    <div className="p-6 md:p-8 space-y-12 animate-in fade-in duration-500">
      {/* Cuentas Bancarias */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
              <Landmark size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">Cuentas Bancarias</h3>
              <p className="text-sm text-gray-500 mt-0.5">Configura dónde recibirás tus abonos ({bankAccounts.length}/4)</p>
            </div>
          </div>
          {bankAccounts.length < 4 && (
            <Button
              type="button"
              onClick={addBankAccount}
              variant="outline"
              size="sm"
              className="rounded-full px-4 border-slate-200 hover:border-[var(--button-hover-color)] hover:text-[var(--button-hover-color)] transition-all font-semibold"
            >
              <Plus size={16} className="mr-1.5" />
              Nueva Cuenta
            </Button>
          )}
        </div>

        {bankAccounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl group hover:border-[var(--button-hover-color)]/30 transition-colors">
            <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 mb-4 group-hover:text-[var(--button-hover-color)] transition-colors">
              <Landmark size={32} />
            </div>
            <p className="text-gray-500 font-medium mb-6">No hay cuentas bancarias registradas</p>
            <Button
              type="button"
              onClick={addBankAccount}
              className="rounded-full px-8 shadow-lg shadow-[var(--button-hover-color)]/10"
            >
              <Plus size={18} className="mr-2" />
              Agregar primera cuenta
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {bankAccounts.map((account, index) => (
              <div key={index} className="group relative p-6 bg-white border border-slate-100 rounded-3xl hover:border-[var(--button-hover-color)]/30 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 overflow-hidden">
                {/* Background Decor */}
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500" />

                <div className="flex flex-col h-full relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="h-10 flex items-center">
                      {getBankIcon(account.bank) || (
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                          <Landmark size={20} className="text-slate-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        onClick={() => openBankModal(index)}
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                        title="Editar cuenta"
                      >
                        <Edit size={14} />
                      </Button>
                      {bankAccounts.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeBankAccount(index)}
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                          title="Eliminar cuenta"
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Número de Cuenta</p>
                      <p className="text-xl font-bold text-gray-900 font-mono tracking-tight group-hover:text-[var(--button-hover-color)] transition-colors">
                        {account.account_number}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Tipo de Cuenta</p>
                        <p className="text-sm font-semibold text-gray-700">{getAccountTypeName(account.account_type)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Titular</p>
                        <p className="text-sm font-semibold text-gray-700 truncate max-w-[150px]">{account.account_holder}</p>
                      </div>
                    </div>

                    {account.cci_number && (
                      <div className="bg-slate-50/80 rounded-xl p-3 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CCI</span>
                        <span className="text-xs font-mono font-semibold text-slate-600">{account.cci_number}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Botón de guardar */}
      <div className="flex justify-end pt-8 border-t border-gray-100">
        <SaveButton onSave={onSave} />
      </div>

      {/* Modal de cuenta bancaria */}
      <BankAccountModal
        isOpen={bankModalOpen}
        onClose={closeBankModal}
        onSave={handleSaveBankAccount}
        account={editingBankIndex !== null ? bankAccounts[editingBankIndex] : null}
        title={editingBankIndex !== null ? "Editar Cuenta Bancaria" : "Vincular Nueva Cuenta"}
        defaultAccountHolder={`${user.first_name} ${user.last_name}`}
      />
    </div>
  );
}