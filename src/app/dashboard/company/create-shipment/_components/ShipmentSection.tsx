'use client';

import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Package, Plus, Trash2 } from 'lucide-react';

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
}

export default function ShipmentSection({ form, onProductsChange }: ShipmentSectionProps) {
  const { formState: { errors }, watch, setValue, trigger } = form;
  const watchedValues = watch();

  // Detectar el tipo de envío seleccionado
  const selectedOriginType = watchedValues.service?.origin_type;

  // Estado para los datos de la empresa
  const [companyData, setCompanyData] = useState<{
    addresses: Array<{ address: string; id_region: number; id_district: number; id_sector?: number }>;
    phones: string[];
  }>({
    addresses: [],
    phones: []
  });

  // Estado para controlar si mostrar input personalizado
  const [showCustomAddress, setShowCustomAddress] = useState(false);
  const [showCustomPhone, setShowCustomPhone] = useState(false);

  // Estados para manejar productos en pickup
  const [tempProduct, setTempProduct] = useState({ description: '', quantity: 1 });
  const [productsList, setProductsList] = useState<Array<{ description: string; quantity: number; id: string }>>([]);

  // Estados para manejar productos del almacén
  const [warehouseProducts, setWarehouseProducts] = useState<Array<{ id: string; description: string; available_quantity: number; code: string }>>([]);
  const [selectedWarehouseProduct, setSelectedWarehouseProduct] = useState({ productId: '', quantity: 1 });
  const [selectedWarehouseList, setSelectedWarehouseList] = useState<Array<{ id: string; description: string; quantity: number; code: string; maxQuantity: number }>>([]);

  // Funciones para manejar productos
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

  // Funciones para manejar productos del almacén
  const addWarehouseProduct = () => {
    const product = warehouseProducts.find(p => p.id === selectedWarehouseProduct.productId);
    if (product && selectedWarehouseProduct.quantity > 0 && selectedWarehouseProduct.quantity <= product.available_quantity) {
      const existingIndex = selectedWarehouseList.findIndex(p => p.id === product.id);

      if (existingIndex >= 0) {
        // Actualizar cantidad si ya existe
        const updatedList = [...selectedWarehouseList];
        updatedList[existingIndex].quantity = selectedWarehouseProduct.quantity;
        setSelectedWarehouseList(updatedList);
      } else {
        // Agregar nuevo producto
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

  // Cargar datos de la empresa
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/user/company/detail', {
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

  // Cargar productos del almacén (mockeados por ahora)
  useEffect(() => {
    const fetchWarehouseProducts = async () => {
      try {
        // TODO: Reemplazar con llamada real a la API cuando esté lista
        // const token = localStorage.getItem('token');
        // const response = await api.get('/warehouse/products', {
        //   headers: { authorization: `${token}` }
        // });

        // Datos mockeados
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

  // Notificar cambios en las listas de productos
  useEffect(() => {
    if (onProductsChange) {
      onProductsChange({
        pickup: productsList,
        warehouse: selectedWarehouseList
      });
    }
  }, [productsList, selectedWarehouseList, onProductsChange]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Package className="text-[var(--surface-dark)]" size={20} />
        Información del envío
      </h2>

      {/* Configuración Inicial del Envío */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>

      {/* Renderizado condicional según el tipo de envío */}
      {selectedOriginType === 'pickup' && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Información para recojo</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800 text-sm">
              📦 <strong>Envío con recojo:</strong> Nuestro personal recogerá el paquete en la dirección especificada.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                        setValue('sender.address.address', value.toUpperCase());
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
                    className="text-sm text-blue-600 hover:text-blue-800"
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
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    ← Volver a teléfonos guardados
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sección de Productos */}
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-800 mb-4">Productos a recoger</h4>

            {/* Formulario para agregar productos */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Input
                    label="Descripción del producto *"
                    value={tempProduct.description}
                    onChange={(value) => setTempProduct(prev => ({ ...prev, description: value.toUpperCase() }))}
                    placeholder="Ej: LAPTOP, CELULAR, DOCUMENTO"
                  />
                </div>

                <div className="w-20">
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
                    size="xs"
                    onClick={addProduct}
                    disabled={!tempProduct.description.trim() || tempProduct.quantity < 1}
                    className="h-14 px-3 bg-[var(--surface-dark)] hover:bg-[var(--surface-dark)]/90"
                    title="Agregar producto"
                  >
                    <Plus size={18} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Lista de productos agregados */}
            {productsList.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-gray-700">Productos agregados ({productsList.length}):</h5>
                <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
                  {productsList.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3">
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900">{product.description}</span>
                        <span className="ml-2 text-sm text-gray-500">× {product.quantity}</span>
                      </div>
                      <Button
                        type="button"
                        onClick={() => removeProduct(product.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mensaje cuando no hay productos */}
            {productsList.length === 0 && (
              <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Package size={24} className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No hay productos agregados</p>
                <p className="text-xs text-gray-400 mt-1">Agrega al menos un producto para continuar</p>
              </div>
            )}
          </div>
        </div>

      )}

      {selectedOriginType === 'warehouse' && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Envío desde Almacén Japi</h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-800 text-sm">
              🏪 <strong>Desde almacén:</strong> Tu producto ya está guardado en nuestro almacén y será enviado directamente.
            </p>
          </div>

          {/* Sección de Selección de Productos del Almacén */}
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-800 mb-4">Seleccionar productos del almacén</h4>

            {/* Formulario para seleccionar productos */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Select
                    label="Producto disponible *"
                    value={selectedWarehouseProduct.productId}
                    options={[
                      // { label: 'Seleccionar producto...', value: '' },
                      ...warehouseProducts.map((product) => ({
                        label: `${product.description} (${product.code}) - Disponible: ${product.available_quantity}`,
                        value: product.id
                      }))
                    ]}
                    onChange={(value) => setSelectedWarehouseProduct(prev => ({ ...prev, productId: value }))}
                  />
                </div>

                <div className="w-20">
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
                    size="xs"
                    onClick={addWarehouseProduct}
                    disabled={!selectedWarehouseProduct.productId || selectedWarehouseProduct.quantity < 1}
                    className="h-14 px-3 bg-[var(--surface-dark)] hover:bg-[var(--surface-dark)]/90"
                    title="Agregar producto del almacén"
                  >
                    <Plus size={18} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Lista de productos seleccionados del almacén */}
            {selectedWarehouseList.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-gray-700">Productos seleccionados ({selectedWarehouseList.length}):</h5>
                <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
                  {selectedWarehouseList.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{product.description}</span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{product.code}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-500">Cantidad: {product.quantity}</span>
                          <span className="text-xs text-gray-400">/ {product.maxQuantity} disponibles</span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={() => removeWarehouseProduct(product.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mensaje cuando no hay productos seleccionados */}
            {selectedWarehouseList.length === 0 && (
              <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Package size={24} className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No hay productos seleccionados del almacén</p>
                <p className="text-xs text-gray-400 mt-1">Selecciona al menos un producto para continuar</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}