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
  requests: InboundRequest[];
  refreshRequests: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<InboundRequest[]>(INITIAL_REQUESTS);
  const { user } = useAuth();

  const refreshRequests = async () => {
    if (!user?.id_company) return;

    try {
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
      console.error('Error fetching requests:', error);
    }
  };

  React.useEffect(() => {
    if (user?.id_company) {
      refreshRequests();
    } else {
      setRequests([]);
    }
  }, [user]);

  return (
    <InventoryContext.Provider value={{
      requests,
      refreshRequests
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
