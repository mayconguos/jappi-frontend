'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CatalogProduct } from '@/components/tables/CompanyProductsTable';

import api from '@/app/services/api';
import { useAuth } from '@/context/AuthContext';

const INITIAL_PRODUCTS: CatalogProduct[] = [];

export interface InboundRequest {
  id: number;
  request_date: string;
  total_skus: number;
  total_units: number;
  status: 'pending' | 'in_transit' | 'received' | 'cancelled';
  items?: any[];
  pdf_url: string;
}

const INITIAL_REQUESTS: InboundRequest[] = [];

interface InventoryContextType {
  products: CatalogProduct[];
  requests: InboundRequest[];
  addProduct: (product: Omit<CatalogProduct, 'id' | 'last_updated'>) => Promise<void>;
  updateProduct: (product: Omit<CatalogProduct, 'last_updated'> & { last_updated?: string }) => void;
  deleteProduct: (id: number) => void;
  refreshInventory: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<CatalogProduct[]>(INITIAL_PRODUCTS);
  const [requests, setRequests] = useState<InboundRequest[]>(INITIAL_REQUESTS);
  const { user } = useAuth();

  const refreshInventory = async () => {
    if (!user?.id_company) return;

    try {
      const response = await api.get(`/inventory/${user.id_company}`);
      const data = Array.isArray(response.data) ? response.data : (response.data?.kardex || []);

      const mappedProducts: CatalogProduct[] = data.map((p: any) => ({
        id: p.id,
        id_product: p.id_product,
        sku: p.SKU || `PROD-${p.id}`,
        product_name: p.product_name,
        description: p.description,
        quantity: Number(p.quantity || 0),
        status: p.status === 0 ? 'inactive' : 'active',
        last_updated: p.modified_at
      }));

      setProducts(mappedProducts);

      // Fetch Requests
      const requestsResponse = await api.get(`/inventory/supply-request/${user.id_company}`);
      const requestsData = Array.isArray(requestsResponse.data) ? requestsResponse.data : [];

      const mappedRequests: InboundRequest[] = requestsData.map((r: any) => ({
        id: r.id,
        request_date: new Date(r.created_at).toLocaleDateString(),
        total_skus: 0,
        total_units: 0,
        status: (r.status?.toLowerCase() || 'pending') as any,
        pdf_url: "#"
      }));

      setRequests(mappedRequests);

    } catch (error) {
      console.error('Error fetching inventory data:', error);
    }
  };

  React.useEffect(() => {
    if (user?.id_company) {
      refreshInventory();
    } else {
      setProducts([]);
      setRequests([]);
    }
  }, [user]);

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
        id_company: user?.id_company
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
        quantity: backendProduct.quantity || 0,
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



  return (
    <InventoryContext.Provider value={{
      products,
      requests,
      addProduct,
      updateProduct,
      deleteProduct,
      refreshInventory
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
