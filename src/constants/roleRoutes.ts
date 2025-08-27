import {
  Package,
  User,
  Send,
  Calendar,
  Truck,
  Warehouse,
  Users,
  ClipboardCheck,
  ShieldCheck,
  History,
  FileText,
} from 'lucide-react';

export type Role =
  | 'admin'
  | 'coordinacion'
  | 'almacen'
  | 'empresa'
  | 'motorizado';

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
    { path: '/dashboard/clients', label: 'Empresas clientes **', icon: Users },
    { path: '/dashboard/couriers', label: 'Motorizados', icon: Truck },
    { path: '/dashboard/users', label: 'Usuarios internos', icon: ShieldCheck },
    { path: '/dashboard/activations', label: 'Activación de cuentas', icon: ShieldCheck },
    { path: '/dashboard/pickup-history', label: 'Historial de recojos', icon: History },
    { path: '/dashboard/warehouse-requests', label: 'Solicitudes de almacén', icon: FileText },
  ],

  coordinacion: [
    { path: '/dashboard/pickups', label: 'Recojos', icon: Truck },
    { path: '/dashboard/deliveries', label: 'Entregas', icon: Package },
    { path: '/dashboard/delivery-warehouse', label: 'Despachos desde almacén', icon: ClipboardCheck },
    { path: '/dashboard/deliveries-by-date', label: 'Envíos por fecha', icon: Calendar },
    { path: '/dashboard/warehouse', label: 'Almacén Japi', icon: Warehouse },
    { path: '/dashboard/couriers', label: 'Motorizados', icon: Truck },
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

  motorizado: [
    { path: '/dashboard/courier/deliveries', label: 'Entregas asignadas', icon: Package },
    { path: '/dashboard/courier/pickups', label: 'Recojos asignados', icon: Truck },
    { path: '/dashboard/courier/history', label: 'Historial de entregas', icon: History },
    { path: '/dashboard/courier/pickup-history', label: 'Historial de recojos', icon: History },
  ],
};
