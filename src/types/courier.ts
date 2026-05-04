export interface Courier {
  id: number;
  email: string;
  first_name: string;
  last_name: string | null;
  document_type: string;
  document_number: string;
  status: number;
  vehicle_type: string;
  license: string;
  plate_number: string;
  brand: string;
}

export type CarrierDeliveryStatus =
  | 'pending'
  | 'scheduled'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export interface CarrierDelivery {
  id: string;
  status: CarrierDeliveryStatus;
  total_amount: number;
  shipping_date: string;
  customer_name: string;
  phone: string;
  company_name: string;
  address: string;
  district_name: string;
  sector_name: string;
  signed_urls?: string[];
  url_01?: string;
  url_02?: string;
  url_03?: string;
  
}
