'use client';

import { Edit, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Select } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

import UserModal from '@/components/forms/UserModal';
import { getDocumentTypeLabel } from '@/constants/documentTypes';
import { getUserRoleLabel } from '@/constants/userRoles';

import { useUsers, useFilterAndPagination, useModal, type User } from '@/hooks';

const filterBy = [
  { value: 'first_name', label: 'Nombre' },
  { value: 'last_name', label: 'Apellido' },
  { value: 'document_number', label: 'Número de documento' },
  { value: 'email', label: 'Correo electrónico' },
];

export default function UsersPage() {
  // Hooks personalizados
  const { users, loading, error, fetchUsers, deleteUser, handleUserSubmit } = useUsers();

  const {
    filterField,
    searchValue,
    currentPage,
    paginatedData: currentItems,
    totalItems,
    startIndex,
    setFilterField,
    setSearchValue,
    handleFilter,
    handlePageChange
  } = useFilterAndPagination<User>({
    data: users,
    itemsPerPage: 10,
    filterFields: ['first_name', 'last_name', 'document_number', 'email']
  });

  // Modales
  const userModal = useModal<User>();
  const confirmModal = useModal<{ id: number; name: string; email: string }>();

  // Handlers
  const handleEditUser = (user: User) => {
    userModal.openModal(user);
  };

  const handleDeleteUser = (user: User) => {
    confirmModal.openModal({
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email
    });
  };

  const confirmDeleteUser = async () => {
    if (confirmModal.data) {
      const success = await deleteUser(confirmModal.data.id);
      if (success) {
        confirmModal.closeModal();
      }
    }
  };

  const handleUserModalSubmit = (user: Omit<User, 'id'>) => {
    handleUserSubmit(user, userModal.data);
    userModal.closeModal();
  };

  return (
    <section className="p-6 space-y-6">
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

      {loading && (
        <div className="text-center py-4">
          <p className="text-gray-500">Cargando usuarios...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-4">
          <p className="text-red-500">{error}</p>
          <Button onClick={fetchUsers} className="mt-2">
            Reintentar
          </Button>
        </div>
      )}

      {!loading && !error && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Apellido</TableHead>
                <TableHead>Nro. documento</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Opciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-gray-600">
                    {startIndex + index + 1}
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
            itemsPerPage={10}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <UserModal
        isOpen={userModal.isOpen}
        onClose={userModal.closeModal}
        onSubmit={handleUserModalSubmit}
        editingUser={userModal.data}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.closeModal}
        onConfirm={confirmDeleteUser}
        title="Eliminar usuario"
        message="¿Confirma que desea eliminar este usuario?"
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
        context={{
          name: confirmModal.data?.name,
          email: confirmModal.data?.email
        }}
      />
    </section>
  );
}