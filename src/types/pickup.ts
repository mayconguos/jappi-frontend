export type PickupStatus = 'pending' | 'scheduled' | 'picked_up' | 'received';

export interface Pickup {
  id: number;
  id_driver: number | null;
  address: string;
  carrier: string;
  created_at: string;
  district: string;
  observation?: string;
  origin: 'pickup' | 'warehouse';
  packages: number;
  phone: string;
  pickup_date: string;
  seller: string;
  status: PickupStatus;
}

export interface ApiPickup {
  id: number;
  id_driver?: number | null;
  address: string;
  company_name: string; // seller
  district_name: string;
  driver_name: string | null; // carrier
  items: {
    product_name: string;
    quantity: number;
  }[];
  origin?: string;
  package_count?: number; //packages
  phone: string;
  pickup_date: string;
  status: PickupStatus;
}
