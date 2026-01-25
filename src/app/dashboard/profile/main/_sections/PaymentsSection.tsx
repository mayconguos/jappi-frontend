import { Plus, Trash2, Smartphone, CreditCard, User, CheckCircle2, Edit2 } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SaveButton } from '@/components/ui/save-button';
import { Modal, ModalFooter } from '@/components/ui/modal';
import React, { useState } from 'react';

interface PaymentApp {
  app_name: string;
  phone_number: string;
  account_holder: string;
  document_number: string;
}

interface PaymentsSectionProps {
  paymentApps: PaymentApp[];
  onUpdate: (paymentApps: Array<PaymentApp>) => void;
  onSave: () => Promise<boolean>;
}

export default function PaymentsSection({
  paymentApps,
  onUpdate,
  onSave
}: PaymentsSectionProps) {
  // --- Estados para el flujo de Adición/Edición ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempApp, setTempApp] = useState<PaymentApp>({
    app_name: 'Yape',
    phone_number: '',
    account_holder: '',
    document_number: ''
  });

  // --- Lógica de Estilos (Themes) ---
  const getCardTheme = (appName: string) => {
    const name = (appName || '').toLowerCase();

    // YAPE: Morado intenso con degradado
    if (name.includes('yape')) return {
      card: "bg-gradient-to-br from-[#742284] via-[#611d6e] to-[#4a1654] text-white shadow-purple-900/20",
      input: "bg-white/10 border-white/10 text-white placeholder:text-purple-200/50 focus:bg-white/20 focus:border-white/30 focus:ring-purple-300/30",
      label: "text-purple-200/80",
      value: "text-white",
      iconBg: "bg-white/20 text-white",
      actionBtn: "hover:bg-white/20 text-purple-100 hover:text-white"
    };

    // PLIN: Turquesa/Cian vibrante
    if (name.includes('plin')) return {
      card: "bg-gradient-to-br from-[#00d0ca] via-[#00b8b3] to-[#008f8b] text-white shadow-cyan-900/20",
      input: "bg-white/15 border-white/20 text-white placeholder:text-cyan-50/60 focus:bg-white/25 focus:border-white/40 focus:ring-cyan-100/30",
      label: "text-cyan-50/90",
      value: "text-white",
      iconBg: "bg-white/25 text-white",
      actionBtn: "hover:bg-white/20 text-cyan-50 hover:text-white"
    };

    // Default (Fallback)
    return {
      card: "bg-slate-800 text-white",
      input: "bg-white/10 border-white/10",
      label: "text-slate-400",
      value: "text-white",
      iconBg: "bg-slate-700",
      actionBtn: "hover:bg-white/10"
    };
  };

  // --- Funciones de Manejo de Estado ---
  const handleUpdate = (updatedApps: PaymentApp[]) => onUpdate(updatedApps);

  const openFlow = (index: number | null = null) => {
    if (index !== null) {
      setTempApp({ ...paymentApps[index] });
      setEditingIndex(index);
    } else {
      setTempApp({
        app_name: 'Yape',
        phone_number: '',
        account_holder: '',
        document_number: ''
      });
      setEditingIndex(null);
    }
    setIsAddModalOpen(true);
  };

  const handlePreSave = () => {
    if (!tempApp.phone_number || !tempApp.account_holder) return;
    setIsAddModalOpen(false);
    setIsConfirmModalOpen(true);
  };

  const confirmAction = () => {
    if (editingIndex !== null) {
      const updated = [...paymentApps];
      updated[editingIndex] = tempApp;
      handleUpdate(updated);
    } else {
      handleUpdate([...paymentApps, tempApp]);
    }
    setIsConfirmModalOpen(false);
    setEditingIndex(null);
  };

  const updateTempField = (field: keyof PaymentApp, value: string) => {
    if (field === 'phone_number') value = value.replace(/\D/g, '').slice(0, 9);
    setTempApp(prev => ({ ...prev, [field]: value }));
  };

  const toggleTempBrand = () => {
    setTempApp(prev => ({
      ...prev,
      app_name: prev.app_name === 'Yape' ? 'Plin' : 'Yape'
    }));
  };

  const removePaymentApp = (index: number) => {
    handleUpdate(paymentApps.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in zoom-in duration-500">

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-bold text-gray-900">Métodos de Pago</h3>
          <p className="text-sm text-gray-500">Configura las billeteras donde recibirás los pagos.</p>
        </div>

        {paymentApps.length > 0 && (
          <Button
            onClick={() => openFlow()}
            variant="outline"
            size="sm"
            className="rounded-full px-4 border-slate-200 hover:border-[var(--button-hover-color)] hover:text-[var(--button-hover-color)] transition-all"
          >
            <Plus size={16} className="mr-1.5" />
            Vincular App
          </Button>
        )}
      </div>

      {/* GRID LAYOUT: Aquí ocurre la magia visual */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {/* 1. Mapeo de Tarjetas Existentes */}
        {(paymentApps || []).map((app, index) => {
          const theme = getCardTheme(app.app_name);
          const isYape = (app.app_name || '').toLowerCase().includes('yape');
          const isPlin = (app.app_name || '').toLowerCase().includes('plin');

          return (
            <div key={index} className={clsx(
              "relative rounded-[24px] p-6 shadow-xl transition-all hover:scale-[1.01] duration-300 flex flex-col justify-between min-h-[320px]",
              theme.card
            )}>
              {/* Fondo decorativo (Círculos abstractos) */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

              {/* CABECERA DE TARJETA */}
              <div className="flex justify-between items-start relative z-10 mb-6">
                <div className="flex items-center gap-3">
                  <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-lg ring-1 ring-white/30", theme.iconBg)}>
                    <span className="font-bold text-xl tracking-tighter">
                      {isYape ? 'Y' : (isPlin ? 'P' : '?')}
                    </span>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-bold text-lg leading-none">{app.app_name}</span>
                    <span className="text-[10px] opacity-70 uppercase tracking-widest mt-1">Billetera</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => openFlow(index)}
                    variant="ghost"
                    size="icon"
                    className={clsx("rounded-full w-10 h-10 transition-colors", theme.actionBtn)}
                    title="Editar datos"
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    onClick={() => removePaymentApp(index)}
                    variant="ghost"
                    size="icon"
                    className={clsx("rounded-full w-10 h-10 transition-colors", theme.actionBtn)}
                    title="Eliminar vinculación"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>

              {/* CUERPO DE TARJETA (Visualización Estática) */}
              <div className="space-y-5 relative z-10">
                <div className="space-y-1">
                  <span className={clsx("text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5 opacity-80", theme.label)}>
                    <User size={12} /> Titular de cuenta
                  </span>
                  <p className={clsx("text-lg font-bold truncate leading-tight", theme.value)}>
                    {app.account_holder || '---'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className={clsx("text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5 opacity-80", theme.label)}>
                      <CreditCard size={12} /> Documento
                    </span>
                    <p className={clsx("font-bold", theme.value)}>
                      {app.document_number || '---'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className={clsx("text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5 opacity-80", theme.label)}>
                      <Smartphone size={12} /> Celular
                    </span>
                    <p className={clsx("font-bold font-mono tracking-wider", theme.value)}>
                      {app.phone_number || '---'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* 2. Tarjeta "Agregar Nueva" (Siempre al final) */}
        <button
          onClick={() => openFlow()}
          className="group relative flex flex-col items-center justify-center min-h-[320px] rounded-[24px] border-3 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-100 transition-all duration-300"
        >
          <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover:text-slate-600 group-hover:scale-110 transition-all duration-300 mb-4">
            <Plus size={40} />
          </div>
          <span className="text-slate-500 font-bold text-lg group-hover:text-slate-800">Agregar Billetera</span>
          <span className="text-slate-400 text-sm mt-1">Yape o Plin</span>
        </button>

      </div>

      {/* MODAL 1: Entrada de Datos */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingIndex !== null ? "Editar Billetera" : "Vincular Nueva Billetera"}
        size="md"
        footer={
          <ModalFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handlePreSave}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={!tempApp.phone_number || !tempApp.account_holder}
            >
              {editingIndex !== null ? "Actualizar" : "Guardar Datos"}
            </Button>
          </ModalFooter>
        }
      >
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4 py-4">
            <button
              onClick={toggleTempBrand}
              className="flex items-center gap-4 group p-4 rounded-3xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-all"
            >
              <div className={clsx(
                "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105",
                tempApp.app_name === 'Yape' ? "bg-[#742284] text-white" : "bg-[#00d0ca] text-white"
              )}>
                <span className="font-bold text-2xl">{tempApp.app_name === 'Yape' ? 'Y' : 'P'}</span>
              </div>
              <div className="flex flex-col items-start pr-4">
                <span className="font-bold text-xl leading-none text-slate-800">{tempApp.app_name}</span>
                <span className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-medium">Click para cambiar</span>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Nombre del Titular"
              value={tempApp.account_holder}
              onChange={(val) => updateTempField('account_holder', val)}
              placeholder="Ej. Juan Pérez"
              icon={User}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Número Celular"
                value={tempApp.phone_number}
                onChange={(val) => updateTempField('phone_number', val)}
                placeholder="900 000 000"
                maxLength={9}
                icon={Smartphone}
              />
              <Input
                label="DNI / RUC"
                value={tempApp.document_number}
                onChange={(val) => updateTempField('document_number', val)}
                placeholder="Opcional"
                icon={CreditCard}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* MODAL 2: Confirmación Final */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title={editingIndex !== null ? "Confirmar Actualización" : "Confirmar Adición"}
        size="sm"
        footer={
          <ModalFooter>
            <Button variant="outline" onClick={() => {
              setIsConfirmModalOpen(false);
              setIsAddModalOpen(true);
            }}>
              Atrás
            </Button>
            <Button onClick={confirmAction} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {editingIndex !== null ? "Confirmar Cambios" : "Sí, Agregar"}
            </Button>
          </ModalFooter>
        }
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 size={32} />
          </div>
          <div>
            <h4 className="font-bold text-lg text-slate-900">
              {editingIndex !== null ? "¿Actualizar billetera?" : "¿Estás seguro?"}
            </h4>
            <p className="text-sm text-slate-500 mt-1">
              {editingIndex !== null
                ? `Se actualizarán los datos de la cuenta de ${tempApp.app_name}.`
                : `Se agregará una nueva cuenta de ${tempApp.app_name} a nombre de ${tempApp.account_holder}.`
              }
            </p>
          </div>
        </div>
      </Modal>

      <div className="flex justify-end pt-6 border-t border-slate-100">
        <SaveButton onSave={onSave} />
      </div>
    </div>
  );
}