'use client';

import { useEffect, useState, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Edit, Eye, Trash2 } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import DeliveryLoader from '@/components/ui/delivery-loader';

interface Client {
  id: number;
  first_name: string;
  last_name: string | null;
  email: string;
  document_type: string;
  document_number: string;
  status: number;
}

const filterFields = [
  { value: 'first_name', label: 'Nombre' },
  { value: 'last_name', label: 'Apellido' },
  { value: 'email', label: 'Correo electrónico' },
];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const { get } = useApi<Client[]>();
  const [field, setField] = useState('first_name');
  const [value, setValue] = useState('');
  const [filtered, setFiltered] = useState<Client[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalItems = filtered.length;

  const [loading, setLoading] = useState(false); // Estado para el loader
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    data: Client | null;
  }>(
    { isOpen: false, data: null }
  );

  const fetchClients = useCallback(async () => {
    const response = await get('/user?type=companies');
    if (response) {
      const data = Array.isArray(response) ? response : [];
      setClients(data);
      setFiltered(data);
    } else {
      setClients([]);
      setFiltered([]);
    }
  }, [get]);

  useEffect(() => {
    setLoading(true); // Mostrar loader al cargar clientes
    fetchClients().finally(() => {
      setLoading(false); // Ocultar loader al finalizar
    });
  }, [fetchClients]);

  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteUser = (client: Client) => {
    setConfirmModal({ isOpen: true, data: client });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, data: null });
  };

  const confirmDeleteUser = () => {
    if (confirmModal.data) {
      console.log(`Deleting user with ID: ${confirmModal.data.id}`);
      closeConfirmModal();
    }
  };

  const handleFilter = () => {
    const val = value.toLowerCase();
    const newFiltered = clients.filter((client) =>
      client[field as keyof Client]?.toString().toLowerCase().includes(val)
    );
    setFiltered(newFiltered);
  };

  return (
    // Sección principal de clientes
    <section className="p-6 space-y-6">
      {/* Filtros y botón para añadir usuario */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-end gap-2 flex-1">
          <div className="flex flex-col gap-1 w-full md:w-44">
            <label className="text-sm font-medium text-gray-700">Filtrar por</label>
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
            <Button onClick={handleFilter}>Filtrar</Button>
          </div>
        </div>

        <div className="pt-[22px] md:pt-0">
          <Button
            //  onClick={() => userModal.openModal()}
            className="bg-primary text-white"
          >
            Añadir cliente
          </Button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-4">
          <DeliveryLoader message="Cargando clientes..." />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No hay clientes disponibles.
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
                <TableHead>Opciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((clients, index) => (
                <TableRow key={clients.id}>
                  <TableCell className="font-medium text-gray-600">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>
                  <TableCell>{clients.first_name} {clients.last_name}</TableCell>
                  <TableCell>{clients.email}</TableCell>
                  <TableCell>{clients.document_number}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-600 hover:text-blue-800 p-2"
                        title="Editar"
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
                        onClick={() => handleDeleteUser(clients)}
                      >
                        <Trash2 size={16} />
                      </Button>
                      <ConfirmModal
                        isOpen={confirmModal.isOpen}
                        onClose={closeConfirmModal}
                        onConfirm={confirmDeleteUser}
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

          {/* Pagination Component */}
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
