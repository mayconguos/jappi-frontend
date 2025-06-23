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
  | 'usuario'
  | 'empresa'
  | 'motorizado'
  | 'almacen'
  | 'coordinacion';

export interface RouteItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

export const roleRoutes: Record<Role, RouteItem[]> = {
  usuario: [
    { path: '/almacen', label: 'Almacén', icon: Warehouse },
    { path: '/mis-envios', label: 'Mis envíos', icon: Package },
    { path: '/perfil', label: 'Perfil', icon: User },
    { path: '/registro-envio', label: 'Registrar envíos', icon: Send },
  ],
  empresa: [
    { path: '/envios-fecha', label: 'Envíos por fecha', icon: Calendar },
    { path: '/recojos', label: 'Administrar recojos', icon: Truck },
    { path: '/entregas-almacen', label: 'Administrar entregas', icon: ClipboardCheck },
    { path: '/solicitudes-almacen', label: 'Solicitud de almacén', icon: FileText },
    { path: '/almacen-japi', label: 'Almacén Japi', icon: Warehouse },
    { path: '/entregas', label: 'Entregas almacén', icon: ClipboardCheck },
    { path: '/activacion', label: 'Activación de cuentas', icon: ShieldCheck },
    { path: '/dashboard/lista-externo', label: 'Usuarios externos', icon: Users },
    { path: '/registro-motorizado', label: 'Registro motorizado', icon: Truck },
    { path: '/lista-interno', label: 'Motorizados internos', icon: Users },
    { path: '/lista-admin', label: 'Administradores', icon: ShieldCheck },
    { path: '/historial-recojos', label: 'Historial de recojos', icon: History },
  ],
  motorizado: [
    { path: '/historial-entregas', label: 'Historial de entregas', icon: History },
    { path: '/historial-recojos', label: 'Historial de recojos', icon: History },
    { path: '/entregas-motorizado', label: 'Entregas', icon: Package },
    { path: '/recojos-motorizado', label: 'Recojos', icon: Truck },
  ],
  almacen: [
    { path: '/envios-fecha', label: 'Envíos por fecha', icon: Calendar },
    { path: '/recojos', label: 'Administrar recojos', icon: Truck },
    { path: '/solicitudes-almacen', label: 'Solicitud de almacén', icon: FileText },
    { path: '/almacen-japi', label: 'Almacén Japi', icon: Warehouse },
    { path: '/entregas', label: 'Preparación', icon: ClipboardCheck },
  ],
  coordinacion: [
    { path: '/envios-fecha', label: 'Envíos por fecha', icon: Calendar },
    { path: '/recojos', label: 'Administrar recojos', icon: Truck },
    { path: '/solicitudes-almacen', label: 'Solicitud de almacén', icon: FileText },
    { path: '/lista-interno', label: 'Motorizados internos', icon: Users },
    { path: '/dashboard/lista-externo', label: 'Usuarios externos', icon: Users },
  ],
};
