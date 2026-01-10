'use client';

import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Package, Plus, Trash2, CheckCircle2, ChevronDown } from 'lucide-react';
import secureLocalStorage from 'react-secure-storage';
import { clsx } from 'clsx';

import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SHIPMENT_TYPES, SHIPMENT_ORIGIN_TYPES, DELIVERY_MODES } from '@/constants/formOptions';
import { type ShipmentFormData } from '@/lib/validations/shipment';
import api from '@/app/services/api';

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
  const { formState: { errors }, watch, setValue, trigger } = form;
  const watchedValues = watch();

  const selectedOriginType = watchedValues.service?.origin_type;

  const [companyData, setCompanyData] = useState<{
    addresses: Array<{ address: string; id_region: number; id_district: number; id_sector?: number }>;
    phones: string[];
  }>({
    addresses: [],
    phones: []
  });

  const [showCustomAddress, setShowCustomAddress] = useState(false);
  const [showCustomPhone, setShowCustomPhone] = useState(false);
  const [tempProduct, setTempProduct] = useState({ description: '', quantity: 1 });
  const [productsList, setProductsList] = useState<Array<{ description: string; quantity: number; id: string }>>([]);
  const [warehouseProducts, setWarehouseProducts] = useState<Array<{ id: string; description: string; available_quantity: number; code: string }>>([]);
  const [selectedWarehouseProduct, setSelectedWarehouseProduct] = useState({ productId: '', quantity: 1 });
  const [selectedWarehouseList, setSelectedWarehouseList] = useState<Array<{ id: string; description: string; quantity: number; code: string; maxQuantity: number }>>([]);

  const addProduct = () => {
    if (tempProduct.description.trim() && tempProduct.quantity > 0) {
      const newProduct = {
        ...tempProduct,
        id: Date.now().toString(),
        description: tempProduct.description.trim().toUpperCase()
      };
      setProductsList(prev => [...prev, newProduct]);
      setTempProduct({ description: '', quantity: 1 });
    }
  };

  const removeProduct = (id: string) => {
    setProductsList(prev => prev.filter(product => product.id !== id));
  };

  const addWarehouseProduct = () => {
    const product = warehouseProducts.find(p => p.id === selectedWarehouseProduct.productId);
    if (product && selectedWarehouseProduct.quantity > 0 && selectedWarehouseProduct.quantity <= product.available_quantity) {
      const existingIndex = selectedWarehouseList.findIndex(p => p.id === product.id);

      if (existingIndex >= 0) {
        const updatedList = [...selectedWarehouseList];
        updatedList[existingIndex].quantity = selectedWarehouseProduct.quantity;
        setSelectedWarehouseList(updatedList);
      } else {
        const newSelection = {
          id: product.id,
          description: product.description,
          quantity: selectedWarehouseProduct.quantity,
          code: product.code,
          maxQuantity: product.available_quantity
        };
        setSelectedWarehouseList(prev => [...prev, newSelection]);
      }

      setSelectedWarehouseProduct({ productId: '', quantity: 1 });
    }
  };

  const removeWarehouseProduct = (id: string) => {
    setSelectedWarehouseList(prev => prev.filter(product => product.id !== id));
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
        const mockProducts = [
          { id: '1', description: 'LAPTOP DELL INSPIRON 15', available_quantity: 5, code: 'LAPTOP001' },
          { id: '2', description: 'CELULAR SAMSUNG GALAXY A54', available_quantity: 12, code: 'CEL001' },
          { id: '3', description: 'TABLET IPAD AIR 10.9', available_quantity: 3, code: 'TAB001' },
          { id: '4', description: 'AURICULARES SONY WH-1000XM4', available_quantity: 8, code: 'AUR001' },
          { id: '5', description: 'TECLADO MECÁNICO LOGITECH', available_quantity: 15, code: 'TEC001' },
          { id: '6', description: 'MONITOR LG 24 PULGADAS', available_quantity: 6, code: 'MON001' }
        ];

        setWarehouseProducts(mockProducts);
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

  return (
    <div className={clsx(
      "bg-white rounded-[24px] shadow-sm transition-all duration-500 border",
      isActive ? "overflow-visible" : "overflow-hidden",
      isCompleted ? "border-emerald-200" : (isActive ? "border-[var(--surface-dark)] ring-1 ring-[var(--surface-dark)]/20 shadow-lg" : "border-slate-100 opacity-60")
    )}>
      <div
        className={clsx(
          "px-8 py-6 flex items-center justify-between border-b transition-colors duration-300",
          isCompleted ? "bg-emerald-50 border-emerald-100" : (isActive ? "bg-white border-slate-100" : "bg-slate-50 border-transparent")
        )}
      >
        <div className="flex items-center gap-4">
          <div className={clsx(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
            isCompleted ? "bg-emerald-500 text-white shadow-emerald-200" : (isActive ? "bg-[var(--surface-dark)] text-white shadow-lg shadow-[var(--surface-dark)]/30" : "bg-slate-200 text-slate-400")
          )}>
            {isCompleted ? <CheckCircle2 size={24} /> : <Package size={20} />}
          </div>
          <div>
            <h3 className={clsx("text-lg font-bold transition-colors", isCompleted ? "text-emerald-800" : "text-slate-900")}>
              Información del Envío
            </h3>
            <p className="text-sm text-slate-500">
              {isCompleted ? "Configuración de envío completada" : "Detalles del servicio y origen"}
            </p>
          </div>
        </div>

        {isCompleted && onEdit && (
          <Button variant="ghost" size="sm" onClick={onEdit} className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 rounded-full">
            <span className="mr-2 text-xs font-bold uppercase">Editar</span>
            <ChevronDown size={16} />
          </Button>
        )}
      </div>

      <div className={clsx(
        "transition-all duration-500 ease-in-out",
        (isActive || isCompleted) ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0",
        isActive ? "overflow-visible" : "overflow-hidden"
      )}>
        <div className="p-8 space-y-8">
          <div className="space-y-6">
            <div className={clsx("grid grid-cols-1 md:grid-cols-2 gap-4", isCompleted && "pointer-events-none opacity-80 grayscale-[0.3]")}>
              <div>
                <Select
                  label="Tipo de envío *"
                  value={watchedValues.service?.origin_type || ''}
                  options={SHIPMENT_ORIGIN_TYPES}
                  onChange={async (value) => {
                    setValue('service.origin_type', value);
                    await trigger('service.origin_type');
                  }}
                  error={errors.service?.origin_type?.message}
                />
              </div>

              <div>
                <Select
                  label="Tipo de servicio *"
                  value={watchedValues.service?.type || ''}
                  options={SHIPMENT_TYPES}
                  onChange={async (value) => {
                    setValue('service.type', value);
                    await trigger('service.type');
                  }}
                  error={errors.service?.type?.message}
                />
              </div>

              <div>
                <Select
                  label="Modo de entrega *"
                  value={watchedValues.service?.delivery_mode || ''}
                  options={DELIVERY_MODES}
                  onChange={async (value) => {
                    setValue('service.delivery_mode', value);
                    await trigger('service.delivery_mode');
                  }}
                  error={errors.service?.delivery_mode?.message}
                />
              </div>

              <div>
                <Input
                  label="Fecha de entrega *"
                  type="date"
                  value={watchedValues.service?.delivery_date || ''}
                  onChange={async (value) => {
                    setValue('service.delivery_date', value);
                    await trigger('service.delivery_date');
                  }}
                  error={errors.service?.delivery_date?.message}
                />
              </div>
            </div>

            {selectedOriginType === 'pickup' && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 mb-6">
                  <h4 className="text-blue-900 font-bold mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">📦</span>
                    Información para recojo
                  </h4>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      {!showCustomAddress ? (
                        <div>
                          <Select
                            label="Dirección de recojo *"
                            value={watchedValues.sender?.address?.address || ''}
                            options={[
                              ...companyData.addresses.map((addr) => ({
                                label: addr.address,
                                value: addr.address
                              })),
                              { label: '+ Escribir nueva dirección', value: 'custom' }
                            ]}
                            onChange={async (value) => {
                              if (value === 'custom') {
                                setShowCustomAddress(true);
                                setValue('sender.address.address', '');
                              } else {
                                setValue('sender.address.address', value);
                                await trigger('sender.address.address');
                              }
                            }}
                            error={errors.sender?.address?.address?.message}
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Input
                            label="Dirección de recojo personalizada *"
                            value={watchedValues.sender?.address?.address || ''}
                            onChange={async (value) => {
                              setValue('sender.address.address', value.toUpperCase());
                              await trigger('sender.address.address');
                            }}
                            error={errors.sender?.address?.address?.message}
                            placeholder="ESCRIBIR NUEVA DIRECCIÓN"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setShowCustomAddress(false);
                              setValue('sender.address.address', '');
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium ml-1"
                          >
                            ← Volver a direcciones guardadas
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      {!showCustomPhone ? (
                        <div>
                          <Select
                            label="Teléfono de contacto *"
                            value={watchedValues.sender?.phone || ''}
                            options={[
                              ...companyData.phones.map((phone) => ({
                                label: phone,
                                value: phone
                              })),
                              { label: '+ Escribir nuevo teléfono', value: 'custom' }
                            ]}
                            onChange={async (value) => {
                              if (value === 'custom') {
                                setShowCustomPhone(true);
                                setValue('sender.phone', '');
                              } else {
                                setValue('sender.phone', value);
                                await trigger('sender.phone');
                              }
                            }}
                            error={errors.sender?.phone?.message}
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Input
                            label="Teléfono personalizado *"
                            value={watchedValues.sender?.phone || ''}
                            onChange={async (value) => {
                              setValue('sender.phone', value);
                              await trigger('sender.phone');
                            }}
                            error={errors.sender?.phone?.message}
                            placeholder="ESCRIBIR NUEVO TELÉFONO"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setShowCustomPhone(false);
                              setValue('sender.phone', '');
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium ml-1"
                          >
                            ← Volver a teléfonos guardados
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-3">Productos a recoger</h4>

                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-4 shadow-sm">
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <Input
                          label="Descripción del producto *"
                          value={tempProduct.description}
                          onChange={(value) => setTempProduct(prev => ({ ...prev, description: value.toUpperCase() }))}
                          placeholder="Ej: LAPTOP, CELULAR, DOCUMENTO"
                        />
                      </div>

                      <div className="w-24">
                        <Input
                          label="Cant. *"
                          type="number"
                          min="1"
                          value={tempProduct.quantity.toString()}
                          onChange={(value) => setTempProduct(prev => ({ ...prev, quantity: parseInt(value) || 1 }))}
                          placeholder="1"
                        />
                      </div>

                      <div>
                        <Button
                          type="button"
                          onClick={addProduct}
                          disabled={!tempProduct.description.trim() || tempProduct.quantity < 1}
                          className="h-[52px] min-w-[52px] md:w-auto md:px-6 rounded-xl bg-[var(--surface-dark)] hover:bg-[var(--surface-dark)]/90 p-0 md:p-4 flex items-center justify-center gap-2 shadow-lg shadow-[var(--surface-dark)]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all text-white font-bold"
                          title="Agregar producto"
                        >
                          <Plus size={20} className="shrink-0" />
                          <span className="hidden md:inline">Agregar</span>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {productsList.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2 relative z-20">
                      {productsList.map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm animate-in zoom-in-95 group hover:border-red-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                              {product.quantity}x
                            </div>
                            <span className="font-bold text-slate-700">{product.description}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (isCompleted && onEdit) onEdit();
                              removeProduct(product.id);
                            }}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100 hover:scale-110 active:scale-95"
                            title="Eliminar producto"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                      <Package size={24} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-medium">No hay productos agregados</p>
                      <p className="text-xs mt-1">Agrega al menos un producto para continuar</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedOriginType === 'warehouse' && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 mb-6">
                  <p className="text-emerald-800 text-sm flex items-start gap-2">
                    <span className="text-lg">🏪</span>
                    <strong>Desde almacén:</strong> Tu producto ya está guardado en nuestro almacén y será enviado directamente.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-3">Seleccionar productos del almacén</h4>

                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-4 shadow-sm">
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <Select
                          label="Producto disponible *"
                          value={selectedWarehouseProduct.productId}
                          options={[
                            ...warehouseProducts.map((product) => ({
                              label: `${product.description} (${product.code}) - Disponible: ${product.available_quantity}`,
                              value: product.id
                            }))
                          ]}
                          onChange={(value) => setSelectedWarehouseProduct(prev => ({ ...prev, productId: value }))}
                        />
                      </div>

                      <div className="w-24">
                        <Input
                          label="Cant. *"
                          type="number"
                          min="1"
                          max={warehouseProducts.find(p => p.id === selectedWarehouseProduct.productId)?.available_quantity || 1}
                          value={selectedWarehouseProduct.quantity.toString()}
                          onChange={(value) => setSelectedWarehouseProduct(prev => ({ ...prev, quantity: parseInt(value) || 1 }))}
                          placeholder="1"
                        />
                      </div>

                      <div>
                        <Button
                          type="button"
                          onClick={addWarehouseProduct}
                          disabled={!selectedWarehouseProduct.productId || selectedWarehouseProduct.quantity < 1}
                          className="h-[52px] min-w-[52px] md:w-auto md:px-6 rounded-xl bg-[var(--surface-dark)] hover:bg-[var(--surface-dark)]/90 p-0 md:p-4 flex items-center justify-center gap-2 shadow-lg shadow-[var(--surface-dark)]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all text-white font-bold"
                          title="Agregar producto del almacén"
                        >
                          <Plus size={20} className="shrink-0" />
                          <span className="hidden md:inline">Agregar</span>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {selectedWarehouseList.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2 relative z-20">
                      {selectedWarehouseList.map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm animate-in zoom-in-95 group hover:border-red-100 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-700">{product.description}</span>
                              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono group-hover:bg-red-50 group-hover:text-red-400 transition-colors">{product.code}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm font-medium text-slate-600">Cantidad: {product.quantity}</span>
                              <span className="text-xs text-slate-400">/ {product.maxQuantity} disponibles</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (isCompleted && onEdit) onEdit();
                              removeWarehouseProduct(product.id);
                            }}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100 hover:scale-110 active:scale-95"
                            title="Eliminar producto del almacén"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                      <Package size={24} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-medium">No hay productos seleccionados del almacén</p>
                      <p className="text-xs mt-1">Selecciona al menos un producto para continuar</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {!isCompleted && isActive && (
            <div className="pt-6 flex justify-end">
              <Button
                onClick={onContinue}
                type="button"
                className="bg-[var(--surface-dark)] hover:bg-[var(--surface-dark)]/90 text-white px-8 rounded-full shadow-lg shadow-[var(--surface-dark)]/20 hover:shadow-xl hover:scale-105 transition-all"
              >
                Continuar al Destinatario
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}