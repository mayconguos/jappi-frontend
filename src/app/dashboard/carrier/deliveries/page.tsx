import CarrierDeliveriesTable from '@/components/tables/CarrierDeliveriesTable';

export default function CarrierDeliveriesPage() {
  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8 space-y-8 animate-in fade-in duration-500">

      {/* KPIs Section - Optimized for Mobile */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <div className="bg-white p-3 md:p-4 rounded-xl border border-gray-100 shadow-sm text-center md:text-left">
          <p className="text-xs md:text-sm font-medium text-gray-500 truncate">Pendientes</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">4</p>
        </div>
        <div className="bg-white p-3 md:p-4 rounded-xl border border-gray-100 shadow-sm text-center md:text-left">
          <p className="text-xs md:text-sm font-medium text-gray-500 truncate">En Ruta</p>
          <p className="text-xl md:text-2xl font-bold text-blue-600 mt-1">3</p>
        </div>
        <div className="bg-white p-3 md:p-4 rounded-xl border border-gray-100 shadow-sm text-center md:text-left">
          <p className="text-xs md:text-sm font-medium text-gray-500 truncate">Entregados</p>
          <p className="text-xl md:text-2xl font-bold text-emerald-600 mt-1">21</p>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="space-y-4">
        <CarrierDeliveriesTable />
      </div>
    </div>
  );
}
