import {
  Package,
  User,
  Send,
  Calendar,
  Truck,
  Warehouse,
  Users,
  ClipboardCheck,
  History,
  FileText,
  Bike,
  IdCard,
  UserCheck,
  Map,
  UploadCloud
} from 'lucide-react';

export type Role =
  | 'admin'
  | 'coordinacion'
  | 'almacen'
  | 'empresa'
  | 'transportista'
  | 'despacho';

export interface RouteItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

export const roleRoutes: Record<Role, RouteItem[]> = {
  admin: [
    { path: '/dashboard/shipments/all', label: 'Envíos', icon: Calendar },
    { path: '/dashboard/pickups', label: 'Recojos', icon: Truck },
    // { path: '/dashboard/shipments/assigned', label: 'Entregas', icon: Package },
    // { path: '/dashboard/inventory/dispatches', label: 'Despachos desde almacén', icon: ClipboardCheck },
    { path: '/dashboard/inventory/main', label: 'Almacén Japi', icon: Warehouse },
    { path: '/dashboard/accounts/companies', label: 'Empresas clientes', icon: Users },
    { path: '/dashboard/accounts/carriers', label: 'Transportistas', icon: Bike },
    { path: '/dashboard/accounts/courier-zones', label: 'Zonas de Operación', icon: Map },
    { path: '/dashboard/accounts/workers', label: 'Usuarios internos', icon: IdCard },
    { path: '/dashboard/accounts/pending', label: 'Activación de cuentas', icon: UserCheck },
    { path: '/dashboard/pickups/supply', label: 'Recojos abastecimiento', icon: Truck },
    { path: '/dashboard/inventory/requests', label: 'Solicitudes de almacén', icon: FileText },
    { path: '/dashboard/inventory/kardex', label: 'Kardex', icon: ClipboardCheck },
  ],

  coordinacion: [
    { path: '/dashboard/pickups', label: 'Recojos', icon: Truck },
    // { path: '/dashboard/shipments/assigned', label: 'Entregas', icon: Package },
    { path: '/dashboard/delivery-warehouse', label: 'Despachos desde almacén', icon: ClipboardCheck },
    { path: '/dashboard/shipments/all', label: 'Envíos', icon: Calendar },
    { path: '/dashboard/inventory/main', label: 'Almacén Japi', icon: Warehouse },
    { path: '/dashboard/accounts/carriers', label: 'Transportistas', icon: Truck },
    { path: '/dashboard/accounts/courier-zones', label: 'Zonas de Operación', icon: Map },
    { path: '/dashboard/accounts/companies', label: 'Empresas clientes', icon: Users },
    { path: '/dashboard/pickups/supply', label: 'Recojos abastecimiento', icon: Truck },
    { path: '/dashboard/inventory/requests', label: 'Solicitudes de almacén', icon: FileText },
    { path: '/dashboard/inventory/kardex', label: 'Kardex', icon: ClipboardCheck },
  ],

  almacen: [
    { path: '/dashboard/inventory/requests', label: 'Solicitudes', icon: FileText },
    { path: '/dashboard/inventory/main', label: 'Almacén Japi', icon: Warehouse },
    // { path: '/dashboard/inventory/dispatches', label: 'Despachos', icon: ClipboardCheck },
    { path: '/dashboard/shipments/all', label: 'Envíos', icon: Calendar },
    { path: '/dashboard/pickups', label: 'Recojos', icon: Truck },
    { path: '/dashboard/pickups/supply', label: 'Recojos de abastecimiento', icon: Truck },
  ],

  empresa: [
    { path: '/dashboard/shipments/new', label: 'Registrar envío', icon: Send },
    { path: '/dashboard/shipments/bulk', label: 'Carga masiva', icon: UploadCloud },
    { path: '/dashboard/shipments/list', label: 'Mis envíos', icon: Package },
    { path: '/dashboard/inventory/my-warehouse', label: 'Mi almacén', icon: Warehouse },
    { path: '/dashboard/inventory/kardex', label: 'Kardex', icon: ClipboardCheck },
    { path: '/dashboard/inventory/requests', label: 'Solicitud de abastecimiento', icon: FileText },
    { path: '/dashboard/profile/main', label: 'Perfil de empresa', icon: User },
  ],

  transportista: [
    { path: '/dashboard/carrier/deliveries', label: 'Entregas asignadas', icon: Package },
    { path: '/dashboard/carrier/pickups', label: 'Recojos asignados', icon: Truck },
    { path: '/dashboard/carrier/history', label: 'Historial de entregas', icon: History },
    { path: '/dashboard/carrier/pickup-history', label: 'Historial de recojos', icon: History },
  ],

  despacho: [
    // { path: '/dashboard/inventory/dispatches', label: 'Despachos desde almacén', icon: ClipboardCheck },
    { path: '/dashboard/inventory/kardex', label: 'Kardex', icon: ClipboardCheck },
  ],
};
