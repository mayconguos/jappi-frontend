'use client';

import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CheckCircle2, ChevronDown } from 'lucide-react';
import secureLocalStorage from 'react-secure-storage';
import { clsx } from 'clsx';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { type ShipmentFormData } from '@/lib/validations/shipment';
import api from '@/app/services/api';
import { DELIVERY_MODES } from '@/constants/formOptions';

// Import new dumb components
import ShipmentOriginSelector from '@/components/shipment/ShipmentOriginSelector';
import ServiceLevelSelector from '@/components/shipment/ServiceLevelSelector';
import DeliveryConfiguration from '@/components/shipment/DeliveryConfiguration';
import PickupDetailsForm from '@/components/shipment/PickupDetailsForm';
import PackageListForm from '@/components/shipment/PackageListForm';

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

export default function ShipmentSection({ form, onProductsChange, isActive, isCompleted, onContinue, onEdit }: ShipmentSectionProps) {
  const { formState: { errors }, watch, setValue, trigger, register } = form;
  const watchedValues = watch();

  const selectedOriginType = watchedValues.service?.origin_type;

  const [companyData, setCompanyData] = useState<{
    addresses: Array<{ address: string; id_region: number; id_district: number; id_sector?: number }>;
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
        const user = secureLocalStorage.getItem('user') as { id?: number | string } | null;

        if (!user || !user.id) {
          console.error('User ID not found in secure storage');
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
  }, []);

  useEffect(() => {
    const fetchWarehouseProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = secureLocalStorage.getItem('user') as { id?: number | string } | null;

        if (!user || !user.id) {
          console.error('User not found');
          return;
        }

        const response = await api.get(`/inventory/${user.id}`, {
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

    if (selectedOriginType === 'warehouse') {
      fetchWarehouseProducts();
    }
  }, [selectedOriginType]);

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
    value: addr.address
  }));
  const phoneOptions = companyData.phones.map((phone) => ({
    label: phone,
    value: phone
  }));

  return (
    <div className={clsx(
      "transition-all duration-500 ease-in-out",
      isActive ? "opacity-100 translate-y-0" : (isCompleted ? "opacity-60" : "opacity-40 translate-y-4 pointer-events-none")
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
            </div>
          </div>

          {isCompleted && onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="text-sm text-gray-400 hover:text-gray-600 font-medium flex items-center transition-colors"
            >
              Editar <ChevronDown size={14} className="ml-1" />
            </button>
          )}
        </div>

        <div className={clsx(
          "transition-all duration-500",
          !isActive && !isCompleted ? "max-h-0 py-0 opacity-0 overflow-hidden" : "max-h-[2000px] opacity-100"
        )}>
          <div className="p-6 space-y-8">

            {/* Sección A: Datos Generales y Origen (Combinados) */}
            <div className="space-y-6">
              <div className={clsx("grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4", isCompleted && "pointer-events-none grayscale-[0.1]")}>
                {/* Fila 1 */}
                <div className="md:col-span-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Datos del Servicio</h4>
                </div>

                {/* 1. Origin Selector */}
                <ShipmentOriginSelector
                  value={watchedValues.service?.origin_type as 'pickup' | 'warehouse' | undefined}
                  onChange={async (val) => {
                    setValue('service.origin_type', val);
                    await trigger('service.origin_type');
                  }}
                  error={errors.service?.origin_type?.message}
                />

                {/* 2. Service Level Selector */}
                <ServiceLevelSelector
                  value={watchedValues.service?.type as 'express' | 'regular' | 'change' | undefined}
                  onChange={handleServiceTypeChange}
                  error={errors.service?.type?.message}
                />

                {/* 3. Delivery Configuration */}
                <div className="md:col-span-2">
                  <DeliveryConfiguration
                    deliveryMode={watchedValues.service?.delivery_mode}
                    onModeChange={async (val) => {
                      setValue('service.delivery_mode', val);
                      await trigger('service.delivery_mode');
                    }}
                    error={errors.service?.delivery_mode?.message}
                    registerCodAmount={register('service.cod_amount', {
                      required: watchedValues.service?.delivery_mode === 'pay_on_delivery' ? "Ingresa el monto a cobrar" : false,
                      valueAsNumber: true
                    })}
                    codAmountError={errors.service?.cod_amount?.message}
                    deliveryDate={watchedValues.service?.delivery_date}
                    onDateChange={async (val) => {
                      setValue('service.delivery_date', val);
                      await trigger('service.delivery_date');
                    }}
                    dateError={errors.service?.delivery_date?.message}
                  />
                </div>

                {/* 4. Pickup Details Form */}
                {selectedOriginType === 'pickup' && (
                  <div className="md:col-span-2">
                    <PickupDetailsForm
                      originType={selectedOriginType as 'pickup' | 'warehouse' | undefined}
                      addresses={addressOptions}
                      phones={phoneOptions}
                      addressValue={watchedValues.sender?.address?.address || ''}
                      onAddressChange={async (val) => {
                        setValue('sender.address.address', val);
                        await trigger('sender.address.address');
                      }}
                      addressError={errors.sender?.address?.address?.message}
                      phoneValue={watchedValues.sender?.phone || ''}
                      onPhoneChange={async (val) => {
                        setValue('sender.phone', val);
                        await trigger('sender.phone');
                      }}
                      phoneError={errors.sender?.phone?.message}
                    />
                  </div>
                )}
              </div>

              {/* 5. Package List Form */}
              <PackageListForm
                originType={selectedOriginType as 'pickup' | 'warehouse' | undefined}
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
            </div>

            {/* Footer con Botón Continuar */}
            {!isCompleted && isActive && (
              <div className="border-t border-gray-100 mt-6 pt-6 flex justify-end">
                <button
                  type="button"
                  onClick={onContinue}
                  className="bg-[#02997d] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#02886f] transition-colors shadow-lg shadow-[#02997d]/20"
                >
                  Continuar
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}