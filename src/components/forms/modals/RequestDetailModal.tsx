import clsx from 'clsx';
import { Badge } from '@/components/ui/badge';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Package, CheckCircle2, AlertTriangle, XCircle, MessageSquareWarning } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '@/app/services/api';
import { useAuth } from '@/context/AuthContext';
import { InboundRequest } from '@/components/tables/RequestsTable';

interface RequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: InboundRequest | null;
  /** Solo el almacén Japi puede confirmar recepción y editar cantidades */
  isWarehouse?: boolean;
  /** Callback para actualizar el estado en la lista del padre */
  onStatusChange?: (requestId: number, newStatus: InboundRequest['status']) => void;
}

interface RequestItem {
  id: number;
  id_product: number;
  quantity: number;
  SKU: string;
  product_name: string;
}

interface EditableItem extends RequestItem {
  received_quantity: number;
}

const statusLabel: Record<InboundRequest['status'], string> = {
  pending: 'Pendiente',
  received: 'Recibido',
  rejected: 'Rechazado',
};

export default function RequestDetailModal({
  isOpen,
  onClose,
  request,
  isWarehouse = false,
  onStatusChange,
}: RequestDetailModalProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<EditableItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Estado para el paso de confirmación de cancelación
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  // Observación de recepción (cuando cambian cantidades)
  const [observation, setObservation] = useState('');
  // Motivo de rechazo/cancelación
  const [cancelObservation, setCancelObservation] = useState('');

  useEffect(() => {
    if (isOpen && request) {
      const fetchDetails = async () => {
        setIsLoading(true);
        setError(null);
        setUpdateError(null);
        setShowCancelConfirm(false);
        try {
          const response = await api.get(`/inventory/supply-request/detail/${request.id}`);
          const raw: RequestItem[] = Array.isArray(response.data) ? response.data : [];
          setItems(raw.map(item => ({ ...item, received_quantity: item.quantity })));
        } catch (err) {
          console.error('Error fetching request details:', err);
          setError('No se pudieron cargar los detalles de la solicitud.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetails();
    } else {
      setItems([]);
      setUpdateError(null);
      setShowCancelConfirm(false);
      setObservation('');
      setCancelObservation('');
    }
  }, [isOpen, request]);

  const handleConfirmReception = async () => {
    if (!request) return;
    setIsConfirming(true);
    setUpdateError(null);
    try {
      // Solo enviar los ítems cuya cantidad haya cambiado
      const changedItems = items
        .filter(i => i.received_quantity !== i.quantity)
        .map(i => ({ id_product: i.id_product, quantity: i.received_quantity }));

      await api.put(`/inventory/supply-request/${request.id}`, {
        status: 'received',
        observation: observation.trim() || undefined,
        id_user: user?.id,
        ...(changedItems.length > 0 && { items: changedItems }),
      });
      onStatusChange?.(request.id, 'received');
      onClose();
    } catch (err: any) {
      setUpdateError(err?.response?.data?.message || 'Error al confirmar la recepción. Intenta nuevamente.');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!request) return;
    setIsCancelling(true);
    setUpdateError(null);
    try {
      await api.put(`/inventory/supply-request/${request.id}`, {
        status: 'rejected',
        observation: cancelObservation.trim() || undefined,
        id_user: user?.id,
      });
      onStatusChange?.(request.id, 'rejected');
      onClose();
    } catch (err: any) {
      setUpdateError(err?.response?.data?.message || 'Error al cancelar la solicitud. Intenta nuevamente.');
      setShowCancelConfirm(false);
    } finally {
      setIsCancelling(false);
    }
  };

  const updateReceivedQty = (id: number, value: string) => {
    const qty = Math.max(0, parseInt(value) || 0);
    setItems(prev => prev.map(i => i.id === id ? { ...i, received_quantity: qty } : i));
  };

  if (!request) return null;

  const totalRequested = items.reduce((acc, i) => acc + i.quantity, 0);
  const totalReceived = items.reduce((acc, i) => acc + i.received_quantity, 0);
  const canConfirm = isWarehouse && request.status === 'pending' && !showCancelConfirm;
  const canCancel = request.status === 'pending'; // ambos roles pueden cancelar
  const hasDiff = items.some(i => i.received_quantity !== i.quantity);
  const isActing = isConfirming || isCancelling;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={`Solicitud #${request.id}`}
      footer={
        <ModalFooter>
          {/* Si está en modo confirmación de cancelación, mostrar el flujo destructivo */}
          {showCancelConfirm ? (
            <>
              <Button
                variant="secondary"
                onClick={() => { setShowCancelConfirm(false); setCancelObservation(''); }}
                disabled={isCancelling}
              >
                No, volver
              </Button>
              <Button
                onClick={handleCancelRequest}
                disabled={isCancelling}
                className="bg-red-600 hover:bg-red-700 text-white gap-2"
              >
                {isCancelling
                  ? <><Loader2 size={16} className="animate-spin" /> Rechazando...</>
                  : <><XCircle size={16} /> Sí, rechazar</>
                }
              </Button>
            </>
          ) : (
            <>
              <Button onClick={onClose} variant="secondary" disabled={isActing}>
                Cerrar
              </Button>

              {canCancel && (
                <Button
                  variant="secondary"
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={isActing}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 gap-2"
                >
                  <XCircle size={16} />
                  Cancelar Solicitud
                </Button>
              )}

              {canConfirm && (
                <Button
                  onClick={handleConfirmReception}
                  disabled={isActing}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                >
                  {isConfirming
                    ? <><Loader2 size={16} className="animate-spin" /> Confirmando...</>
                    : <><CheckCircle2 size={16} /> Confirmar Recepción</>
                  }
                </Button>
              )}
            </>
          )}
        </ModalFooter>
      }
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={clsx(
              'capitalize px-3 py-1 text-sm font-medium',
              request.status === 'pending' && 'bg-yellow-50 text-yellow-700 border-yellow-200',
              request.status === 'received' && 'bg-green-50 text-green-700 border-green-200',
              request.status === 'rejected' && 'bg-red-50 text-red-700 border-red-200',
            )}>
              {statusLabel[request.status]}
            </Badge>
            <span className="text-sm text-gray-400">|</span>
            <span className="text-sm text-gray-500">Creada el {request.request_date}</span>
          </div>
        </div>

        {/* Banner instructivo para el almacén */}
        {canConfirm && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-lg border bg-emerald-50 border-emerald-100 text-emerald-700 text-sm">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
            <span>
              Ajusta las <strong>cantidades recibidas</strong> si difieren de las solicitadas, luego confirma la recepción.
            </span>
          </div>
        )}

        {/* Panel de confirmación de rechazo: ocupa el cuerpo del modal */}
        {showCancelConfirm && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle size={18} className="shrink-0" />
              <p className="font-semibold text-sm">¿Seguro que deseas rechazar esta solicitud?</p>
            </div>
            <p className="text-xs text-red-600">Esta acción no se puede deshacer. La solicitud quedará marcada como Rechazada.</p>
            <div className="space-y-1">
              <label className="text-xs font-medium text-red-700">
                Motivo del rechazo
                <span className="ml-1 text-red-400 font-normal">(opcional)</span>
              </label>
              <textarea
                value={cancelObservation}
                onChange={e => setCancelObservation(e.target.value)}
                placeholder="Describe brevemente el motivo del rechazo..."
                rows={3}
                disabled={isCancelling}
                className="w-full px-3 py-2 text-sm border border-red-200 bg-white rounded-lg
                  placeholder:text-gray-400 text-gray-800 resize-none
                  focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300
                  transition-colors disabled:opacity-60"
              />
            </div>
          </div>
        )}

        {/* Error */}
        {updateError && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg border bg-red-50 border-red-100 text-red-700 text-sm">
            <AlertTriangle size={16} className="shrink-0" />
            {updateError}
          </div>
        )}

        {/* Tabla de productos */}
        <div>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-emerald-600" />
              <p className="text-sm">Cargando productos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-red-50 rounded-lg border border-red-100">
              <p className="text-red-600 font-medium mb-1">Error de carga</p>
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                    <TableHead className="w-[50%]">Producto / SKU</TableHead>
                    <TableHead className="text-right">Solicitado</TableHead>
                    {canConfirm && <TableHead className="text-right w-36">Recibido</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={canConfirm ? 3 : 2} className="text-center py-12 text-gray-500">
                        No hay items en esta solicitud.
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map(item => {
                      const isDiff = item.received_quantity !== item.quantity;
                      return (
                        <TableRow key={item.id} className={clsx('hover:bg-gray-50/50', isDiff && canConfirm && 'bg-amber-50/40')}>
                          <TableCell>
                            <div className="font-medium text-gray-900">{item.product_name}</div>
                            {item.SKU && <div className="text-xs text-gray-500 font-mono mt-0.5">{item.SKU}</div>}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-semibold text-gray-900">{item.quantity}</span>
                            <span className="text-xs text-gray-500 ml-1">unds.</span>
                          </TableCell>
                          {canConfirm && (
                            <TableCell className="text-right">
                              <input
                                type="number"
                                min="0"
                                value={item.received_quantity}
                                onChange={e => updateReceivedQty(item.id, e.target.value)}
                                className={clsx(
                                  'w-24 text-right px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400',
                                  isDiff ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-gray-200 bg-white text-gray-900'
                                )}
                              />
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {canConfirm && hasDiff && items.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-amber-600 flex items-center gap-1.5">
              <AlertTriangle size={12} />
              Hay diferencias entre lo solicitado y lo recibido. Se registrará la cantidad real.
            </p>
            {/* Observación opcional */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">
                Observación
                <span className="ml-1 text-gray-400 font-normal">(opcional)</span>
              </label>
              <textarea
                value={observation}
                onChange={e => setObservation(e.target.value)}
                placeholder="Describe brevemente por qué cambiaron las cantidades..."
                rows={3}
                className="w-full px-3 py-2 text-sm border border-amber-200 bg-amber-50/50 rounded-lg
                  placeholder:text-gray-400 text-gray-800 resize-none
                  focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300
                  transition-colors"
              />
            </div>
          </div>
        )}

        {/* Observación registrada (solo lectura) — recibido con diferencias o rechazado */}
        {request.observation && request.status === 'received' && (
          <div className="flex items-start gap-3 px-4 py-3.5 rounded-lg border border-amber-200 bg-amber-50 text-sm">
            <MessageSquareWarning size={16} className="text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-amber-800 mb-0.5">Observación del almacén</p>
              <p className="text-amber-700 leading-relaxed">{request.observation}</p>
            </div>
          </div>
        )}
        {request.observation && request.status === 'rejected' && (
          <div className="flex items-start gap-3 px-4 py-3.5 rounded-lg border border-red-200 bg-red-50 text-sm">
            <XCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-red-800 mb-0.5">Motivo del rechazo</p>
              <p className="text-red-700 leading-relaxed">{request.observation}</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
