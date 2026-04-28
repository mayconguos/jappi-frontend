'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

import ExcelJS from 'exceljs';

import DeliveryLoader from '@/components/ui/delivery-loader';
import { Pagination } from '@/components/ui/pagination';
import StatusModal, { StatusType } from '@/components/ui/status-modal';

import CourierZonesFilter from '@/components/filters/CourierZonesFilter';
import CourierZonesTable from '@/components/tables/CourierZonesTable';
import CourierZoneAssignmentModal from '@/components/forms/modals/CourierZoneAssignmentModal';

import { useApi, useModal } from '@/hooks';

// --- Tipos --- 
export interface CourierZone {
  id: number;
  id_district: number;
  district_name: string;
  id_sector: number;
  sector_name: string;
}

export interface CourierWithZones {
  id: number;
  first_name: string;
  last_name: string | null;
  email: string;
  vehicle_type: string;
  plate_number: string;
  status: number;
  pickup_zones: CourierZone[];
  delivery_zones: CourierZone[];
}

const ITEMS_PER_PAGE = 10;
const filterFields = [
  { value: 'first_name', label: 'Nombre' },
  { value: 'last_name', label: 'Apellido' },
  { value: 'email', label: 'Correo' },
];

export default function CourierZonesPage() {
  // State
  const [couriers, setCouriers] = useState<CourierWithZones[]>([]);
  const [loading, setLoading] = useState(true);
  const [field, setField] = useState('');
  const [value, setValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status Modal
  const [status, setStatus] = useState<{
    isOpen: boolean;
    type: StatusType;
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  // Hooks
  const { get, post, error: apiError } = useApi<any>();
  const manageModal = useModal<CourierWithZones>();

  // Data Fetching
  const fetchCouriersWithZones = useCallback(async () => {
    setLoading(true);
    try {
      const response = await get('/user?type=couriers');
      if (response && Array.isArray(response)) {
        const data = response.map(c => ({
          ...c,
          pickup_zones: c.pickup_zones || [],
          delivery_zones: c.delivery_zones || []
        })).sort((a, b) => b.id - a.id);
        setCouriers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => {
    fetchCouriersWithZones();
  }, [fetchCouriersWithZones]);

  // Derived Data
  const filtered = useMemo(() => {
    if (!field || !value) return couriers;
    const val = value.toLowerCase();
    return couriers.filter(c => {
      const fieldValue = c[field as keyof CourierWithZones];
      if (typeof fieldValue === 'string' || typeof fieldValue === 'number') {
        return String(fieldValue).toLowerCase().includes(val);
      }
      return false;
    });
  }, [couriers, field, value]);

  const totalItems = filtered.length;
  const currentItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Handlers
  const handleSaveZones = async (courierId: number, pickupZones: CourierZone[], deliveryZones: CourierZone[]) => {
    setIsSubmitting(true);
    try {
      await post(`/user/${courierId}/zones`, {
        pickup_zones: pickupZones.map(z => ({ id_district: z.id_district, id_sector: z.id_sector })),
        delivery_zones: deliveryZones.map(z => ({ id_district: z.id_district, id_sector: z.id_sector }))
      });

      setCouriers(prev => prev.map(c => c.id === courierId ? { ...c, pickup_zones: pickupZones, delivery_zones: deliveryZones } : c));

      setStatus({
        isOpen: true,
        type: 'success',
        title: '¡Cambios guardados!',
        message: 'Las zonas de operación han sido actualizadas correctamente para este transportista.'
      });
      manageModal.closeModal();
    } catch (err: any) {
      setStatus({
        isOpen: true,
        type: 'error',
        title: 'Error al guardar',
        message: err?.response?.data?.message || 'No se pudieron actualizar las zonas de operación.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Zonas de Operación');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nombre', key: 'first_name', width: 20 },
      { header: 'Apellido', key: 'last_name', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Vehículo', key: 'vehicle_type', width: 20 },
      { header: 'Placa', key: 'plate_number', width: 15 },
      { header: 'Zonas Recojo', key: 'pickup_zones_str', width: 50 },
      { header: 'Zonas Entrega', key: 'delivery_zones_str', width: 50 },
    ];

    const dataToExport = filtered.map(c => ({
      ...c,
      pickup_zones_str: c.pickup_zones.map(z => `${z.district_name} (${z.sector_name})`).join(', '),
      delivery_zones_str: c.delivery_zones.map(z => `${z.district_name} (${z.sector_name})`).join(', '),
    }));

    dataToExport.forEach((row) => worksheet.addRow(row));

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = globalThis.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zonas_operacion_${new Date().toISOString().split('T')[0]}.xlsx`;
    link.click();
    globalThis.URL.revokeObjectURL(url);
  };

  const renderTableContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <DeliveryLoader message="Cargando zonas de operación..." />
        </div>
      );
    }

    if (apiError && couriers.length === 0) {
      return (
        <div className="p-8 rounded-xl border border-red-100 bg-red-50 text-center text-red-600 flex flex-col items-center gap-2">
          <p className="font-medium">Error al cargar datos: {apiError}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <CourierZonesTable
          couriers={currentItems}
          currentPage={currentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          onManageZones={manageModal.openModal}
        />

        {totalItems > 0 && (
          <div className="flex justify-center sm:justify-end">
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-8 flex flex-col gap-8 animate-in fade-in duration-500">
      <CourierZonesFilter
        field={field}
        setField={setField}
        value={value}
        setValue={setValue}
        filterFields={filterFields}
        onExportExcel={handleExportExcel}
        totalItems={totalItems}
      />

      {renderTableContent()}

      <CourierZoneAssignmentModal
        isOpen={manageModal.isOpen}
        onClose={manageModal.closeModal}
        courier={manageModal.data}
        onSave={handleSaveZones}
        isLoading={isSubmitting}
      />

      <StatusModal
        isOpen={status.isOpen}
        onClose={() => setStatus({ ...status, isOpen: false })}
        type={status.type}
        title={status.title}
        message={status.message}
      />
    </div>
  );
}
