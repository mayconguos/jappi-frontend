'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useApi, useModal } from '@/hooks';
import DeliveryLoader from '@/components/ui/delivery-loader';
import { Pagination } from '@/components/ui/pagination';
import CourierZonesTable from '@/components/tables/CourierZonesTable';
import CourierZonesFilter from '@/components/filters/CourierZonesFilter';
import CourierZoneAssignmentModal from '@/components/forms/modals/CourierZoneAssignmentModal';
import StatusModal, { StatusType } from '@/components/ui/status-modal';

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
      // Assuming endpoint for couriers with their zones exists or using existing /user?type=couriers
      // For now, mapping data to include empty zones if they aren't in the response
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
      return fieldValue ? String(fieldValue).toLowerCase().includes(val) : false;
    });
  }, [couriers, field, value]);

  const totalItems = filtered.length;
  const currentItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Handlers
  const handleSaveZones = async (courierId: number, pickupZones: CourierZone[], deliveryZones: CourierZone[]) => {
    setIsSubmitting(true);
    try {
        // Enpoint mock/guessed for zone assignment
        // request body: { pickup_zones: [...], delivery_zones: [...] }
        await post(`/user/${courierId}/zones`, {
            pickup_zones: pickupZones.map(z => ({ id_district: z.id_district, id_sector: z.id_sector })),
            delivery_zones: deliveryZones.map(z => ({ id_district: z.id_district, id_sector: z.id_sector }))
        });

        // Update local state
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

  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
      
      <div className="space-y-6">
        <CourierZonesFilter
          field={field}
          setField={setField}
          value={value}
          setValue={setValue}
          filterFields={filterFields}
          totalItems={totalItems}
        />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <DeliveryLoader message="Cargando zonas de operación..." />
          </div>
        ) : apiError && couriers.length === 0 ? (
          <div className="p-8 rounded-xl border border-red-100 bg-red-50 text-center text-red-600">
            <p className="font-medium">Error al cargar datos: {apiError}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <CourierZonesTable
              couriers={currentItems}
              currentPage={currentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              onManageZones={manageModal.openModal}
            />

            {totalItems > 0 && (
              <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        )}
      </div>

      {/* Modal de Asignación */}
      <CourierZoneAssignmentModal
        isOpen={manageModal.isOpen}
        onClose={manageModal.closeModal}
        courier={manageModal.data}
        onSave={handleSaveZones}
        isLoading={isSubmitting}
      />

      {/* Status Modal */}
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
