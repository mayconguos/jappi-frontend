'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Modal, { ModalFooter } from '@/components/ui/modal';
import { Package, ArrowRight, Check, Search, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { useInventory } from '@/context/InventoryContext';
import { CatalogProduct } from '@/components/tables/CompanyProductsTable';
import ProductModal from '@/components/forms/modals/ProductModal';

interface SelectedProduct extends CatalogProduct {
  quantity: number;
}

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (items: SelectedProduct[]) => void;
}

export default function NewRequestModal({ isOpen, onClose, onSubmit }: NewRequestModalProps) {
  // State for nested Product Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const { products, addProduct } = useInventory();

  const [step, setStep] = useState<1 | 2>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<SelectedProduct[]>([]);

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

  const handleSubmit = () => {
    onSubmit(selectedItems);
    setTimeout(() => {
      setStep(1);
      setSelectedItems([]);
      setSearchTerm('');
      onClose();
    }, 500);
  };

  // Handler for creating a new product
  const handleCreateProduct = (data: any) => {
    addProduct({ stock: 0, ...data }); // Add with 0 stock by default as per warehouse logic
    setIsProductModalOpen(false);
    // Optionally: Auto-select the newly created product.
    // However, since addProduct is void/doesn't return ID easily here without looking it up,
    // we'll rely on it appearing in the list.
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
                          <TableCell className="text-right text-gray-500">{item.stock}</TableCell>
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Confirmar Envío
            </Button>
          )}
        </ModalFooter>
      </Modal>

      {/* Nested Product Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSubmit={handleCreateProduct}
        editingProduct={null} // Always creating new
      />
    </>
  );
}
