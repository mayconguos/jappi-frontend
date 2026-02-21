'use client';

import { useState, useEffect } from 'react';
import RequestsFilter from '@/components/filters/RequestsFilter';
import RequestsTable, { InboundRequest } from '@/components/tables/RequestsTable';
import { Pagination } from '@/components/ui/pagination';
import NewRequestModal from '@/components/forms/modals/NewRequestModal';
import RequestDetailModal from '@/components/forms/modals/RequestDetailModal';
import { useAuth } from '@/context/AuthContext';
import api from '@/app/services/api';

export default function WarehouseRequestsPage() {
  const { user } = useAuth();
  const idCompany = user?.id_company;

  const [requests, setRequests] = useState<InboundRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<InboundRequest | null>(null);

  const itemsPerPage = 10;

  // Obtener solicitudes directamente desde la página
  const fetchRequests = async () => {
    if (!idCompany) return;
    try {
      const response = await api.get(`/inventory/supply-request/${idCompany}`);
      const data = Array.isArray(response.data) ? response.data : [];
      const mapped: InboundRequest[] = data.map((r: any) => ({
        id: r.id,
        request_date: new Date(r.created_at).toLocaleDateString(),
        total_skus: 0,
        total_units: 0,
        status: (r.status?.toLowerCase() || 'pending') as any,
        pdf_url: '#',
      }));
      setRequests(mapped);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  // Solo se ejecuta cuando idCompany cambia (primitivo → comparación por valor)
  useEffect(() => {
    fetchRequests();
  }, [idCompany]);

  // Lógica de filtrado
  const filteredRequests = requests.filter(req => {
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesSearch = req.id.toString().includes(searchValue);
    return matchesStatus && matchesSearch;
  });

  // Paginación
  const totalItems = filteredRequests.length;
  const currentItems = filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleNewRequest = () => {
    setIsModalOpen(true);
  };

  const handleCreateRequest = async () => {
    setIsModalOpen(false);
    await fetchRequests();

    setTimeout(() => {
      alert('✅ ¡Solicitud creada exitosamente! \n\nSe ha generado la Guía de Remisión. \nPor favor imprímela y pégala en tu caja.');
    }, 500);
  };

  const handleViewRequest = (request: InboundRequest) => {
    setSelectedRequest(request);
  };

  const handleDownloadGuide = (request: InboundRequest) => {
    console.log('Download Guide', request);
    alert(`Descargando Guía para Orden #${request.id}`);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      <div className="space-y-6">
        <RequestsFilter
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          onNewRequest={handleNewRequest}
          onExport={() => console.log('Exporting...')}
          totalItems={totalItems}
        />

        <RequestsTable
          requests={currentItems}
          onView={handleViewRequest}
          onDownloadGuide={handleDownloadGuide}
        />

        <div className="w-full pt-4">
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <NewRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateRequest}
      />

      <RequestDetailModal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        request={selectedRequest}
      />
    </div>
  );
}
