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
  date: string;
  recipient: string;
  recipient_phone: string;
  recipient_address: string;
  origin: string;
  destination: string;
  district: string;
  items_count: number;
  signed_urls?: string[];
}
