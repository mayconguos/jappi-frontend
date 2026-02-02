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
    category: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(['active', 'inactive']),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ProductFormData) => void;
    editingProduct?: CatalogProduct | null;
}

export default function ProductModal({ isOpen, onClose, onSubmit, editingProduct }: ProductModalProps) {
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

    useEffect(() => {
        if (editingProduct) {
            reset({
                sku: editingProduct.sku,
                product_name: editingProduct.product_name,
                category: editingProduct.category || '',
                description: editingProduct.description || '',
                status: editingProduct.status,
            });
        } else {
            reset({
                sku: '',
                product_name: '',
                category: '',
                description: '',
                status: 'active',
            });
        }
    }, [editingProduct, isOpen, reset]);

    const onFormSubmit = (data: ProductFormData) => {
        onSubmit(data);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            size="md"
            showCloseButton
        >
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">

                <div className="space-y-1.5">
                    <Input
                        label="SKU (Código Único) *"
                        placeholder="Ej. CAM-ROJA-S"
                        error={errors.sku?.message}
                        {...register('sku')}
                        onChange={(e) => setValue('sku', e.target.value.toUpperCase())}
                        className="uppercase font-mono"
                        autoFocus
                    />
                    <p className="text-xs text-gray-400">Identificador único para tu inventario.</p>
                </div>

                <div className="space-y-1.5">
                    <Input
                        label="Nombre del Producto *"
                        placeholder="Ej. Camiseta Algodón Roja Talla S"
                        error={errors.product_name?.message}
                        {...register('product_name')}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Select
                            label="Categoría"
                            value={watch('category') || ''}
                            onChange={(val) => setValue('category', val)}
                            options={[
                                { label: 'Ropa', value: 'Ropa' },
                                { label: 'Electrónica', value: 'Electrónica' },
                                { label: 'Hogar', value: 'Hogar' },
                                { label: 'Accesorios', value: 'Accesorios' },
                                { label: 'Otros', value: 'Otros' },
                            ]}
                            placeholder="Seleccionar..."
                            className="bg-white"
                        />
                    </div>

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
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Descripción (Opcional)</label>
                    <textarea
                        className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                        placeholder="Detalles adicionales del producto..."
                        {...register('description')}
                    />
                </div>

                <ModalFooter className="pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                    </Button>
                </ModalFooter>
            </form>
        </Modal>
    );
}
