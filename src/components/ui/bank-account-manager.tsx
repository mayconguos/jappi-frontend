'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

import { Button } from './button';
import { Input } from './input';
import { Select } from './select';
import { BANCOS, TIPOS_CUENTA } from '@/constants/formOptions';

interface BankAccount {
  id: string;
  banco: string;
  tipoCuenta: string;
  numeroCuenta: string;
  isPrimary?: boolean;
}

interface BankAccountManagerProps {
  accounts: BankAccount[];
  onAccountsChange: (accounts: BankAccount[]) => void;
  className?: string;
}

export function BankAccountManager({ 
  accounts, 
  onAccountsChange, 
  className = '' 
}: BankAccountManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    banco: '',
    tipoCuenta: '',
    numeroCuenta: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.banco) {
      newErrors.banco = 'Selecciona un banco';
    }
    if (!formData.tipoCuenta) {
      newErrors.tipoCuenta = 'Selecciona un tipo de cuenta';
    }
    if (!formData.numeroCuenta) {
      newErrors.numeroCuenta = 'Ingresa el número de cuenta';
    } else if (formData.numeroCuenta.length < 10) {
      newErrors.numeroCuenta = 'El número de cuenta debe tener al menos 10 dígitos';
    }

    // Verificar si el número de cuenta ya existe (excepto en edición)
    const existingAccount = accounts.find(
      account => 
        account.numeroCuenta === formData.numeroCuenta && 
        account.id !== editingId
    );
    if (existingAccount) {
      newErrors.numeroCuenta = 'Este número de cuenta ya está registrado';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    if (editingId) {
      // Editar cuenta existente
      const updatedAccounts = accounts.map(account =>
        account.id === editingId
          ? { ...account, ...formData }
          : account
      );
      onAccountsChange(updatedAccounts);
    } else {
      // Agregar nueva cuenta
      const newAccount: BankAccount = {
        id: Date.now().toString(),
        ...formData,
        isPrimary: accounts.length === 0 // Primera cuenta es primaria por defecto
      };
      onAccountsChange([...accounts, newAccount]);
    }

    resetForm();
  };

  const handleEdit = (account: BankAccount) => {
    setFormData({
      banco: account.banco,
      tipoCuenta: account.tipoCuenta,
      numeroCuenta: account.numeroCuenta
    });
    setEditingId(account.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    const accountToDelete = accounts.find(account => account.id === id);
    if (accountToDelete?.isPrimary && accounts.length > 1) {
      // Si es la cuenta primaria y hay más cuentas, hacer primaria la siguiente
      const remainingAccounts = accounts.filter(account => account.id !== id);
      remainingAccounts[0].isPrimary = true;
      onAccountsChange(remainingAccounts);
    } else {
      onAccountsChange(accounts.filter(account => account.id !== id));
    }
  };

  const handleSetPrimary = (id: string) => {
    const updatedAccounts = accounts.map(account => ({
      ...account,
      isPrimary: account.id === id
    }));
    onAccountsChange(updatedAccounts);
  };

  const resetForm = () => {
    setFormData({
      banco: '',
      tipoCuenta: '',
      numeroCuenta: ''
    });
    setErrors({});
    setIsAdding(false);
    setEditingId(null);
  };

  const getBancoLabel = (value: string) => {
    return BANCOS.find(banco => banco.value.toString() === value)?.label || value;
  };

  const getTipoCuentaLabel = (value: string) => {
    return TIPOS_CUENTA.find(tipo => tipo.value.toString() === value)?.label || value;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-700">Cuentas Bancarias</h3>
        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus size={16} className="mr-1" />
            Agregar cuenta
          </Button>
        )}
      </div>

      {/* Formulario para agregar/editar cuenta */}
      {isAdding && (
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="text-md font-medium text-gray-700 mb-3">
            {editingId ? 'Editar cuenta bancaria' : 'Nueva cuenta bancaria'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Select
                label="Banco *"
                value={formData.banco}
                onChange={(value) => setFormData(prev => ({ ...prev, banco: value }))}
                options={[...BANCOS]}
              />
              {errors.banco && (
                <p className="text-red-500 text-sm mt-1">{errors.banco}</p>
              )}
            </div>

            <div>
              <Select
                label="Tipo de Cuenta *"
                value={formData.tipoCuenta}
                onChange={(value) => setFormData(prev => ({ ...prev, tipoCuenta: value }))}
                options={[...TIPOS_CUENTA]}
              />
              {errors.tipoCuenta && (
                <p className="text-red-500 text-sm mt-1">{errors.tipoCuenta}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Cuenta *
              </label>
              <Input
                value={formData.numeroCuenta}
                onChange={(e) => setFormData(prev => ({ ...prev, numeroCuenta: e.target.value }))}
                placeholder="1234567890123456"
                maxLength={20}
              />
              {errors.numeroCuenta && (
                <p className="text-red-500 text-sm mt-1">{errors.numeroCuenta}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleSubmit} size="sm">
              {editingId ? 'Actualizar' : 'Agregar'}
            </Button>
            <Button onClick={resetForm} variant="outline" size="sm">
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Lista de cuentas */}
      {accounts.length > 0 && (
        <div className="space-y-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className={`p-4 border rounded-lg ${
                account.isPrimary 
                  ? 'border-blue-300 bg-blue-50' 
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">
                      {getBancoLabel(account.banco)}
                    </h4>
                    {account.isPrimary && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Principal
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {getTipoCuentaLabel(account.tipoCuenta)}
                  </p>
                  <p className="text-sm font-mono text-gray-800">
                    {account.numeroCuenta}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!account.isPrimary && accounts.length > 1 && (
                    <Button
                      onClick={() => handleSetPrimary(account.id)}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Hacer principal
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => handleEdit(account)}
                    variant="outline"
                    size="sm"
                    className="text-gray-600 hover:text-gray-800 p-2"
                    title="Editar"
                  >
                    <Edit size={14} />
                  </Button>
                  
                  {accounts.length > 1 && (
                    <Button
                      onClick={() => handleDelete(account.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-800 p-2"
                      title="Eliminar"
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

      {accounts.length === 0 && !isAdding && (
        <div className="text-center py-8 text-gray-500">
          <p>No hay cuentas bancarias registradas</p>
          <Button
            onClick={() => setIsAdding(true)}
            className="mt-2"
            variant="outline"
          >
            Agregar primera cuenta
          </Button>
        </div>
      )}
    </div>
  );
}
