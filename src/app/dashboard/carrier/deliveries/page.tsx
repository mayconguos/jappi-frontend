import CarrierDeliveriesTable from '@/components/tables/CarrierDeliveriesTable';

export default function CarrierDeliveriesPage() {
  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500">

      {/* Mobile pill bar */}
      <div className="flex md:hidden items-center gap-2 bg-white border border-gray-100 shadow-sm rounded-xl px-4 py-2.5">
        <div className="flex flex-1 items-center justify-center gap-1.5">
          <span className="text-xs font-medium text-gray-400">Entregas</span>
          <span className="text-sm font-bold text-gray-900">10</span>
        </div>
        <span className="w-px h-4 bg-gray-200" />
        <div className="flex flex-1 items-center justify-center gap-1.5">
          <span className="text-xs font-medium text-gray-400">Listos</span>
          <span className="text-sm font-bold text-emerald-600">3</span>
        </div>
      </div>

      {/* Desktop grid */}
      <div className="hidden md:grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Entregas</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">10</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Listos</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">3</p>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="space-y-4">
        <CarrierDeliveriesTable />
      </div>
    </div>
  );
}
