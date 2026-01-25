import { useState, useMemo } from 'react';
import { Plus, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

interface PackageListFormProps {
  originType: 'pickup' | 'warehouse' | undefined;
  // Pickup props
  items: Array<{ id: string; description: string; quantity: number }>;
  onAdd: (item: { description: string; quantity: number }) => void;
  onRemove: (id: string) => void;
  // Warehouse props
  warehouseAvailableItems?: Array<{ id: string; description: string; available_quantity: number; code: string }>;
  warehouseSelectedItems?: Array<{ id: string; description: string; quantity: number; code: string; maxQuantity: number }>;
  onAddWarehouseItem?: (item: { id: string; quantity: number }) => void;
  onRemoveWarehouseItem?: (id: string) => void;
  // General
  isCompleted?: boolean;
  onEdit?: () => void;
}

export default function PackageListForm({
  originType,
  items,
  onAdd,
  onRemove,
  warehouseAvailableItems = [],
  warehouseSelectedItems = [],
  onAddWarehouseItem,
  onRemoveWarehouseItem,
  isCompleted,
  onEdit
}: PackageListFormProps) {
  // State for Pickup
  const [tempProduct, setTempProduct] = useState({ description: '', quantity: 1 });

  // State for Warehouse
  const [tempWarehouse, setTempWarehouse] = useState<{ productId: string; quantity: number }>({ productId: '', quantity: 1 });

  const handleAdd = () => {
    if (tempProduct.description.trim() && tempProduct.quantity > 0) {
      onAdd(tempProduct);
      setTempProduct({ description: '', quantity: 1 });
    }
  };

  const handleAddWarehouse = () => {
    if (tempWarehouse.productId && tempWarehouse.quantity > 0 && onAddWarehouseItem) {
      onAddWarehouseItem({ id: tempWarehouse.productId, quantity: tempWarehouse.quantity });
      setTempWarehouse({ productId: '', quantity: 1 });
    }
  };

  const selectedProductDetails = useMemo(() =>
    warehouseAvailableItems.find(p => p.id === tempWarehouse.productId),
    [warehouseAvailableItems, tempWarehouse.productId]
  );

  const productOptions = useMemo(() =>
    warehouseAvailableItems.map(p => ({
      label: `${p.code} - ${p.description} (Disp: ${p.available_quantity})`,
      value: p.id
    })),
    [warehouseAvailableItems]
  );

  if (originType === 'warehouse') {
    return (
      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-t border-gray-100 pt-6 flex items-center gap-2">
          <Package size={14} />
          Contenido desde Almacén
        </h4>

        {/* Input Row Compacto */}
        <div className="flex gap-3 items-start mb-4">
          <div className="flex-1">
            <Select
              label="Producto"
              value={tempWarehouse.productId}
              onChange={(val) => setTempWarehouse(prev => ({ ...prev, productId: val, quantity: 1 }))}
              options={productOptions}
              placeholder="Seleccionar producto..."
            />
          </div>
          <div className="w-24">
            <Input
              label="Cant."
              type="number"
              min="1"
              max={selectedProductDetails ? selectedProductDetails.available_quantity : 999}
              value={tempWarehouse.quantity.toString()}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setTempWarehouse(prev => ({ ...prev, quantity: val }));
              }}
              placeholder="1"
            />
            {selectedProductDetails && (
              <p className="text-[10px] text-gray-400 mt-1 text-right">Max: {selectedProductDetails.available_quantity}</p>
            )}
          </div>
          <div className="pt-[26px]">
            <Button
              type="button"
              onClick={handleAddWarehouse}
              disabled={!tempWarehouse.productId || tempWarehouse.quantity < 1 || (selectedProductDetails ? tempWarehouse.quantity > selectedProductDetails.available_quantity : false)}
              variant="secondary"
              className="h-10 px-4 border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-50 flex items-center gap-2"
              title="Agregar"
            >
              <Plus size={16} />
              <span>Agregar</span>
            </Button>
          </div>
        </div>

        {/* Lista Compacta */}
        {warehouseSelectedItems.length > 0 ? (
          <div className="bg-emerald-50/50 rounded-lg border border-emerald-100 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-emerald-100/50 text-emerald-700 font-medium border-b border-emerald-200/50">
                <tr>
                  <th className="px-4 py-2 w-16 text-center">Cant.</th>
                  <th className="px-4 py-2">Código</th>
                  <th className="px-4 py-2">Descripción</th>
                  <th className="px-4 py-2 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100/50">
                {warehouseSelectedItems.map((product) => (
                  <tr key={product.id} className="group hover:bg-white/50 transition-colors">
                    <td className="px-4 py-2 text-center font-semibold text-emerald-800">{product.quantity}</td>
                    <td className="px-4 py-2 text-emerald-700 font-mono text-xs">{product.code}</td>
                    <td className="px-4 py-2 text-gray-900">{product.description}</td>
                    <td className="px-4 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          if (isCompleted && onEdit) onEdit();
                          if (onRemoveWarehouseItem) onRemoveWarehouseItem(product.id);
                        }}
                        className="text-emerald-400 hover:text-red-500 transition-colors p-1"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-lg bg-gray-50/50">
            <p className="text-xs text-gray-400">Selecciona productos del almacén</p>
          </div>
        )}
      </div>
    );
  }

  if (originType === 'pickup') {
    return (
      <div>
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-t border-gray-100 pt-6">Contenido del Paquete</h4>

        {/* Input Row Compacto */}
        <div className="flex gap-3 items-start mb-4">
          <div className="flex-1">
            <Input
              label="Descripción del producto"
              value={tempProduct.description}
              onChange={(e) => setTempProduct(prev => ({ ...prev, description: e.target.value.toUpperCase() }))}
              placeholder="Ej: LAPTOP, DOCUMENTOS"
            />
          </div>
          <div className="w-24">
            <Input
              label="Cant."
              type="number"
              min="1"
              value={tempProduct.quantity.toString()}
              onChange={(e) => setTempProduct(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
              placeholder="1"
            />
          </div>
          <div className="pt-[26px]">
            <Button
              type="button"
              onClick={handleAdd}
              disabled={!tempProduct.description.trim() || tempProduct.quantity < 1}
              variant="secondary"
              className="h-10 px-4 border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-50 flex items-center gap-2"
              title="Agregar"
            >
              <Plus size={16} />
              <span>Agregar</span>
            </Button>
          </div>
        </div>

        {/* Lista Compacta */}
        {items.length > 0 ? (
          <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-500 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 w-16 text-center">Cant.</th>
                  <th className="px-4 py-2">Descripción</th>
                  <th className="px-4 py-2 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((product) => (
                  <tr key={product.id} className="group hover:bg-white transition-colors">
                    <td className="px-4 py-2 text-center font-semibold text-gray-700">{product.quantity}</td>
                    <td className="px-4 py-2 text-gray-900">{product.description}</td>
                    <td className="px-4 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          if (isCompleted && onEdit) onEdit();
                          onRemove(product.id);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-lg bg-gray-50/50">
            <p className="text-xs text-gray-400">Agrega productos a la lista</p>
          </div>
        )}
      </div>
    );
  }

  return null;
}
