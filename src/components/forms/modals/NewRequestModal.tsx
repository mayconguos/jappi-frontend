'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Modal, { ModalFooter } from '@/components/ui/modal';
import { Package, ArrowRight, Check, Search, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { useProducts } from '@/hooks/useProducts';
import { CatalogProduct } from '@/components/tables/CompanyProductsTable';
import ProductModal from '@/components/forms/modals/ProductModal';
import api from '@/app/services/api';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface SelectedProduct extends CatalogProduct {
  quantity: number;
}

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (items: SelectedProduct[]) => void;
}

export default function NewRequestModal({ isOpen, onClose, onSubmit }: NewRequestModalProps) {
  // Estado para el modal anidado de Producto
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const { products, addProduct } = useProducts();
  // Request Modal sends requests, so it still might need context for 'addRequest' if exists? No, requests are fetched in page.
  // Actually, NewRequestModal calls onSubmit. The parent logic handles it. 
  // Wait, NewRequestModal logic:
  // It selects products from `products` list. 
  // It calls `addProduct` (create new product)? Yes.

  // No necesitamos useEffect fetchProducts porque el hook useProducts los obtiene al montarse.
  // Sin embargo, useProducts los obtiene UNA VEZ cuando el hook se inicializa.
  // If modal is closed and opened, component might not unmount? 
  // If `NewRequestModal` is conditionally rendered `isModalOpen && <NewRequestModal>`, then it mounts every time.
  // If it is `<NewRequestModal isOpen={isModalOpen} />`, it stays mounted.
  // Let's check parent usage.
  // Por lo general, los modales se renderizan condicionalmente o se ocultan con CSS. 
  // En `RequestsPage`, es probable que sea: `isModalOpen && <NewRequestModal ... />` ?
  // Supongamos un comportamiento estándar. Si permanece montado, es posible que deseemos actualizar los productos cuando `isOpen` cambie.
  // El hook expone `refreshProducts`.

  const { refreshProducts } = useProducts();
  useEffect(() => {
    if (isOpen) {
      refreshProducts();
    }
  }, [isOpen]);

  const [step, setStep] = useState<1 | 2>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<SelectedProduct[]>([]);

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
    if (selectedItems.length > 0) setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async () => {
    if (!user?.id_company) {
      setErrorModal('No se pudo identificar la compañía del usuario.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        id_company: user.id_company,
        items: selectedItems.map(item => ({
          id_product: item.id_product,
          quantity: Number(item.quantity)
        }))
      };

      await api.post('/inventory/supply-request', payload);

      setSuccessModal('La solicitud de abastecimiento ha sido creada exitosamente.');

      // Notificar al padre si es necesario (por ejemplo, para actualizar la lista)
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
      // Lógica tras el éxito: cerrar todo y resetear
      setSuccessModal(false);
      setStep(1);
      setSelectedItems([]);
      setSearchTerm('');
      onClose();
    } else {
      // Lógica para cerrar solo el modal de error
      setErrorModal(null);
    }
  };

  // Manejador para crear un nuevo producto
  const handleCreateProduct = (data: any) => {
    addProduct({ stock: 0, ...data }); // Añadir con stock 0 por defecto según la lógica del almacén
    setIsProductModalOpen(false);
    // Opcionalmente: Seleccionar automáticamente el producto recién creado.
    // Sin embargo, dado que addProduct es void/no devuelve el ID fácilmente aquí sin buscarlo,
    // confiaremos en que aparezca en la lista.
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={step === 1 ? 'Seleccionar Productos' : 'Definir Cantidades'}
        size="lg"
        showCloseButton
      >
        <div className="min-h-[400px]">
          <div className="flex items-center gap-2 mb-6 text-sm">
            <span className={`px-2 py-0.5 rounded-full ${step === 1 ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-600'}`}>1. Selección</span>
            <span className="text-gray-300">/</span>
            <span className={`px-2 py-0.5 rounded-full ${step === 2 ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}>2. Cantidades</span>
          </div>

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
                      <TableHead className="w-10"></TableHead>
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
              <p className="text-xs text-gray-400 text-right">{selectedItems.length} productos seleccionados</p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="border rounded-lg overflow-hidden max-h-[350px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto (SKU)</TableHead>
                      <TableHead className="w-[120px] text-center">Cantidad a Enviar</TableHead>
                      <TableHead className="w-10"></TableHead>
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
        </div>

        <ModalFooter>
          {step === 2 && (
            <Button variant="ghost" onClick={handleBack}>
              Atrás
            </Button>
          )}
          {step === 1 ? (
            <Button
              onClick={handleNext}
              disabled={selectedItems.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Siguiente <ArrowRight size={16} className="ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Confirmar Envío
              {isLoading && <span className="ml-2 animate-spin">⏳</span>}
            </Button>
          )}
        </ModalFooter>
      </Modal>

      {/* Modal de Producto anidado */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSubmit={handleCreateProduct}
        editingProduct={null} // Siempre creando uno nuevo
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
