'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CatalogProduct } from '@/components/tables/CompanyProductsTable';
import { InboundRequest } from '@/components/tables/RequestsTable';
import api from '@/app/services/api';
import { useAuth } from '@/context/AuthContext';

// Initial Mock Data (Moved from pages)
const INITIAL_PRODUCTS: CatalogProduct[] = [
  { id: 101, sku: 'TSHIRT-WHT-S', product_name: 'Camiseta Básica Blanca S', stock: 120, status: 'active', last_updated: '2024-02-01' },
  { id: 102, sku: 'TSHIRT-WHT-M', product_name: 'Camiseta Básica Blanca M', stock: 85, status: 'active', last_updated: '2024-02-02' },
  { id: 103, sku: 'TSHIRT-WHT-L', product_name: 'Camiseta Básica Blanca L', stock: 200, status: 'active', last_updated: '2024-02-03' },
  { id: 104, sku: 'TSHIRT-BLK-S', product_name: 'Camiseta Básica Negra S', stock: 50, status: 'active', last_updated: '2024-02-04' },
  { id: 106, sku: 'HOODIE-GRY-L', product_name: 'Polera Gris L', stock: 0, status: 'inactive', last_updated: '2024-01-20' },
];

const INITIAL_REQUESTS: InboundRequest[] = [
  { id: 1024, request_date: '2024-02-01', total_skus: 3, total_units: 150, status: 'pending', pdf_url: '#' },
  { id: 1023, request_date: '2024-01-28', total_skus: 5, total_units: 500, status: 'in_transit', pdf_url: '#' },
  { id: 1022, request_date: '2024-01-15', total_skus: 2, total_units: 50, status: 'received', pdf_url: '#' },
  { id: 1021, request_date: '2024-01-10', total_skus: 10, total_units: 1200, status: 'received', pdf_url: '#' },
];

interface InventoryContextType {
  products: CatalogProduct[];
  requests: InboundRequest[];
  addProduct: (product: Omit<CatalogProduct, 'id' | 'last_updated'>) => Promise<void>;
  updateProduct: (product: Omit<CatalogProduct, 'last_updated'> & { last_updated?: string }) => void;
  deleteProduct: (id: number) => void;
  addRequest: (items: any[]) => InboundRequest;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<CatalogProduct[]>(INITIAL_PRODUCTS);
  const [requests, setRequests] = useState<InboundRequest[]>(INITIAL_REQUESTS);
  const { user } = useAuth();

  const addProduct = async (productData: Omit<CatalogProduct, 'id' | 'last_updated'>) => {
    try {
      console.log('Current User in InventoryContext:', user);

      if (!user?.id) {
        console.error('No user ID found (user is null or missing id)');
        // You might want to return here or handle it, but for now we log
      }

      const payload = {
        SKU: productData.sku,
        product_name: productData.product_name,
        description: productData.description || "",
        id_company: user?.id
      };

      // Call API
      const response = await api.post('/inventory/product', payload);
      const backendProduct = response.data;

      // Map backend response to CatalogProduct interface
      const productToAdd: CatalogProduct = {
        id: backendProduct.id,
        sku: backendProduct.SKU,
        product_name: backendProduct.product_name,
        description: backendProduct.description,
        stock: backendProduct.quantity || 0,
        status: 'active',
        last_updated: backendProduct.modified_at || new Date().toISOString()
      };

      setProducts([productToAdd, ...products]);
    } catch (error) {
      console.error('Failed to create product:', error);
      throw error;
    }
  };

  const updateProduct = (updatedProduct: Omit<CatalogProduct, 'last_updated'> & { last_updated?: string }) => {
    const productWithTimestamp: CatalogProduct = {
      ...updatedProduct,
      last_updated: new Date().toISOString()
    };
    setProducts(products.map(p => p.id === updatedProduct.id ? productWithTimestamp : p));
  };

  const deleteProduct = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const addRequest = (items: any[]) => {
    const newRequest: InboundRequest = {
      id: Math.floor(Math.random() * 1000) + 2000,
      request_date: new Date().toISOString().split('T')[0],
      total_skus: items.length,
      total_units: items.reduce((acc, item) => acc + item.quantity, 0),
      status: 'pending',
      pdf_url: '#'
    };
    setRequests([newRequest, ...requests]);
    return newRequest;
  };

  return (
    <InventoryContext.Provider value={{
      products,
      requests,
      addProduct,
      updateProduct,
      deleteProduct,
      addRequest
    }}>
      {children}
    </InventoryContext.Provider>
  );
}

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
