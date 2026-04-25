export type DispatchOriginType = 'stock' | 'pickup';
export type DispatchStatus = 'to_dispatch' | 'dispatched' | string;

export interface ApiDispatch {
  id: number;
  origin_type: DispatchOriginType;
  shipping_date: string;
  status_dispatch: DispatchStatus;
  status: string; // e.g., 'pending'
  id_pickup: number | null;
  product_name: string;
  id_company: number;
  company_name?: string; // Optional in case the backend adds it
}

export interface Dispatch {
  id: number;
  origin_type: DispatchOriginType;
  shipping_date: string;
  status_dispatch: DispatchStatus;
  status: string;
  id_pickup: number | null;
  product_name: string;
  id_company: number;
  company_name?: string;
}

export const mapApiDispatchToDispatch = (apiDispatch: ApiDispatch): Dispatch => {
  const date = apiDispatch.shipping_date ? new Date(apiDispatch.shipping_date) : new Date();
  // Using UTC or simple split to avoid timezone shifts since the API returns "YYYY-MM-DDT00:00:00.000Z"
  const dateStr = !isNaN(date.getTime())
    ? apiDispatch.shipping_date.split('T')[0].split('-').reverse().join('/')
    : 'Fecha inválida';

  return {
    ...apiDispatch,
    shipping_date: dateStr,
  };
};
