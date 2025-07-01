'use client';

import { useEffect, useState } from 'react';

import secureLocalStorage from 'react-secure-storage';

import api from "@/app/services/api";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

interface Client {
  id_client: number;
  correo: string;
  nombre: string;
  telefono: string;
  dni: string;
  direccion: string;
  banco: string;
  cuenta: string;
  titular: string;
}

const filterFields = [
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' },
  { value: 'dni', label: 'DNI' },
  { value: 'phone', label: 'Phone' },
];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [field, setField] = useState('name');
  const [value, setValue] = useState('');
  const [filtered, setFiltered] = useState<Client[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = secureLocalStorage.getItem('token');
        const res = await api.get('/empresa/listarUsuarios', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data?.success && Array.isArray(res.data.data)) {
          setClients(res.data.data);
          setFiltered(res.data.data);
        } else {
          console.error('Respuesta inesperada:', res.data);
        }
      } catch (error) {
        console.error('Error al obtener clientes externos:', error);
      }
    };

    fetchData();
  }, []);

  const handleFilter = () => {
    const val = value.toLowerCase();
    const newFiltered = clients.filter((client: Client) =>
      client[field as keyof Client]?.toString().toLowerCase().includes(val)
    );
    setFiltered(newFiltered);
  };

  return (
    <section className="p-6 space-y-6">
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
          <Button className="bg-primary text-white">Añadir cliente</Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Correo</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>DNI</TableHead>
            <TableHead>Dirección</TableHead>
            <TableHead>Banco</TableHead>
            <TableHead>Titular</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((client) => (
            <TableRow key={client.id_client}>
              <TableCell>{client.nombre}</TableCell>
              <TableCell>{client.correo}</TableCell>
              <TableCell>{client.telefono}</TableCell>
              <TableCell>{client.dni}</TableCell>
              <TableCell>{client.direccion}</TableCell>
              <TableCell>{client.banco}</TableCell>
              <TableCell>{client.titular}</TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                No hay resultados
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </section>
  );
}
