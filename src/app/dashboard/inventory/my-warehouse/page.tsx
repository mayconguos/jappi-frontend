'use client';

import { useState } from 'react';
import { Plus, Upload, Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-gray-500">Administra tus productos (SKUs) y visualiza el stock disponible en Japi.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => alert('Próximamente: Carga masiva mediante Excel con validación de SKUs.')}
            className="gap-2 bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
          >
            <Upload size={18} />
            <span className="hidden sm:inline">Importar Excel</span>
          </Button>

          <Button
            onClick={handleCreate}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100"
          >
            <Plus size={18} />
            <span>Nuevo Producto</span>
          </Button>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Buscar por Nombre o SKU..."
              className="pl-10 bg-gray-50 border-transparent focus:bg-white transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="ml-auto text-sm text-gray-500">
            Total SKUs: <span className="font-semibold text-gray-900">{products.length}</span>
          </div>
        </div>

        <CompanyProductsTable
          products={filteredProducts}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
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
