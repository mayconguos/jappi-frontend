'use client';

import { useState } from 'react';
import RequestsFilter from '@/components/filters/RequestsFilter';
import RequestsTable, { InboundRequest } from '@/components/tables/RequestsTable';
import { Pagination } from '@/components/ui/pagination';
import NewRequestModal from '@/components/forms/modals/NewRequestModal';
import RequestDetailModal from '@/components/forms/modals/RequestDetailModal';
import { useInventory } from '@/context/InventoryContext';

export default function WarehouseRequestsPage() {
  // Use Global Context
  const { requests, refreshInventory } = useInventory();

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<InboundRequest | null>(null);

  const itemsPerPage = 10;

  // Filter Logic
  const filteredRequests = requests.filter(req => {
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesSearch = req.id.toString().includes(searchValue);
    return matchesStatus && matchesSearch;
  });

  // Pagination Logic
  const totalItems = filteredRequests.length;
  // const totalPages = Math.ceil(totalItems / itemsPerPage); // Not needed for Pagination component
  const currentItems = filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleNewRequest = () => {
    setIsModalOpen(true);
  };

  const handleCreateRequest = async () => {
    setIsModalOpen(false);
    await refreshInventory();

    // Simulate Guide Generation (Optional: Remove if not needed anymore)
    setTimeout(() => {
      // Ideally we would get the new ID here, but since we refresh list, functionality is correct.
      // We can remove the specific ID alert or fetch the latest one.
      // For now, removing specific ID from alert to avoid confusion or fetching latest.
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
