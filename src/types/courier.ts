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
