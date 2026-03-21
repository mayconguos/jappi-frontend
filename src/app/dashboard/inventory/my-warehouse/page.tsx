'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import DeliveryLoader from '@/components/ui/delivery-loader';
import ProductsFilter from '@/components/filters/ProductsFilter';
import CompanyProductsTable, { CatalogProduct } from '@/components/tables/CompanyProductsTable';
import ProductModal from '@/components/forms/modals/ProductModal';
import { useProducts } from '@/hooks/useProducts';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import StatusModal, { StatusType } from '@/components/ui/status-modal';
import { useModal } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 10;

export default function CompanyWarehousePage() {
  // Use Local Hook
  const { products, addProduct, updateProduct, deleteProduct, loading } = useProducts();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [successModal, setSuccessModal] = useState<string | boolean>(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  
  // Modal de confirmación para eliminar
  const [productToDelete, setProductToDelete] = useState<CatalogProduct | null>(null);

  // Status Modal Global para Alertas
  const { isOpen: isStatusOpen, openModal: openStatus, closeModal: closeStatus } = useModal();
  const [statusConfig, setStatusConfig] = useState<{
    type: StatusType;
    title: string;
    message: string;
    actionLabel?: string;
  }>({
    type: 'info',
    title: '',
    message: ''
  });

  const filteredProducts = products.filter(p =>
    p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [currentPage, setCurrentPage] = useState(1);

  // Reiniciar la página al cambiar la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalItems = filteredProducts.length;
  const currentItems = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
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
    setProductToDelete(product);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      setIsLoading(true);
      try {
        await deleteProduct(productToDelete.id);
        setSuccessModal(`El producto ${productToDelete.sku} ha sido eliminado correctamente.`);
      } catch (error) {
        console.error(error);
        setErrorModal('Error al intentar eliminar el producto.');
      } finally {
        setIsLoading(false);
        setProductToDelete(null);
      }
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
    } catch (error: any) {
      console.error(error);
      const errorMessage =
        error?.response?.data?.message ||
        'Hubo un error al procesar el producto. Por favor intenta nuevamente.';
      setErrorModal(errorMessage);
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
          onImport={() => {
            setStatusConfig({
              type: 'warning',
              title: 'Próximamente',
              message: 'La carga masiva mediante Excel con validación de SKUs estará disponible pronto.'
            });
            openStatus();
          }}
          totalItems={products.length}
        />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <DeliveryLoader message="Cargando catálogo..." />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <CompanyProductsTable
              products={currentItems}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            {totalItems > 0 && (
              <div className="flex justify-center sm:justify-end">
                <Pagination
                  currentPage={currentPage}
                  totalItems={totalItems}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        )}
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

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <Modal
          isOpen={!!productToDelete}
          onClose={() => !isLoading && setProductToDelete(null)}
          size="sm"
          title="Eliminar Producto"
          footer={
            <ModalFooter className="justify-end w-full space-x-2">
              <Button type="button" variant="ghost" onClick={() => setProductToDelete(null)} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="button" variant="destructive" onClick={confirmDelete} isLoading={isLoading}>
                Eliminar
              </Button>
            </ModalFooter>
          }
        >
          <div className="py-4">
            <p className="text-gray-600">
              ¿Estás seguro de que deseas eliminar el producto con SKU <span className="font-semibold text-gray-900">{productToDelete.sku}</span>? Esta acción no se puede deshacer.
            </p>
          </div>
        </Modal>
      )}

      {/* Global Status Modal para notificaciones sueltas */}
      <StatusModal
        isOpen={isStatusOpen}
        onClose={closeStatus}
        {...statusConfig}
      />
    </div>
  );
}
