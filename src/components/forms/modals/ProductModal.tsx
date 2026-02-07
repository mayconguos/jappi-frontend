'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CatalogProduct } from '@/components/tables/CompanyProductsTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Modal, { ModalFooter } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';

const productSchema = z.object({
  sku: z.string().min(2, 'El SKU debe tener al menos 2 caracteres').toUpperCase(),
  product_name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void;
  editingProduct?: CatalogProduct | null;
  isLoading?: boolean;
}

export default function ProductModal({ isOpen, onClose, onSubmit, editingProduct, isLoading }: ProductModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: 'active'
    }
  });

  // ... (useEffect remains same)

  const onFormSubmit = (data: ProductFormData) => {
    onSubmit(data);
    // Don't close immediately, let page handle it
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? () => { } : onClose}
      title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
      size="md"
      showCloseButton={!isLoading}
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">

        <div className="space-y-1.5">
          <Input
            label="SKU (Código Único) *"
            placeholder="Ej. CAM-ROJA-S"
            error={errors.sku?.message}
            {...register('sku')}
            onChange={(e) => setValue('sku', e.target.value.toUpperCase())}
            className="uppercase font-mono disabled:bg-gray-100 disabled:text-gray-500"
            autoFocus
            disabled={!!editingProduct || isLoading}
          />
          <p className="text-xs text-gray-400">Identificador único para tu inventario.</p>
        </div>

        <div className="space-y-1.5">
          <Input
            label="Nombre del Producto *"
            placeholder="Ej. Camiseta Algodón Roja Talla S"
            error={errors.product_name?.message}
            {...register('product_name')}
            className="disabled:bg-gray-100 disabled:text-gray-500"
            disabled={!!editingProduct || isLoading}
          />
        </div>

        {editingProduct && (
          <div className="space-y-1.5">
            <Select
              label="Estado"
              value={watch('status')}
              onChange={(val) => setValue('status', val as 'active' | 'inactive')}
              options={[
                { label: 'Activo', value: 'active' },
                { label: 'Inactivo', value: 'inactive' },
              ]}
              className="bg-white"
              disabled={isLoading}
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Descripción (Opcional)</label>
          <textarea
            className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
            placeholder="Detalles adicionales del producto..."
            {...register('description')}
            disabled={isLoading}
          />
        </div>

        <ModalFooter className="pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isLoading}>
            {isLoading ? 'Guardando...' : editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
