'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';

import { CheckCircle, AlertTriangle } from 'lucide-react';

import { useApi } from '@/hooks';

import { Button } from '@/components/ui/button';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';
import DeliveryLoader from '@/components/ui/delivery-loader';

import DataTableFilter from '@/components/filters/DataTableFilter';
import SupplyPickupsTable from '@/components/tables/SupplyPickupsTable';

import { Pickup, ApiPickup, PickupStatus } from '@/types/pickup';

// ─── Constantes ───────────────────────────────────────────────
const STATUS_LABELS: Record<PickupStatus, string> = {
  pending: 'Pendiente',
  scheduled: 'Programado',
  picked_up: 'En Tránsito',
  received: 'Validado en Almacén',
};

// ─── Helper de Mapeo ───────────────────────────────────────────
const mapApiPickupToPickup = (apiPickup: ApiPickup): Pickup => {
  const date = apiPickup.pickup_date ? new Date(apiPickup.pickup_date) : new Date();
  const dateStr = !isNaN(date.getTime())
    ? date.toISOString().split('T')[0].split('-').reverse().join('/')
    : 'Fecha inválida';

  const items = apiPickup.items || [];
  return {
    id: apiPickup.id,
    id_driver: apiPickup.id_driver || null,
    created_at: dateStr,
    pickup_date: dateStr,
    seller: apiPickup.company_name || 'Empresa Emisora',
    carrier: apiPickup.driver_name || 'Sin asignar',
    district: apiPickup.district_name || 'Distrito',
    address: apiPickup.address || 'Dirección',
    packages: Array.isArray(items) ? items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0,
    status: apiPickup.status || 'pending',
    phone: apiPickup.phone || 'Sin teléfono',
    origin: 'warehouse',
  };
};

// ─── Data estática ─────────────────────────────────────────────
const ITEMS_PER_PAGE = 10;
const FILTER_FIELDS = [
  { value: 'all', label: 'Todos los campos' },
  { value: 'seller', label: 'Empresa' },
  { value: 'carrier', label: 'Transportista' },
];

// ─── MOCK DATA para pruebas mientras haya endpoint real ────────
// Removidos los mocks ya que ahora utilizamos la API

export default function SupplyPickupsPage() {
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [field, setField] = useState('all');
  const [value, setValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  // Default to today for both from and to
  const todayDate = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima', });
  const [dateRange, setDateRange] = useState<{ from: string | undefined; to: string | undefined }>({
    from: todayDate,
    to: todayDate
  });

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const { get, put } = useApi<any>();

  const [isConfirmValidationOpen, setIsConfirmValidationOpen] = useState(false);
  const [isFinalConfirmOpen, setIsFinalConfirmOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [pickupToValidate, setPickupToValidate] = useState<Pickup | null>(null);
  const [pickupCost, setPickupCost] = useState<string>('');

  const [successModal, setSuccessModal] = useState<string | null>(null);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  useEffect(() => {
    const fetchSupplyPickups = async () => {
      setIsInitialLoading(true);
      try {
        const resp = await get('/pickup/supply-request');
        const data = Array.isArray(resp) ? resp : (resp as any)?.data;

        if (data && Array.isArray(data)) {
          console.log('Recojos Abastecimiento API Response:', data);
          setPickups(data.map(mapApiPickupToPickup));
        } else {
          console.warn('La respuesta de la API no es un arreglo o no contiene "data":', resp);
          setPickups([]);
        }
      } catch (err) {
        console.error('Error fetching supply pickups:', err);
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchSupplyPickups();
  }, [get]);

  useEffect(() => setCurrentPage(1), [field, value, dateRange]);

  const filteredPickups = useMemo(() => {
    let filtered = pickups;

    // Filter by Date Range
    if (dateRange.from) {
      const fDate = new Date(dateRange.from);
      fDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(p => {
        const pDate = new Date(p.pickup_date.split('/').reverse().join('-')); // DD/MM/YYYY to YYYY-MM-DD
        pDate.setHours(0, 0, 0, 0);
        return pDate >= fDate;
      });
    }

    if (dateRange.to) {
      const tDate = new Date(dateRange.to);
      tDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(p => {
        const pDate = new Date(p.pickup_date.split('/').reverse().join('-'));
        pDate.setHours(23, 59, 59, 999);
        return pDate <= tDate;
      });
    }

    if (!value) return filtered;

    const searchTerm = value.toLowerCase();
    return filtered.filter((p) => {
      if (field === 'all') {
        return p.seller.toLowerCase().includes(searchTerm) || p.district.toLowerCase().includes(searchTerm);
      }
      const fieldValue = p[field as keyof Pickup];
      return fieldValue ? String(fieldValue).toLowerCase().includes(searchTerm) : false;
    });
  }, [field, value, pickups, dateRange]);

  const totalItems = filteredPickups.length;
  const currentItems = filteredPickups.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleValidateClick = (pickup: Pickup) => {
    setPickupToValidate(pickup);
    setPickupCost('');
    setIsConfirmValidationOpen(true);
  };

  const handlePreConfirm = () => {
    setIsConfirmValidationOpen(false);
    setIsFinalConfirmOpen(true);
  };

  const handleFinalConfirm = async () => {
    if (!pickupToValidate) return;
    setIsValidating(true);

    const resp = await put(`/inventory/pickup/validate/${pickupToValidate.id}`, {
      price: parseFloat(pickupCost)
    });

    setIsValidating(false);

    if (!resp) {
      // Hubo un error en la solicitud
      setIsFinalConfirmOpen(false);
      setErrorModal('No se pudo aprobar el recojo. Verifique la información e intente nuevamente.');
      return;
    }

    // Al ser aprobado exitosamente, desaparece de esta tabla
    setPickups(prev => prev.filter(p => p.id !== pickupToValidate.id));

    setIsFinalConfirmOpen(false);
    setPickupToValidate(null);
    setPickupCost('');
    setSuccessModal('El recojo ha sido aprobado y ahora se encuentra en la bandeja principal de recojos.');
  };

  // Initial early return block for loading is moved to component body

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-8 flex flex-col gap-8">

      <DataTableFilter
        field={field}
        setField={setField}
        value={value}
        setValue={setValue}
        filterFields={FILTER_FIELDS}
        onExportExcel={() => console.log('Exporting')}
        dateRange={dateRange}
        setDateRange={setDateRange}
        totalItems={totalItems}
      />

      {isInitialLoading ? (
        <div className="flex justify-center items-center h-64">
          <DeliveryLoader message="Cargando autorizaciones pendientes..." />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <SupplyPickupsTable
            pickups={currentItems}
            currentPage={currentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            onValidate={handleValidateClick}
          />

          {totalItems > 0 && (
            <div className="flex justify-center sm:justify-end">
              <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
            </div>
          )}

          {totalItems === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
              <p className="text-slate-400">
                {value ? `No se encontraron resultados para "${value}"` : 'No hay autorizaciones pendientes'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal de Validación */}
      <Modal
        isOpen={isConfirmValidationOpen}
        onClose={() => !isValidating && setIsConfirmValidationOpen(false)}
        size="sm"
        title="Aprobar Recojo"
        footer={
          <ModalFooter className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsConfirmValidationOpen(false)} disabled={isValidating}>
              Cancelar
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
              onClick={handlePreConfirm}
              disabled={isValidating || pickupCost === '' || parseFloat(pickupCost) < 0}
            >
              Continuar
            </Button>
          </ModalFooter>
        }
      >
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          </div>
          <p className="text-slate-700 font-medium mb-2">
            ¿Aprobar confirmación de recojo <span className="font-bold text-gray-900">N° {pickupToValidate?.id}</span>?
          </p>
          <div className="bg-gray-50 p-3 rounded-lg text-sm text-left w-full space-y-1 mb-2">
            <p><span className="text-gray-500">Empresa:</span> {pickupToValidate?.seller}</p>
            <p><span className="text-gray-500">Solicitud base:</span> #{pickupToValidate?.id}</p>
          </div>

          <div className="w-full mt-2 text-left space-y-1.5 bg-white p-3 rounded-lg border border-gray-200">
            <label className="text-sm font-semibold text-gray-800 flex justify-between items-center">
              Costo estimado del Recojo (S/)
              <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-red-200">Obligatorio</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={pickupCost}
              onChange={(e) => setPickupCost(e.target.value)}
              placeholder="0.00"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {(!pickupCost || parseFloat(pickupCost) < 0) && (
              <p className="text-[11px] text-red-500 font-medium">
                * Por favor asigna un monto válido (el recojo puede costar S/ 0).
              </p>
            )}
          </div>

          <p className="text-xs text-amber-600 font-medium bg-amber-50 p-2 rounded w-full mt-3 border border-amber-100">
            Asegúrate de haber revisado los datos. Esta acción autorizará la recolección.
          </p>
        </div>
      </Modal>

      {/* Segundo Modal de Confirmación Estricta */}
      <Modal
        isOpen={isFinalConfirmOpen}
        onClose={() => !isValidating && setIsFinalConfirmOpen(false)}
        size="sm"
        title="Confirmación Final"
        footer={
          <ModalFooter className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setIsFinalConfirmOpen(false);
                setIsConfirmValidationOpen(true); // Regresar al modal anterior
              }}
              disabled={isValidating}
            >
              Regresar
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              onClick={handleFinalConfirm}
              disabled={isValidating}
            >
              {isValidating ? <><DeliveryLoader message="" /> Procesando...</> : 'Sí, Aprobar Definitivamente'}
            </Button>
          </ModalFooter>
        }
      >
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-14 h-14 rounded-full bg-amber-50 border-4 border-amber-100 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
          </div>
          <p className="text-slate-700 font-medium mb-1">
            ¿Estás totalmente seguro de aprobar el recojo <span className="font-bold text-gray-900">N° {pickupToValidate?.id}</span>?
          </p>
          <p className="text-sm text-gray-500 mb-2">
            El recojo será registrado con un costo de <span className="font-bold text-emerald-600">S/ {parseFloat(pickupCost || '0').toFixed(2)}</span>
          </p>
          <p className="text-xs text-gray-400">
            Al confirmar, el sistema lo moverá automáticamente al módulo de recojos generales. Esta acción no se puede deshacer aquí.
          </p>
        </div>
      </Modal>

      {/* Error Modal */}
      {errorModal && (
        <Modal
          isOpen={!!errorModal}
          onClose={() => setErrorModal(null)}
          size="sm"
          title="Error al Aprobar"
          footer={
            <ModalFooter className="justify-center">
              <Button onClick={() => setErrorModal(null)} className="bg-slate-800 hover:bg-slate-900 text-white w-full sm:w-auto">Entendido</Button>
            </ModalFooter>
          }
        >
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-slate-600 font-medium">{errorModal}</p>
          </div>
        </Modal>
      )}

      {/* Success Modal */}
      {successModal && (
        <Modal
          isOpen={!!successModal}
          onClose={() => setSuccessModal(null)}
          size="sm"
          title="Operación Exitosa"
          footer={
            <ModalFooter className="justify-center">
              <Button onClick={() => setSuccessModal(null)} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto">Aceptar</Button>
            </ModalFooter>
          }
        >
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-slate-600 font-medium">{successModal}</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
