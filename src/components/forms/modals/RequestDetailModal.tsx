import clsx from 'clsx';
import { Badge } from '@/components/ui/badge';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '@/app/services/api';
import { InboundRequest } from '@/components/tables/RequestsTable';

interface RequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: InboundRequest | null;
}

interface RequestItem {
  id: number;
  id_product: number;
  quantity: number;
  SKU: string;
  product_name: string;
}

export default function RequestDetailModal({
  isOpen,
  onClose,
  request,
}: RequestDetailModalProps) {
  const [items, setItems] = useState<RequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && request) {
      const fetchDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await api.get(`/inventory/supply-request/detail/${request.id}`);
          setItems(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
          console.error("Error fetching request details:", err);
          setError("No se pudieron cargar los detalles de la solicitud.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchDetails();
    } else {
      setItems([]); // Clear on close
    }
  }, [isOpen, request]);

  if (!request) return null;

  const totalUnits = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={`Solicitud #${request.id}`}
      footer={
        <ModalFooter>
          <Button onClick={onClose} variant="secondary">
            Cerrar
          </Button>
        </ModalFooter>
      }
    >
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={clsx(
              "capitalize px-3 py-1 text-sm font-medium",
              request.status === 'pending' && "bg-yellow-50 text-yellow-700 border-yellow-200",
              request.status === 'in_transit' && "bg-blue-50 text-blue-700 border-blue-200",
              request.status === 'received' && "bg-green-50 text-green-700 border-green-200",
              request.status === 'cancelled' && "bg-red-50 text-red-700 border-red-200"
            )}>
              {request.status === 'pending' && 'Pendiente'}
              {request.status === 'in_transit' && 'En Tránsito'}
              {request.status === 'received' && 'Recibido'}
              {request.status === 'cancelled' && 'Cancelado'}
            </Badge>
            <span className="text-sm text-gray-400">|</span>
            <span className="text-sm text-gray-500">
              Creada el {request.request_date}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Package size={16} />
              <span><span className="font-semibold text-gray-900">{items.length}</span> Items</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span><span className="font-semibold text-gray-900">{totalUnits}</span> Unidades</span>
            </div>
          </div>
        </div>

        {/* Content */}
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
                    <TableHead className="w-[70%]">Producto / SKU</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-12 text-gray-500">
                        No hay items en esta solicitud.
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow key={item.id} className="hover:bg-gray-50/50">
                        <TableCell>
                          <div className="font-medium text-gray-900">{item.product_name}</div>
                          {item.SKU && <div className="text-xs text-gray-500 font-mono mt-0.5">{item.SKU}</div>}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-semibold text-gray-900">{item.quantity}</span>
                          <span className="text-xs text-gray-500 ml-1">unds.</span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
