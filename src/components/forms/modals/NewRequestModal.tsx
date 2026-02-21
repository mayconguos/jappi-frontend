'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Modal, { ModalFooter } from '@/components/ui/modal';
import { ArrowRight, Check, Search, Trash2, Truck, Package, MapPin, Calendar, Clock, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { useProducts } from '@/hooks/useProducts';
import { CatalogProduct } from '@/components/tables/CompanyProductsTable';
import ProductModal from '@/components/forms/modals/ProductModal';
import api from '@/app/services/api';
import { useAuth } from '@/context/AuthContext';

interface SelectedProduct extends CatalogProduct {
  quantity: number;
}

// Estado del recojo programado
interface PickupData {
  address: string;
  date: string;
  timeSlot: 'morning' | 'afternoon' | 'evening' | null;
  notes: string;
}

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (items: SelectedProduct[]) => void;
}

const TIME_SLOTS = [
  { id: 'morning', label: 'Mañana', hours: '8:00 – 12:00' },
  { id: 'afternoon', label: 'Tarde', hours: '12:00 – 17:00' },
  { id: 'evening', label: 'Noche', hours: '17:00 – 21:00' },
] as const;

// Fecha de hoy en formato YYYY-MM-DD para el input date
const todayIso = new Date().toISOString().split('T')[0];

export default function NewRequestModal({ isOpen, onClose, onSubmit }: NewRequestModalProps) {
  // autoFetch: false → no fetcha al montar la página.
  // Solo fetcha cuando el modal se abre (ver useEffect con [isOpen] abajo).
  const { products, addProduct, refreshProducts } = useProducts({ autoFetch: false });

  // Estado para el modal anidado de Producto
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Solo obtener productos cuando el modal se abre, no al montar la página
  useEffect(() => {
    if (isOpen) refreshProducts();
  }, [isOpen]);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<SelectedProduct[]>([]);

  // Estado del paso 3: recojo
  const [wantsPickup, setWantsPickup] = useState<boolean | null>(null);
  const [pickupData, setPickupData] = useState<PickupData>({
    address: '',
    date: '',
    timeSlot: null,
    notes: '',
  });

  // Estados de interacción con la API
  const [isLoading, setIsLoading] = useState(false);
  const [successModal, setSuccessModal] = useState<string | boolean>(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const { user } = useAuth();

  const filteredCatalog = products.filter(item =>
    item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleSelect = (item: CatalogProduct) => {
    if (selectedItems.find(i => i.id === item.id)) {
      setSelectedItems(selectedItems.filter(i => i.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, { ...item, quantity: 1, name: item.product_name } as any]);
    }
  };

  const updateQuantity = (id: number, qty: string) => {
    const val = parseInt(qty) || 0;
    setSelectedItems(selectedItems.map(item =>
      item.id === id ? { ...item, quantity: val } : item
    ));
  };

  const handleNext = () => {
    if (step === 1 && selectedItems.length > 0) setStep(2);
    if (step === 2) setStep(3);
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
  };

  // Validar que el formulario de recojo esté completo si eligió SÍ
  const isPickupFormValid = wantsPickup === false ||
    (wantsPickup === true && pickupData.address.trim() && pickupData.date && pickupData.timeSlot);

  const handleSubmit = async () => {
    if (!user?.id_company) {
      setErrorModal('No se pudo identificar la compañía del usuario.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Crear la solicitud de abastecimiento
      const payload = {
        id_company: user.id_company,
        items: selectedItems.map(item => ({
          id_product: item.id_product,
          quantity: Number(item.quantity)
        }))
      };
      await api.post('/inventory/supply-request', payload);

      // 2. Si quiere recojo, mockear la llamada al servicio de pickup (aún no implementado en backend)
      if (wantsPickup === true) {
        console.log('[MOCK] Programando recojo:', {
          id_company: user.id_company,
          address: pickupData.address,
          date: pickupData.date,
          time_slot: pickupData.timeSlot,
          notes: pickupData.notes,
        });
        // TODO: reemplazar con → await api.post('/pickup/schedule', pickupPayload);
        setSuccessModal('¡Solicitud creada! Hemos programado el recojo de tus productos. Te notificaremos cuando el motorizado sea asignado.');
      } else {
        setSuccessModal('La solicitud de abastecimiento ha sido creada exitosamente.');
      }

      onSubmit(selectedItems);

    } catch (error) {
      console.error('Error creating supply request:', error);
      setErrorModal('Hubo un error al procesar la solicitud. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeStatusModals = () => {
    if (successModal) {
      setSuccessModal(false);
      setStep(1);
      setSelectedItems([]);
      setSearchTerm('');
      setWantsPickup(null);
      setPickupData({ address: '', date: '', timeSlot: null, notes: '' });
      onClose();
    } else {
      setErrorModal(null);
    }
  };

  const handleCreateProduct = async (data: any) => {
    try {
      await addProduct({ stock: 0, ...data });
      setIsProductModalOpen(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Error al crear el producto. Intenta nuevamente.';
      setErrorModal(msg);
    }
  };

  const stepLabels = ['Selección', 'Cantidades', 'Recojo'];
  const titleMap: Record<number, string> = {
    1: 'Seleccionar Productos',
    2: 'Definir Cantidades',
    3: '¿Deseas que Jappi recoja?',
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={titleMap[step]}
        size="lg"
        showCloseButton
      >
        <div className="min-h-[400px]">
          {/* Barra de progreso de pasos */}
          <div className="flex items-center gap-1.5 mb-6">
            {stepLabels.map((label, idx) => {
              const n = idx + 1;
              const isActive = step === n;
              const isDone = step > n;
              return (
                <div key={n} className="flex items-center gap-1.5">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all
                    ${isActive ? 'bg-emerald-600 text-white' : isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                    {isDone
                      ? <Check size={11} className="shrink-0" />
                      : <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] font-bold">{n}</span>
                    }
                    {label}
                  </div>
                  {idx < stepLabels.length - 1 && (
                    <div className={`h-px w-4 ${step > n ? 'bg-emerald-300' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Step 1: Selección de productos ── */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="flex gap-2">
                <Input
                  placeholder="Buscar por nombre o SKU..."
                  icon={Search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                  className="flex-1"
                />
                <Button
                  onClick={() => setIsProductModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm whitespace-nowrap"
                >
                  + Crear Producto
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden h-[320px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10" />
                      <TableHead>Producto</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Stock Actual</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCatalog.map(item => {
                      const isSelected = !!selectedItems.find(i => i.id === item.id);
                      return (
                        <TableRow
                          key={item.id}
                          className={`cursor-pointer ${isSelected ? 'bg-emerald-50 hover:bg-emerald-100' : ''}`}
                          onClick={() => handleToggleSelect(item)}
                        >
                          <TableCell>
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300'}`}>
                              {isSelected && <Check size={12} className="text-white" />}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{item.product_name}</TableCell>
                          <TableCell className="text-gray-500 text-xs font-mono">{item.sku}</TableCell>
                          <TableCell className="text-right text-gray-500">{item.quantity}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <p className="text-xs text-gray-400 text-right">{selectedItems.length} producto{selectedItems.length !== 1 ? 's' : ''} seleccionado{selectedItems.length !== 1 ? 's' : ''}</p>
            </div>
          )}

          {/* ── Step 2: Cantidades ── */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="border rounded-lg overflow-hidden max-h-[350px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto (SKU)</TableHead>
                      <TableHead className="w-[120px] text-center">Cantidad a Enviar</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedItems.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <p className="font-medium text-sm">{item.product_name}</p>
                          <p className="text-xs text-gray-400 font-mono">{item.sku}</p>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, e.target.value)}
                            className="h-9 text-center"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-red-500"
                            onClick={() => handleToggleSelect(item as any)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* ── Step 3: ¿Quiere recojo? ── */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <p className="text-sm text-gray-500">
                Tus productos están listos para ser enviados al almacén Jappi. ¿Necesitas que nuestro motorizado pase a recogerlos?
              </p>

              {/* Tarjetas de opción */}
              <div className="grid grid-cols-2 gap-3">
                {/* Opción SÍ */}
                <button
                  type="button"
                  onClick={() => setWantsPickup(true)}
                  className={`relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer
                    ${wantsPickup === true
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/30'
                    }`}
                >
                  {wantsPickup === true && (
                    <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                      <Check size={10} className="text-white" />
                    </div>
                  )}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${wantsPickup === true ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <Truck size={22} className={wantsPickup === true ? 'text-blue-600' : 'text-gray-400'} />
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${wantsPickup === true ? 'text-blue-700' : 'text-gray-700'}`}>
                      Sí, que Jappi recoja
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-tight">
                      Un motorizado irá a buscar tus productos
                    </p>
                  </div>
                </button>

                {/* Opción NO */}
                <button
                  type="button"
                  onClick={() => setWantsPickup(false)}
                  className={`relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer
                    ${wantsPickup === false
                      ? 'border-gray-400 bg-gray-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                    }`}
                >
                  {wantsPickup === false && (
                    <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-gray-500 flex items-center justify-center">
                      <Check size={10} className="text-white" />
                    </div>
                  )}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${wantsPickup === false ? 'bg-gray-200' : 'bg-gray-100'}`}>
                    <Package size={22} className={wantsPickup === false ? 'text-gray-600' : 'text-gray-400'} />
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${wantsPickup === false ? 'text-gray-700' : 'text-gray-700'}`}>
                      No, lo llevo yo
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-tight">
                      Entregaré los productos directamente
                    </p>
                  </div>
                </button>
              </div>

              {/* Formulario de recojo (solo si eligió SÍ) */}
              {wantsPickup === true && (
                <div className="space-y-4 border border-blue-100 rounded-xl p-4 bg-blue-50/40 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Datos del recojo</p>

                  {/* Dirección */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                      <MapPin size={12} className="text-blue-500" />
                      Dirección de recojo
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Av. Larco 101, Miraflores"
                      value={pickupData.address}
                      onChange={e => setPickupData(p => ({ ...p, address: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-400"
                    />
                  </div>

                  {/* Fecha */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                      <Calendar size={12} className="text-blue-500" />
                      Fecha preferida
                    </label>
                    <input
                      type="date"
                      min={todayIso}
                      value={pickupData.date}
                      onChange={e => setPickupData(p => ({ ...p, date: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-700"
                    />
                  </div>

                  {/* Franja horaria */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                      <Clock size={12} className="text-blue-500" />
                      Franja horaria
                    </label>
                    <div className="flex gap-2">
                      {TIME_SLOTS.map(slot => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setPickupData(p => ({ ...p, timeSlot: slot.id }))}
                          className={`flex-1 py-2 px-2 rounded-lg border text-xs font-medium transition-all duration-150
                            ${pickupData.timeSlot === slot.id
                              ? 'border-blue-500 bg-blue-500 text-white'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300'
                            }`}
                        >
                          <span className="font-semibold block">{slot.label}</span>
                          <span className="opacity-80 font-normal">{slot.hours}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notas opcionales */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                      <FileText size={12} className="text-blue-500" />
                      Notas adicionales
                      <span className="text-gray-400 font-normal">(opcional)</span>
                    </label>
                    <textarea
                      placeholder="Ej: Timbre no funciona, llamar al celular. 2do piso."
                      value={pickupData.notes}
                      onChange={e => setPickupData(p => ({ ...p, notes: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-400 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Hint si aún no eligió */}
              {wantsPickup === null && (
                <p className="text-xs text-gray-400 text-center pt-2">Selecciona una opción para continuar</p>
              )}
            </div>
          )}
        </div>

        {/* ── Footer con botones ── */}
        <ModalFooter>
          {step > 1 && (
            <Button variant="ghost" onClick={handleBack}>
              Atrás
            </Button>
          )}

          {step < 3 ? (
            <Button
              onClick={handleNext}
              disabled={step === 1 && selectedItems.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Siguiente <ArrowRight size={16} className="ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !isPickupFormValid}
              className={`text-white ${wantsPickup === true ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
              {wantsPickup === true ? '🚚 Confirmar y Programar Recojo' : 'Confirmar Envío'}
              {isLoading && <span className="ml-2 animate-spin">⏳</span>}
            </Button>
          )}
        </ModalFooter>
      </Modal>

      {/* Modal anidado de Producto */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSubmit={handleCreateProduct}
        editingProduct={null}
      />

      {/* Modal de Éxito */}
      {successModal && (
        <Modal
          isOpen={!!successModal}
          onClose={closeStatusModals}
          size="sm"
          title="Operación Exitosa"
          footer={
            <ModalFooter className="justify-center">
              <Button onClick={closeStatusModals} className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
                Aceptar
              </Button>
            </ModalFooter>
          }
        >
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-slate-600 font-medium">
              {typeof successModal === 'string' ? successModal : 'Operación completada correctamente.'}
            </p>
          </div>
        </Modal>
      )}

      {/* Modal de Error */}
      {errorModal && (
        <Modal
          isOpen={!!errorModal}
          onClose={closeStatusModals}
          size="sm"
          title="Error"
          footer={
            <ModalFooter className="justify-center">
              <Button onClick={closeStatusModals} className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto">
                Cerrar
              </Button>
            </ModalFooter>
          }
        >
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-slate-600 font-medium">{errorModal}</p>
          </div>
        </Modal>
      )}
    </>
  );
}
