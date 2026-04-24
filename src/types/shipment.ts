export type ShipmentStatus = 'pending' | 'scheduled' | 'picked_up' | 'received' | 'in_transit' | 'delivered' | 'cancelled' | 'returned';

export interface Shipment {
  id: number;
  id_driver: number | null;
  address: string;
  carrier: string;
  district: string;
  observation?: string;
  origin: 'pickup' | 'warehouse';
  shipment_mode: string;
  packages: number;
  shipment_date: string;
  seller: string;
  status: string;
  customer_name: string;
  phone: string;
  total_amount: number;
}

export interface ApiShipment {
  id: number;
  id_driver: number | null;
  address: string;
  company_name: string; // seller
  district_name: string;
  driver_name: string | null;
  customer_name: string;
  total_amount: number;
  delivery_amount: number;
  package_count?: number;
  shipping_mode: string;
  phone: string;
  shipping_date: string;
  status: string;
}


