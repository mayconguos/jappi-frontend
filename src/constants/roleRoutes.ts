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
    { path: '/dashboard/shipments/calendar', label: 'Envíos por fecha', icon: Calendar },
    { path: '/dashboard/pickups', label: 'Recojos', icon: Truck },
    { path: '/dashboard/shipments/assigned', label: 'Entregas', icon: Package },
    { path: '/dashboard/inventory/dispatches', label: 'Despachos desde almacén', icon: ClipboardCheck },
    { path: '/dashboard/inventory/main', label: 'Almacén Japi', icon: Warehouse },
    { path: '/dashboard/accounts/companies', label: 'Empresas clientes', icon: Users },
    { path: '/dashboard/accounts/carriers', label: 'Transportistas', icon: Bike },
    { path: '/dashboard/accounts/workers', label: 'Usuarios internos', icon: IdCard },
    { path: '/dashboard/accounts/pending', label: 'Activación de cuentas', icon: UserCheck },
    { path: '/dashboard/pickups/history', label: 'Historial de recojos', icon: History },
    { path: '/dashboard/inventory/requests', label: 'Solicitudes de almacén', icon: FileText },
  ],

  coordinacion: [
    // { path: '/dashboard/pickups', label: 'Recojos', icon: Truck },
    // { path: '/dashboard/shipments/assigned', label: 'Entregas', icon: Package },
    // { path: '/dashboard/delivery-warehouse', label: 'Despachos desde almacén', icon: ClipboardCheck },
    // { path: '/dashboard/shipments/calendar', label: 'Envíos por fecha', icon: Calendar },
    // { path: '/dashboard/inventory/main', label: 'Almacén Japi', icon: Warehouse },
    // { path: '/dashboard/accounts/carriers', label: 'Transportistas', icon: Truck },
    // { path: '/dashboard/accounts/companies', label: 'Empresas clientes', icon: Users },
    // { path: '/dashboard/pickups/history', label: 'Historial de recojos', icon: History },
    // { path: '/dashboard/inventory/requests', label: 'Solicitudes de almacén', icon: FileText },
  ],

  almacen: [
    { path: '/dashboard/inventory/requests', label: 'Solicitudes', icon: FileText },
    { path: '/dashboard/inventory/main', label: 'Almacén Japi', icon: Warehouse },
    { path: '/dashboard/inventory/dispatches', label: 'Despachos', icon: ClipboardCheck },
    { path: '/dashboard/shipments/calendar', label: 'Envíos por fecha', icon: Calendar },
    { path: '/dashboard/pickups', label: 'Recojos', icon: Truck },
  ],

  empresa: [
    { path: '/dashboard/shipments/new', label: 'Registrar envío', icon: Send },
    { path: '/dashboard/shipments/list', label: 'Mis envíos', icon: Package },
    { path: '/dashboard/inventory/my-warehouse', label: 'Mi almacén', icon: Warehouse },
    { path: '/dashboard/inventory/requests', label: 'Solicitud de abastecimiento', icon: FileText },
    { path: '/dashboard/profile/main', label: 'Perfil de empresa', icon: User },
  ],

  transportista: [
    { path: '/dashboard/carrier/deliveries', label: 'Entregas asignadas', icon: Package },
    { path: '/dashboard/carrier/pickups', label: 'Recojos asignados', icon: Truck },
    { path: '/dashboard/carrier/history', label: 'Historial de entregas', icon: History },
    { path: '/dashboard/carrier/pickup-history', label: 'Historial de recojos', icon: History },
  ],
};
