'use client';

import { useState, useEffect } from 'react';

import { UseFormReturn } from 'react-hook-form';
import { CheckCircle2, Edit2 } from 'lucide-react';
import { clsx } from 'clsx';

import { useAuth } from '@/context/AuthContext';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { type ShipmentFormData } from '@/lib/validations/shipment';

import api from '@/app/services/api';

import ShipmentOriginSelector from '@/components/shipment/ShipmentOriginSelector';
import ServiceLevelSelector from '@/components/shipment/ServiceLevelSelector';
import PickupDetailsForm from '@/components/shipment/PickupDetailsForm';
import PackageListForm from '@/components/shipment/PackageListForm';

type OriginType = 'pickup' | 'stock' | undefined;
type ServiceType = 'express' | 'regular' | 'change' | undefined;

interface ShipmentSectionProps {
  form: UseFormReturn<ShipmentFormData>;
  onProductsChange?: (products: {
    pickup: Array<{ description: string; quantity: number; id: string }>;
    warehouse: Array<{ id: string; description: string; quantity: number; code: string; maxQuantity: number }>;
  }) => void;
  isActive: boolean;
  isCompleted: boolean;
  onContinue: () => void;
  onEdit?: () => void;
}

export default function ShipmentSection({ form, onProductsChange, isActive, isCompleted, onContinue, onEdit }: Readonly<ShipmentSectionProps>) {
  const { formState: { errors }, watch, setValue, trigger } = form;
  const watchedValues = watch();
  const { user } = useAuth();

  const selectedOriginType = watchedValues.service?.origin_type;

  const [companyData, setCompanyData] = useState<{
    addresses: Array<{ id: number; address: string; id_region: number; id_district: number; id_sector?: number }>;
    phones: string[];
  }>({
    addresses: [],
    phones: []
  });

  const [productsList, setProductsList] = useState<Array<{ description: string; quantity: number; id: string }>>([]);
  const [warehouseProducts, setWarehouseProducts] = useState<Array<{ id: string; description: string; available_quantity: number; code: string }>>([]);
  /* Removed selectedWarehouseProduct state */
  const [selectedWarehouseList, setSelectedWarehouseList] = useState<Array<{ id: string; description: string; quantity: number; code: string; maxQuantity: number }>>([]);

  // --- Handlers for Package List ---
  const addProduct = (item: { description: string; quantity: number }) => {
    const newProduct = {
      ...item,
      id: Date.now().toString(),
      description: item.description.trim().toUpperCase()
    };
    setProductsList(prev => [...prev, newProduct]);
  };

  const removeProduct = (id: string) => {
    setProductsList(prev => prev.filter(product => product.id !== id));
  };
  // ---------------------------------

  const addWarehouseProduct = (item: { id: string; quantity: number }) => {
    const product = warehouseProducts.find(p => p.id === item.id);
    if (product && item.quantity > 0 && item.quantity <= product.available_quantity) {
      const existingIndex = selectedWarehouseList.findIndex(p => p.id === product.id);

      if (existingIndex >= 0) {
        const updatedList = [...selectedWarehouseList];
        updatedList[existingIndex].quantity = item.quantity; // Or add? Use case suggests set quantity or add? Usually add, but here logic was replacement/update. Kept update logic.
        setSelectedWarehouseList(updatedList);
      } else {
        const newSelection = {
          id: product.id,
          description: product.description,
          quantity: item.quantity,
          code: product.code,
          maxQuantity: product.available_quantity
        };
        setSelectedWarehouseList(prev => [...prev, newSelection]);
      }
    }
  };

  const removeWarehouseProduct = (id: string) => {
    setSelectedWarehouseList(prev => prev.filter(product => product.id !== id));
  };

  const handleServiceTypeChange = async (type: 'regular' | 'express' | 'change') => {
    setValue('service.type', type);
    await trigger('service.type');

    const today = new Date();
    const targetDate = new Date(today);

    if (type === 'express') {
      // Is TODAY
    } else {
      // Is TOMORROW
      targetDate.setDate(today.getDate() + 1);

      // Sunday check (0 is Sunday)
      if (targetDate.getDay() === 0) {
        targetDate.setDate(targetDate.getDate() + 1);
      }
    }

    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    setValue('service.delivery_date', formattedDate);
    await trigger('service.delivery_date');
  };

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!user?.id) {
          return;
        }

        const response = await api.get(`/user/company/detail/${user.id}`, {
          headers: { authorization: `${token}` }
        });

        if (response.data?.company) {
          setCompanyData({
            addresses: response.data.company.addresses || [],
            phones: response.data.company.phones || []
          });
        }
      } catch (error) {
        console.error('Error loading company data:', error);
      }
    };

    fetchCompanyData();
  }, [user]);

  useEffect(() => {
    const fetchWarehouseProducts = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!user?.id_company) {
          console.error('User or Company ID not found');
          return;
        }

        const response = await api.get(`/inventory/${user.id_company}`, {
          headers: { authorization: `${token}` }
        });

        const data = Array.isArray(response.data) ? response.data : (response.data?.kardex || []);

        const mappedProducts = data.map((p: any) => ({
          id: String(p.id),
          description: p.product_name,
          available_quantity: Number(p.quantity),
          code: String(p.id)
        }));

        setWarehouseProducts(mappedProducts);
      } catch (error) {
        console.error('Error loading warehouse products:', error);
      }
    };

    if (selectedOriginType === 'stock') {
      fetchWarehouseProducts();
    }
  }, [selectedOriginType, user]);

  useEffect(() => {
    if (onProductsChange) {
      onProductsChange({
        pickup: productsList,
        warehouse: selectedWarehouseList
      });
    }
  }, [productsList, selectedWarehouseList, onProductsChange]);

  // Transformed data for props
  const addressOptions = companyData.addresses.map((addr) => ({
    label: addr.address,
    value: String(addr.id)
  }));
  const phoneOptions = companyData.phones.map((phone) => ({
    label: phone,
    value: phone
  }));

  const getSectionStatusClassName = () => {
    if (isActive) return "opacity-100 translate-y-0";
    if (isCompleted) return "opacity-60";
    return "opacity-40 translate-y-4 pointer-events-none";
  };

  return (
    <div className={clsx(
      "transition-all duration-500 ease-in-out",
      getSectionStatusClassName()
    )}>
      <Card className="overflow-hidden border-gray-200 shadow-sm bg-white">

        {/* Header Minimalista */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className={clsx(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
              isCompleted ? "bg-emerald-100 text-emerald-600" : "bg-[#02997d]/10 text-[#02997d]"
            )}>
              {isCompleted ? <CheckCircle2 size={18} /> : <span>1</span>}
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Información del Envío
              </h3>
              {isCompleted && !isActive && (
                <p className="text-xs text-emerald-600 font-medium animate-in fade-in slide-in-from-left-2 transition-all">
                  {selectedOriginType === 'pickup' ? 'Recojo en local' : 'Desde Almacén'} • {watchedValues.service?.type === 'express' ? 'Servicio Express' : 'Servicio Regular'}
                </p>
              )}
            </div>
          </div>

          {isCompleted && onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="px-4 py-1.5 text-xs font-bold bg-white border border-gray-200 text-gray-700 rounded-lg hover:border-[#02997d] hover:text-[#02997d] hover:bg-[#02997d]/5 transition-all flex items-center shadow-sm"
            >
              <Edit2 size={14} className="mr-1.5" />
              Modificar
            </button>
          )}
        </div>

        <div className={clsx(
          "transition-all duration-500",
          isActive ? "max-h-[2000px] opacity-100" : "max-h-0 py-0 opacity-0 overflow-hidden"
        )}>
          <div className="p-6 space-y-8">

            {/* Sección A: Datos Generales y Origen (Combinados) */}
            <div className="space-y-6">
              <div className={clsx("grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3", isCompleted && "pointer-events-none grayscale-[0.1]")}>
                {/* Fila 1 */}
                <div className="md:col-span-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Datos del Servicio</h4>
                </div>

                {/* 1. Origin Selector */}
                <ShipmentOriginSelector
                  value={watchedValues.service?.origin_type as OriginType}
                  onChange={async (val) => {
                    setValue('service.origin_type', val);
                    await trigger('service.origin_type');
                  }}
                  error={errors.service?.origin_type?.message}
                />




                {/* 4. Pickup Details Form */}
                {selectedOriginType === 'pickup' && (
                  <div className="md:col-span-2">
                    <PickupDetailsForm
                      originType={selectedOriginType as OriginType}
                      addresses={addressOptions}
                      phones={phoneOptions}
                      addressValue={watchedValues.sender?.address?.id_address?.toString() || ''}
                      onAddressChange={async (val) => {
                        const selectedId = Number(val);
                        const selectedAddr = companyData.addresses.find(a => a.id === selectedId);
                        if (selectedAddr) {
                          setValue('sender.address.id_address', selectedId);
                          setValue('sender.address.address', selectedAddr.address);
                          setValue('sender.address.id_region', selectedAddr.id_region);
                          setValue('sender.address.id_district', selectedAddr.id_district);
                          setValue('sender.address.id_sector', selectedAddr.id_sector || 0);
                          await trigger('sender.address');
                        }
                      }}
                      addressError={errors.sender?.address?.id_address?.message}
                      phoneValue={watchedValues.sender?.phone || ''}
                      onPhoneChange={async (val) => {
                        setValue('sender.phone', val);
                        await trigger('sender.phone');
                      }}
                      phoneError={errors.sender?.phone?.message}
                      pickupCostValue={watchedValues.service?.pickup_cost || 0}
                      onPickupCostChange={async (val) => {
                        setValue('service.pickup_cost', val);
                        // Trigger de validación manual (opcional, aunque el schema lo evalúa en Submit)
                      }}
                      pickupCostError={errors.service?.pickup_cost?.message}
                    />
                  </div>
                )}
              </div>

              {/* 5. Package List Form */}
              <PackageListForm
                originType={selectedOriginType as OriginType}
                items={productsList}
                onAdd={addProduct}
                onRemove={removeProduct}
                // Warehouse Props
                warehouseAvailableItems={warehouseProducts}
                warehouseSelectedItems={selectedWarehouseList}
                onAddWarehouseItem={addWarehouseProduct}
                onRemoveWarehouseItem={removeWarehouseProduct}
                isCompleted={isCompleted}
                onEdit={onEdit}
              />

              {/* Grid separado para mantener la estructura de columnas si se quiere aplicar en general, o directo como div */}
              <div className={clsx("grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3", isCompleted && "pointer-events-none grayscale-[0.1]")}>
                {/* 2. Service Level Selector (Movido aquí) */}
                <ServiceLevelSelector
                  value={watchedValues.service?.type as ServiceType}
                  onChange={handleServiceTypeChange}
                  error={errors.service?.type?.message}
                />
              </div>
            </div>

            {/* Footer con Botón Continuar */}
            {!isCompleted && isActive && (
              <div className="border-t border-gray-100 mt-6 pt-6 flex justify-end">
                <Button
                  type="button"
                  onClick={onContinue}
                  variant="primary"
                  className="px-8 h-11 w-full sm:w-auto"
                >
                  Continuar
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}