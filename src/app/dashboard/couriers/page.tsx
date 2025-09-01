'use client'

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Eye, Edit, Trash2 } from 'lucide-react';
import DeliveryLoader from '@/components/ui/delivery-loader';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useApi } from '@/hooks/useApi';

interface Courier {
  id: number;
  document_number: string;
  document_type: string;
  email: string;
  first_name: string;
  last_name: string | null;
  license: string;
  brand: string;
  plate_number: string;
  vehicle_type: string;
  status: number;
}

const filterFields = [
  { value: 'first_name', label: 'Nombre' },
  { value: 'last_name', label: 'Apellido' },
  { value: 'email', label: 'Correo electrónico' },
];

export default function CouriersPage() {
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const { get } = useApi<Courier[]>();
  const [field, setField] = useState('first_name');
  const [value, setValue] = useState('');
  const [filtered, setFiltered] = useState<Courier[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalItems = filtered.length;

  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    data: Courier | null;
  }>({ isOpen: false, data: null });

  const fetchCouriers = useCallback(async () => {
    const response = await get('/user?type=couriers');
    if (response) {
      const data = Array.isArray(response) ? response : [];
      setCouriers(data);
      setFiltered(data);
    } else {
      setCouriers([]);
      setFiltered([]);
    }
  }, [get]);

  useEffect(() => {
      setLoading(true); // Mostrar loader al cargar clientes
      fetchCouriers().finally(() => {
        setLoading(false); // Ocultar loader al finalizar
      });
    }, [fetchCouriers]);
  
    const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteCourier = (courier: Courier) => {
    setConfirmModal({ isOpen: true, data: courier });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, data: null });
  };

  const confirmDeleteCourier = () => {
    if (confirmModal.data) {
      console.log(`Deleting courier with ID: ${confirmModal.data.id}`);
      closeConfirmModal();
    }
  };

   const handleFilter = () => {
    const val = value.toLowerCase();
    const newFiltered = couriers.filter((courier) =>
      courier[field as keyof Courier]?.toString().toLowerCase().includes(val)
    );
    setFiltered(newFiltered);
  };

  return (
    <section className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-end gap-2 flex-1">
          <div className="flex flex-col gap-1 w-full md:w-44">
            <label className="text-sm font-medium text-gray-700">Buscar por</label>
            <Select
              value={field}
              onChange={(value: string) => setField(value)}
              options={filterFields}
            />
          </div>

          <div className="flex flex-col gap-1 w-full md:w-64">
            <label className="text-sm font-medium text-gray-700">Valor</label>
            <Input
              placeholder="Valor a buscar..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>

          <div className="pt-[22px]">
            <Button onClick={handleFilter}>Buscar</Button>
          </div>
        </div>

        <div className="pt-[22px] md:pt-0">
          <Button
            //  onClick={() => workerModal.openModal()}
            className="bg-primary text-white"
          >
            Añadir courier
          </Button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-4">
          <DeliveryLoader message="Cargando couriers..." />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No hay couriers disponibles.
        </div>
      )}


      {!loading && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Licencia</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Placa</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Opciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((courier, index) => (
                <TableRow key={courier.id}>
                  <TableCell className="font-medium text-gray-600">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>
                  <TableCell>
                    {courier.first_name} {courier.last_name}
                  </TableCell>
                  <TableCell>{courier.email}</TableCell>
                  <TableCell>
                    {courier.document_type} - {courier.document_number}
                  </TableCell>
                  <TableCell>{courier.license}</TableCell>
                  <TableCell>{courier.brand}</TableCell>
                  <TableCell>{courier.plate_number}</TableCell>
                  <TableCell>{courier.vehicle_type}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-600 hover:text-blue-800 p-2"
                        title="Ver"
                      >
                        <Eye size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-600 hover:text-blue-800 p-2"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-800 p-2"
                        title="Eliminar"
                        onClick={() => handleDeleteCourier(courier)}
                      >
                        <Trash2 size={16} />
                      </Button>
                      <ConfirmModal
                        isOpen={confirmModal.isOpen}
                        onClose={closeConfirmModal}
                        onConfirm={confirmDeleteCourier}
                        title="Confirmar eliminación"
                        message={`¿Estás seguro de que deseas eliminar a ${confirmModal.data?.first_name} ${confirmModal.data?.last_name}?`}
                        confirmText="Eliminar"
                        variant="danger"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {currentItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                    No hay resultados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </section>
  );
}
