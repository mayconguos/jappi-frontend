'use client';

import { useEffect, useState } from 'react';
import secureLocalStorage from 'react-secure-storage';
import { Package, Clock, TrendingUp, Plus, Search, ChevronRight } from 'lucide-react';

interface UserData {
  name: string;
  email: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const storedUser = secureLocalStorage.getItem('user');
    if (storedUser && typeof storedUser === 'object') {
      setUser(storedUser as UserData);
    }
  }, []);

  const userName = user?.name?.split(' ')[0] || 'Usuario';

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            ¡Hola, {userName}! 👋
          </h1>
          <p className="text-slate-500 mt-1">
            Aquí tienes el resumen de tus operaciones de hoy.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-slate-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            <Search size={18} />
            <span className="hidden sm:inline">Buscar Envío</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
            <Plus size={18} />
            <span>Nuevo Envío</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Package size={24} />
            </div>
            <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              +12% vs ayer
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500">Envíos Activos</h3>
            <p className="text-3xl font-bold text-slate-900 mt-1">24</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock size={24} />
            </div>
            <span className="flex items-center text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              0 pendientes
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500">En Tránsito</h3>
            <p className="text-3xl font-bold text-slate-900 mt-1">8</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <TrendingUp size={24} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500">Entregados Hoy</h3>
            <p className="text-3xl font-bold text-slate-900 mt-1">12</p>
          </div>
        </div>
      </div>

      {/* Activity / Placeholder Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">Actividad Reciente</h3>
          <button className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center gap-1">
            Ver todo <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
          <Package size={48} className="mb-3 opacity-20" />
          <p className="text-sm font-medium">No hay actividad reciente para mostrar</p>
          <p className="text-xs mt-1">Tus envíos recientes aparecerán aquí</p>
        </div>
      </div>
    </div>
  );
}