'use client';

import { useState } from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import ProductsFilter from '@/components/filters/ProductsFilter';
import CompanyProductsTable, { CatalogProduct } from '@/components/tables/CompanyProductsTable';
import ProductModal from '@/components/forms/modals/ProductModal';
import { useInventory } from '@/context/InventoryContext';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

export default function CompanyWarehousePage() {
  // Use Global Context
  const { products, addProduct, updateProduct, deleteProduct } = useInventory();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);

  // Feedback States
  const [isLoading, setIsLoading] = useState(false);
  const [successModal, setSuccessModal] = useState<string | boolean>(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const filteredProducts = products.filter(p =>
    p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: CatalogProduct) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (product: CatalogProduct) => {
    if (confirm(`¿Estás seguro de eliminar el producto ${product.sku}?`)) {
      deleteProduct(product.id);
    }
  };

  const handleSubmitProduct = async (data: any) => {
    setIsLoading(true);
    try {
      if (editingProduct) {
        updateProduct({ ...editingProduct, ...data });
        setIsModalOpen(false);
        setSuccessModal('El producto ha sido actualizado correctamente.');
      } else {
        await addProduct({ stock: 0, ...data });
        setIsModalOpen(false);
        setSuccessModal('El producto ha sido creado correctamente.');
      }
    } catch (error) {
      console.error(error);
      setErrorModal('Hubo un error al procesar el producto. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeStatusModals = () => {
    setSuccessModal(false);
    setErrorModal(null);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">

      <div className="space-y-6">
        <ProductsFilter
          searchValue={searchTerm}
          setSearchValue={setSearchTerm}
          onAdd={handleCreate}
          onImport={() => alert('Próximamente: Carga masiva mediante Excel con validación de SKUs.')}
          totalItems={products.length}
        />

        <CompanyProductsTable
          products={filteredProducts}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => !isLoading && setIsModalOpen(false)}
        onSubmit={handleSubmitProduct}
        editingProduct={editingProduct}
        isLoading={isLoading}
      />

      {/* Success Modal */}
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

      {/* Error Modal */}
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
    </div>
  );
}
