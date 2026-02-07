'use client';

import { useState } from 'react';
import ProductsFilter from '@/components/filters/ProductsFilter';
import CompanyProductsTable, { CatalogProduct } from '@/components/tables/CompanyProductsTable';
import ProductModal from '@/components/forms/modals/ProductModal';
import { useInventory } from '@/context/InventoryContext';

export default function CompanyWarehousePage() {
  // Use Global Context
  const { products, addProduct, updateProduct, deleteProduct } = useInventory();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);

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

  const handleSubmitProduct = (data: any) => {
    if (editingProduct) {
      updateProduct({ ...editingProduct, ...data });
    } else {
      addProduct({ stock: 0, ...data });
    }
    setIsModalOpen(false);
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

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <CompanyProductsTable
            products={filteredProducts}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitProduct}
        editingProduct={editingProduct}
      />
    </div>
  );
}
