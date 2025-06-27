'use client';

import { useEffect, useState } from 'react';

import secureLocalStorage from 'react-secure-storage';

import api from "@/app/services/api";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

interface UsuarioExterno {
  id_persona: number;
  correo: string;
  nombre: string;
  telefono: string;
  dni: string;
  direccion: string;
  banco: string;
  cuenta: string;
  titular: string;
}

const camposFiltro = [
  { value: 'nombre', label: 'Nombre' },
  { value: 'correo', label: 'Correo' },
  { value: 'dni', label: 'DNI' },
  { value: 'telefono', label: 'Teléfono' },
];

export default function ListaExternosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioExterno[]>([]);
  const [campo, setCampo] = useState('nombre');
  const [valor, setValor] = useState('');
  const [filtrados, setFiltrados] = useState<UsuarioExterno[]>([]);

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
          setUsuarios(res.data.data);
          setFiltrados(res.data.data);
        } else {
          console.error('Respuesta inesperada:', res.data);
        }
      } catch (error) {
        console.error('Error al obtener usuarios externos:', error);
      }
    };

    fetchData();
  }, []);

  const handleFiltrar = () => {
    const val = valor.toLowerCase();
    const nuevos = usuarios.filter((u) =>
      u[campo as keyof UsuarioExterno]?.toString().toLowerCase().includes(val)
    );
    setFiltrados(nuevos);
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
          <Button className="bg-primary text-white">Añadir usuario</Button>
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
          {filtrados.map((u) => (
            <TableRow key={u.id_persona}>
              <TableCell>{u.nombre}</TableCell>
              <TableCell>{u.correo}</TableCell>
              <TableCell>{u.telefono}</TableCell>
              <TableCell>{u.dni}</TableCell>
              <TableCell>{u.direccion}</TableCell>
              <TableCell>{u.banco}</TableCell>
              <TableCell>{u.titular}</TableCell>
            </TableRow>
          ))}
          {filtrados.length === 0 && (
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
