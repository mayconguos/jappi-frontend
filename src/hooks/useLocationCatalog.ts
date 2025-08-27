import api from '@/app/services/api';
import { useState, useEffect } from 'react';

export interface Sector {
  id_sector: number;
  sector_name: string;
}

export interface District {
  id_district: number;
  district_name: string;
  sectors: Sector[];
}

export interface Region {
  id_region: number;
  region_name: string;
  districts: District[];
}

export type LocationCatalog = Region[];

export function useLocationCatalog() {
  const [catalog, setCatalog] = useState<LocationCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        setError(null);

        // Clave para localStorage
        const CATALOG_STORAGE_KEY = 'location_catalog';
        const CATALOG_TIMESTAMP_KEY = 'location_catalog_timestamp';
        const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
        
        // Verificar si existe caché en localStorage
        const cachedCatalog = localStorage.getItem(CATALOG_STORAGE_KEY);
        const cachedTimestamp = localStorage.getItem(CATALOG_TIMESTAMP_KEY);
        
        if (cachedCatalog && cachedTimestamp) {
          const timestampNumber = parseInt(cachedTimestamp);
          const now = Date.now();
          
          // Verificar si el caché no ha expirado
          if (now - timestampNumber < CACHE_DURATION) {
            const parsedCatalog = JSON.parse(cachedCatalog);
            setCatalog(parsedCatalog);
            setLoading(false);
            return;
          } else {
            // Limpiar caché expirado
            localStorage.removeItem(CATALOG_STORAGE_KEY);
            localStorage.removeItem(CATALOG_TIMESTAMP_KEY);
          }
        }
        
        // Hacer llamada a la API
        const response = await api.get('/catalog/locations');

        // Guardar en localStorage
        localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(response.data));
        localStorage.setItem(CATALOG_TIMESTAMP_KEY, Date.now().toString());
        
        setCatalog(response.data);
      } catch (err) {
        console.error('❌ Error al cargar catálogo:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar el catálogo');
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  const getDistrictsByRegion = (regionId: number): District[] => {
    if (!catalog) return [];
    const region = catalog.find(r => r.id_region === regionId);
    return region?.districts || [];
  };

  const getRegionOptions = () => {
    if (!catalog) return [];
    return catalog.map(region => ({
      label: region.region_name,
      value: region.id_region.toString()
    }));
  };

  const getDistrictOptions = (regionId: number) => {
    const districts = getDistrictsByRegion(regionId);
    return districts.map(district => ({
      label: district.district_name,
      value: district.id_district.toString()
    }));
  };

  const getSectorsByDistrict = (districtId: number): Sector[] => {
    if (!catalog) return [];
    for (const region of catalog) {
      const district = region.districts.find(d => d.id_district === districtId);
      if (district) {
        return district.sectors;
      }
    }
    return [];
  };

  const getSectorOptions = (districtId: number) => {
    const sectors = getSectorsByDistrict(districtId);
    return sectors.map(sector => ({
      label: sector.sector_name,
      value: sector.id_sector.toString()
    }));
  };

  // Función para limpiar el caché manualmente
  const clearCatalogCache = () => {
    localStorage.removeItem('location_catalog');
    localStorage.removeItem('location_catalog_timestamp');
  };

  // Función para verificar si hay caché disponible
  const hasCachedData = () => {
    const cachedCatalog = localStorage.getItem('location_catalog');
    const cachedTimestamp = localStorage.getItem('location_catalog_timestamp');
    
    if (!cachedCatalog || !cachedTimestamp) return false;
    
    const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas
    const timestampNumber = parseInt(cachedTimestamp);
    const now = Date.now();
    
    return (now - timestampNumber) < CACHE_DURATION;
  };

  // Función para forzar actualización del caché
  const refreshCatalog = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Limpiar caché existente
      clearCatalogCache();
      
      const response = await api.get('/catalog/locations');

      // Guardar en localStorage
      localStorage.setItem('location_catalog', JSON.stringify(response.data));
      localStorage.setItem('location_catalog_timestamp', Date.now().toString());
      
      setCatalog(response.data);
    } catch (err) {
      console.error('❌ Error al actualizar catálogo:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar el catálogo');
    } finally {
      setLoading(false);
    }
  };

  return {
    catalog,
    loading,
    error,
    getDistrictsByRegion,
    getRegionOptions,
    getDistrictOptions,
    getSectorsByDistrict,
    getSectorOptions,
    clearCatalogCache,
    hasCachedData,
    refreshCatalog
  };
}
