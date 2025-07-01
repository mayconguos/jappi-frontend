'use client';

import { useState, useEffect } from 'react';
import { Edit, Trash2 } from 'lucide-react';

import api from '@/app/services/api';

import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Select } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

import UserModal from '@/components/forms/UserModal';
import { getDocumentTypeLabel } from '@/constants/documentTypes';
import { getUserTypeLabel } from '@/constants/userTypes';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  document_type: string;
  document_number: string;
  email: string;
  password: string;
  type: number;
}

const filterBy = [
  { value: 'first_name', label: 'Nombre' },
  { value: 'last_name', label: 'Apellido' },
  { value: 'document_number', label: 'Número de documento' },
  { value: 'email', label: 'Correo electrónico' },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filterField, setFilterField] = useState('first_name');
  const [searchValue, setSearchValue] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      const response = await api.get('/user/list', {
        headers: {
          authorization: `${token}`,
        },
      });

      const data = Array.isArray(response.data) ? response.data : [];
      // Sanitizar los datos para evitar valores null/undefined
      const sanitizedData = data.map((user: User) => ({
        id: user.id || 0,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        document_type: user.document_type || '1',
        document_number: user.document_number || '',
        email: user.email || '',
        password: user.password || '',
        type: user.type || 2,
      }));
      setUsers(sanitizedData);
    } catch (err) {
      setError('Error al cargar los users');
      console.error('Error fetching users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltrar = () => {
    const val = searchValue.toLocaleLowerCase();
    const matchingUsers = users.filter((user) =>
      user[filterField as keyof User]?.toString().toLocaleLowerCase().includes(val)
    );
    setFilteredUsers(matchingUsers);
    setCurrentPage(1); // Resetear a la primera página al filtrar
  };

  const handleAddUser = (newUser: Omit<User, 'id'>) => {
    if (editingUser) {
      // Actualizar usuario existente
      const userUpdated = {
        ...editingUser,
        ...newUser,
        id: editingUser.id
      };
      setUsers(prev =>
        prev.map(user => user.id === editingUser.id ? userUpdated : user)
      );
      setFilteredUsers(prev =>
        prev.map(user => user.id === editingUser.id ? userUpdated : user)
      );
    } else {
      // Crear nuevo usuario
      const userWithId = {
        ...newUser,
        id: users.length + 1, // Temporal, en producción sería generado por la API
      };
      setUsers(prev => [...prev, userWithId]);
      setFilteredUsers(prev => [...prev, userWithId]);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (id: number) => {
    setUserToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      try {
        const token = localStorage.getItem('token');

        // Desactivar usuario en lugar de eliminarlo
        await api.put(`/user/update/${userToDelete}`, {
          active: false
        }, {
          headers: {
            authorization: `${token}`,
          },
        });

        // Remover de la lista local después de desactivar exitosamente
        setUsers(prev => prev.filter(user => user.id !== userToDelete));
        setFilteredUsers(prev => prev.filter(user => user.id !== userToDelete));
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Error al eliminar el usuario');
      } finally {
        setUserToDelete(null);
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleConfirmModalClose = () => {
    setIsConfirmModalOpen(false);
    setUserToDelete(null);
  };

  // Inicializar la lista filtrada cuando cambian los users
  useEffect(() => {
    setFilteredUsers(users);
    setCurrentPage(1); // Resetear a la primera página al cambiar los users
  }, [users]);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Calcular la paginación
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredUsers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <section className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-end gap-2 flex-1">
          <div className="flex flex-col gap-1 w-full md:w-44">
            <label className="text-sm font-medium text-gray-700">Filtrar por</label>
            <Select
              value={filterField}
              onChange={(value: string) => setFilterField(value)}
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
            <Button onClick={handleFiltrar}>Filtrar</Button>
          </div>
        </div>

        <div className="pt-[22px] md:pt-0">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white"
          >
            Añadir usuario
          </Button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-4">
          <p className="text-gray-500">Cargando users...</p>
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
                  <TableCell>{getUserTypeLabel(user.type)}</TableCell>
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
                        onClick={() => handleDeleteUser(user.id)}
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
            totalItems={filteredUsers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <UserModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleAddUser}
        editingUser={editingUser}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={handleConfirmModalClose}
        onConfirm={confirmDeleteUser}
        title="Eliminar usuario"
        message="¿Confirma que desea eliminar este usuario?"
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
        context={{
          name: userToDelete ?
            users.find(user => user.id === userToDelete)?.first_name + ' ' +
            users.find(user => user.id === userToDelete)?.last_name : undefined,
          email: userToDelete ?
            users.find(user => user.id === userToDelete)?.email : undefined
        }}
      />
    </section>
  );
}