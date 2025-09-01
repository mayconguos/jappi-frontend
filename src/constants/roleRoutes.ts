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
  UserCheck
} from 'lucide-react';

export type Role =
  | 'admin'
  | 'coordinacion'
  | 'almacen'
  | 'empresa'
  | 'transportista';

export interface RouteItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

export const roleRoutes: Record<Role, RouteItem[]> = {
  admin: [
    { path: '/dashboard/deliveries-by-date', label: 'Envíos por fecha', icon: Calendar },
    { path: '/dashboard/pickups', label: 'Recojos', icon: Truck },
    { path: '/dashboard/deliveries', label: 'Entregas', icon: Package },
    { path: '/dashboard/delivery-warehouse', label: 'Despachos desde almacén', icon: ClipboardCheck },
    { path: '/dashboard/warehouse', label: 'Almacén Japi', icon: Warehouse },
    { path: '/dashboard/clients', label: 'Empresas clientes', icon: Users },
    { path: '/dashboard/carriers', label: 'Transportistas', icon: Bike },
    { path: '/dashboard/workers', label: 'Usuarios internos', icon: IdCard },
    { path: '/dashboard/activations', label: 'Activación de cuentas', icon: UserCheck },
    { path: '/dashboard/pickup-history', label: 'Historial de recojos', icon: History },
    { path: '/dashboard/warehouse-requests', label: 'Solicitudes de almacén', icon: FileText },
  ],

  coordinacion: [
    { path: '/dashboard/pickups', label: 'Recojos', icon: Truck },
    { path: '/dashboard/deliveries', label: 'Entregas', icon: Package },
    { path: '/dashboard/delivery-warehouse', label: 'Despachos desde almacén', icon: ClipboardCheck },
    { path: '/dashboard/deliveries-by-date', label: 'Envíos por fecha', icon: Calendar },
    { path: '/dashboard/warehouse', label: 'Almacén Japi', icon: Warehouse },
    { path: '/dashboard/carriers', label: 'Transportistas', icon: Truck },
    { path: '/dashboard/clients', label: 'Empresas clientes', icon: Users },
    { path: '/dashboard/pickup-history', label: 'Historial de recojos', icon: History },
    { path: '/dashboard/warehouse-requests', label: 'Solicitudes de almacén', icon: FileText },
  ],

  almacen: [
    { path: '/dashboard/delivery-warehouse', label: 'Despachos desde almacén', icon: ClipboardCheck },
    { path: '/dashboard/warehouse', label: 'Almacén Japi', icon: Warehouse },
    { path: '/dashboard/deliveries-by-date', label: 'Envíos por fecha', icon: Calendar },
    { path: '/dashboard/pickups', label: 'Recojos', icon:  Truck },
    { path: '/dashboard/warehouse-requests', label: 'Solicitudes de almacén', icon: FileText },
  ],

  empresa: [
    { path: '/dashboard/company/create-shipment', label: 'Registrar envío', icon: Send },
    { path: '/dashboard/company/shipments', label: 'Mis envíos', icon: Package },
    { path: '/dashboard/company/warehouse', label: 'Mi almacén', icon: Warehouse },
    { path: '/dashboard/company/profile', label: 'Perfil de empresa **', icon: User },
  ],

  transportista: [
    { path: '/dashboard/carrier/deliveries', label: 'Entregas asignadas', icon: Package },
    { path: '/dashboard/carrier/pickups', label: 'Recojos asignados', icon: Truck },
    { path: '/dashboard/carrier/history', label: 'Historial de entregas', icon: History },
    { path: '/dashboard/carrier/pickup-history', label: 'Historial de recojos', icon: History },
  ],
};
