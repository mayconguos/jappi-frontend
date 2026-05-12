export type ShipmentStatus =
  | 'pending'
  | 'scheduled'
  | 'received'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export const STATUS_META: Record<ShipmentStatus, { label: string; badge: string; dot: string }> = {
  pending: { label: 'Pendiente', badge: 'bg-amber-50  text-amber-700  border-amber-100', dot: 'bg-amber-400' },
  scheduled: { label: 'Programado', badge: 'bg-blue-50   text-blue-700   border-blue-100', dot: 'bg-blue-400' },
  received: { label: 'Recibido', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-400' },
  in_transit: { label: 'En tránsito', badge: 'bg-cyan-50 text-cyan-700 border-cyan-100', dot: 'bg-cyan-400' },
  delivered: { label: 'Entregado', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-400' },
  cancelled: { label: 'Cancelado', badge: 'bg-red-50 text-red-700 border-red-100', dot: 'bg-red-400' },
  returned: { label: 'Devuelto', badge: 'bg-orange-50 text-orange-700 border-orange-100', dot: 'bg-orange-400' },
};

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
  payment_method?: string;
  payment_destination?: string;
  signed_urls?: string[];
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
  payment_method?: string;
  payment_destination?: string;
  signed_urls?: string[];
}
