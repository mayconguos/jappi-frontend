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

import AdministradorModal from '@/components/forms/AdministradorModal';
import { getDocumentTypeLabel } from '@/constants/documentTypes';
import { getUserTypeLabel } from '@/constants/userTypes';

interface Administrador {
  id: number;
  first_name: string;
  last_name: string;
  document_type: string;
  document_number: string;
  email: string;
  password: string;
  type: number;
}

const camposFiltro = [
  { value: 'first_name', label: 'Nombre' },
  { value: 'last_name', label: 'Apellido' },
  { value: 'document_number', label: 'Número de documento' },
  { value: 'email', label: 'Correo electrónico' },
];

export default function AdministradoresPage() {
  const [administradores, setAdministradores] = useState<Administrador[]>([]);
  const [campo, setCampo] = useState('first_name');
  const [valor, setValor] = useState('');
  const [filtrados, setFiltrados] = useState<Administrador[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdministrador, setEditingAdministrador] = useState<Administrador | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [administradorToDelete, setAdministradorToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchAdministradores = async () => {
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
      const sanitizedData = data.map((admin: Administrador) => ({
        id: admin.id || 0,
        first_name: admin.first_name || '',
        last_name: admin.last_name || '',
        document_type: admin.document_type || '1',
        document_number: admin.document_number || '',
        email: admin.email || '',
        password: admin.password || '',
        type: admin.type || 2,
      }));
      setAdministradores(sanitizedData);
    } catch (err) {
      setError('Error al cargar los administradores');
      console.error('Error fetching administrators:', err);
      setAdministradores([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltrar = () => {
    const val = valor.toLocaleLowerCase();
    const nuevos = administradores.filter((admin) =>
      admin[campo as keyof Administrador]?.toString().toLocaleLowerCase().includes(val)
    );
    setFiltrados(nuevos);
    setCurrentPage(1); // Resetear a la primera página al filtrar
  };

  const handleAddAdministrador = (nuevoAdministrador: Omit<Administrador, 'id'>) => {
    if (editingAdministrador) {
      // Actualizar administrador existente
      const administradorActualizado = {
        ...editingAdministrador,
        ...nuevoAdministrador,
        id: editingAdministrador.id
      };
      setAdministradores(prev =>
        prev.map(admin => admin.id === editingAdministrador.id ? administradorActualizado : admin)
      );
      setFiltrados(prev =>
        prev.map(admin => admin.id === editingAdministrador.id ? administradorActualizado : admin)
      );
    } else {
      // Crear nuevo administrador
      const administradorConId = {
        ...nuevoAdministrador,
        id: administradores.length + 1, // Temporal, en producción sería generado por la API
      };
      setAdministradores(prev => [...prev, administradorConId]);
      setFiltrados(prev => [...prev, administradorConId]);
    }
  };

  const handleEditAdministrador = (administrador: Administrador) => {
    setEditingAdministrador(administrador);
    setIsModalOpen(true);
  };

  const handleDeleteAdministrador = async (id: number) => {
    setAdministradorToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteAdministrador = async () => {
    if (administradorToDelete) {
      try {
        const token = localStorage.getItem('token');

        // Desactivar administrador en lugar de eliminarlo
        await api.put(`/user/update/${administradorToDelete}`, {
          active: false
        }, {
          headers: {
            authorization: `${token}`,
          },
        });

        // Remover de la lista local después de desactivar exitosamente
        setAdministradores(prev => prev.filter(admin => admin.id !== administradorToDelete));
        setFiltrados(prev => prev.filter(admin => admin.id !== administradorToDelete));
      } catch (err) {
        console.error('Error deleting administrator:', err);
        setError('Error al eliminar el administrador');
      } finally {
        setAdministradorToDelete(null);
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingAdministrador(null);
  };

  const handleConfirmModalClose = () => {
    setIsConfirmModalOpen(false);
    setAdministradorToDelete(null);
  };

  // Inicializar la lista filtrada cuando cambian los administradores
  useEffect(() => {
    setFiltrados(administradores);
    setCurrentPage(1); // Resetear a la primera página al cambiar los administradores
  }, [administradores]);

  useEffect(() => {
    fetchAdministradores();
  }, []);

  // Calcular la paginación
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filtrados.slice(startIndex, endIndex);

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
              value={campo}
              onChange={(value: string) => setCampo(value)}
              options={camposFiltro}
            />
          </div>

          <div className="flex flex-col gap-1 w-full md:w-64">
            <label className="text-sm font-medium text-gray-700">Valor</label>
            <Input
              placeholder="Valor a buscar..."
              value={valor}
              onChange={(e) => setValor(e.target.value)}
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
            Añadir administrador
          </Button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-4">
          <p className="text-gray-500">Cargando administradores...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-4">
          <p className="text-red-500">{error}</p>
          <Button onClick={fetchAdministradores} className="mt-2">
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
              {currentItems.map((admin, index) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium text-gray-600">
                    {startIndex + index + 1}
                  </TableCell>
                  <TableCell>{getUserTypeLabel(admin.type)}</TableCell>
                  <TableCell>{admin.first_name}</TableCell>
                  <TableCell>{admin.last_name}</TableCell>
                  <TableCell>{getDocumentTypeLabel(admin.document_type)} - {admin.document_number}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditAdministrador(admin)}
                        className="text-blue-600 hover:text-blue-800 p-2"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteAdministrador(admin.id)}
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
            totalItems={filtrados.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <AdministradorModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleAddAdministrador}
        editingAdministrador={editingAdministrador}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={handleConfirmModalClose}
        onConfirm={confirmDeleteAdministrador}
        title="Eliminar administrador"
        message="¿Confirma que desea eliminar este administrador?"
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
        context={{
          name: administradorToDelete ?
            administradores.find(admin => admin.id === administradorToDelete)?.first_name + ' ' +
            administradores.find(admin => admin.id === administradorToDelete)?.last_name : undefined,
          email: administradorToDelete ?
            administradores.find(admin => admin.id === administradorToDelete)?.email : undefined
        }}
      />
    </section>
  );
}