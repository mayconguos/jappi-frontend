'use client';

import { Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Select } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import DeliveryLoader from '@/components/ui/delivery-loader';

import UserModal from '@/components/forms/UserModal';
import { getDocumentTypeLabel } from '@/constants/documentTypes';
import { getUserRoleLabel } from '@/constants/userRoles';

import { useUsers, useFilterAndPagination, useModal, type User } from '@/hooks';

const filterBy = [
  { value: 'first_name', label: 'Nombre' },
  { value: 'last_name', label: 'Apellido' },
  { value: 'email', label: 'Correo electrónico' },
];

export default function UsersPage() {
  // Hooks personalizados
  const { users, loading, error, fetchWorkers, handleUserSubmit, deleteWorker } = useUsers();
  const [successModal, setSuccessModal] = useState<string | boolean>(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const filteredUsers = users.filter(user => user.status === 1);

  // Configuración de filtros y paginación
  const [currentPage, setCurrentPage] = useState(1); // Manejar explícitamente el estado de la página actual

  const {
    filterField,
    searchValue,
    totalItems,
    setFilterField,
    setSearchValue,
    handleFilter
  } = useFilterAndPagination<User>({
    data: filteredUsers,
    itemsPerPage: 10,
    filterFields: ['first_name', 'last_name', 'email']
  });

  const currentItems = filteredUsers.slice((currentPage - 1) * 10, currentPage * 10); // Recalcular los datos paginados

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Modales para añadir, editar y confirmar acciones
  const userModal = useModal<User>();
  const confirmModal = useModal<{ id: number; name: string; email: string }>();

  // Handlers para acciones de usuario
  const handleEditUser = (user: User) => {
    userModal.openModal(user);
  };

  const confirmDeleteUser = async () => {
    if (confirmModal.data) {
      const success = await deleteWorker(confirmModal.data.id);
      if (success) {
        confirmModal.closeModal();

        // Verificar si la página actual sigue siendo válida
        const newTotalItems = filteredUsers.length - 1; // Ajustar el total de elementos después de la eliminación
        const newTotalPages = Math.ceil(newTotalItems / 10);
        if (currentPage > newTotalPages) {
          setCurrentPage(1); // Redirigir a la primera página si la página actual no es válida
        }
      }
    }
  };

  const handleDeleteUser = (user: User) => {
    confirmModal.openModal({
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email
    });
  };

  const handleUserModalSubmit = async (user: Omit<User, 'id'>) => {
    try {
      const isEditing = !!userModal.data;
      await handleUserSubmit(user, userModal.data);
      setSuccessModal(isEditing ? 'El usuario ha sido actualizado correctamente.' : 'El usuario ha sido creado correctamente.');
    } catch {
      // Mostrar modal de error en caso de fallo
      setErrorModal('Hubo un error al procesar la solicitud.');
    } finally {
      userModal.closeModal();
    }
  };

  const filteredItems = currentItems.filter(user => user.status === 1);

  return (
    // Sección principal de usuarios internos
    <section className="p-6 space-y-6">
      {/* Filtros y botón para añadir usuario */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-end gap-2 flex-1">
          <div className="flex flex-col gap-1 w-full md:w-44">
            <label className="text-sm font-medium text-gray-700">Filtrar por</label>
            <Select
              value={filterField as string}
              onChange={(value: string) => setFilterField(value as keyof User)}
              options={filterBy}
            />
          </div>

          <div className="flex flex-col gap-1 w-full md:w-64">
            <label className="text-sm font-medium text-gray-700">Valor</label>
            <Input
              placeholder="Valor a buscar..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>

          <div className="pt-[22px]">
            <Button onClick={handleFilter}>Filtrar</Button>
          </div>
        </div>

        <div className="pt-[22px] md:pt-0">
          <Button
            onClick={() => userModal.openModal()}
            className="bg-primary text-white"
          >
            Añadir usuario
          </Button>
        </div>
      </div>

      {/* Indicador de carga */}
      {loading && (
        <div className="text-center py-4">
          <DeliveryLoader message="Cargando usuarios..." />
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="text-center py-4">
          <p className="text-red-500">{error}</p>
          <Button onClick={fetchWorkers} className="mt-2">
            Reintentar
          </Button>
        </div>
      )}

      {/* Tabla de usuarios */}
      {!loading && !error && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Apellido</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Opciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-gray-600">
                    {(currentPage - 1) * 10 + index + 1} {/* Ajustar la numeración de las filas */}
                  </TableCell>
                  <TableCell>{getUserRoleLabel(user.id_role)}</TableCell>
                  <TableCell>{user.first_name}</TableCell>
                  <TableCell>{user.last_name}</TableCell>
                  <TableCell>{getDocumentTypeLabel(user.document_type)} - {user.document_number}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-800 p-2"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteUser(user)}
                        className="text-red-600 hover:text-red-800 p-2"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </Button>
                      <ConfirmModal
                        isOpen={confirmModal.isOpen}
                        onClose={confirmModal.closeModal}
                        onConfirm={confirmDeleteUser}
                        title="Confirmar eliminación"
                        message={`¿Estás seguro de que deseas eliminar a ${confirmModal.data?.name}?`}
                        confirmText="Eliminar"
                        variant="danger"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                    No hay resultados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Paginación */}
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={10}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Modal para añadir o editar usuario */}
      <UserModal
        isOpen={userModal.isOpen}
        onClose={userModal.closeModal}
        onSubmit={handleUserModalSubmit}
        editingUser={userModal.data}
      />

      {/* Modal de confirmación de éxito */}
      {successModal && (
        <ConfirmModal
          isOpen={!!successModal}
          onClose={() => setSuccessModal(false)}
          onConfirm={() => setSuccessModal(false)}
          title="¡Éxito!"
          message={typeof successModal === 'string' ? successModal : 'La operación se completó correctamente.'}
          confirmText="Aceptar"
          variant="info"
        />
      )}

      {/* Modal de error */}
      {errorModal && (
        <ConfirmModal
          isOpen={!!errorModal}
          onClose={() => setErrorModal(null)}
          onConfirm={() => setErrorModal(null)}
          title="Error"
          message={errorModal}
          confirmText="Cerrar"
          variant="danger"
        />
      )}
    </section>
  );
}