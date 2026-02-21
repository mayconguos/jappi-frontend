import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/app/services/api';
import { CatalogProduct } from '@/components/tables/CompanyProductsTable';
import { getRoleNameFromNumber } from '@/utils/roleUtils';

export function useProducts({ autoFetch = true }: { autoFetch?: boolean } = {}) {
  const { user } = useAuth();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!user?.id_role) return;

    setLoading(true);
    setError(null);

    try {
      const roleName = getRoleNameFromNumber(user.id_role);
      const isAdminOrWarehouse = roleName === 'admin' || roleName === 'almacen';

      const endpoint = isAdminOrWarehouse
        ? '/inventory'
        : `/inventory/${user.id_company}`;

      const response = await api.get(endpoint);
      const data = Array.isArray(response.data) ? response.data : (response.data?.kardex || []);

      const mappedProducts: CatalogProduct[] = data.map((p: any) => ({
        id: p.id,
        id_product: p.id_product,
        company_name: p.company_name,
        sku: p.SKU || `PROD-${p.id}`,
        product_name: p.product_name,
        description: p.description,
        quantity: Number(p.quantity || 0),
        status: p.status === 0 ? 'inactive' : 'active',
        last_updated: p.modified_at || new Date().toISOString()
      }));

      setProducts(mappedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Solo auto-fetcha al montar si autoFetch: true.
  // Usar autoFetch: false cuando el componente controla manualmente cuándo fetchear.
  useEffect(() => {
    if (autoFetch) {
      fetchProducts();
    }
  }, [fetchProducts, autoFetch]);

  const addProduct = async (productData: Omit<CatalogProduct, 'id' | 'last_updated'>) => {
    try {
      if (!user?.id) throw new Error('No user ID');

      const payload = {
        SKU: productData.sku,
        product_name: productData.product_name,
        description: productData.description || "",
        id_company: user.id_company // Actualmente usa la compañía del usuario. Si el Admin necesita especificar compañía, esto requiere actualización.
      };

      await api.post('/inventory/product', payload);
      await fetchProducts(); // Refrescar lista
    } catch (err) {
      console.error('Error al crear producto:', err);
      throw err;
    }
  };

  const updateProduct = async (updatedProduct: CatalogProduct) => {
    // Lógica para actualizar (normalmente se requiere una llamada a la API, ¿pero actualmente el Contexto solo actualizaba el estado?)
    // Contexto: setProducts(products.map(...))
    // La aplicación real debería llamar a API PUT. 
    // Suponiendo por ahora que solo refrescamos o tenemos un endpoint.
    // El código previo del contexto solo hacía setState.
    // Mantendré un comportamiento similar a setState pero idealmente llamaríamos a la API.
    // Como no tengo el endpoint PUT, solo actualizaré el estado local para la respuesta de la UI relativo al comportamiento previo.
    // Espera, ¿los productos son ahora locales al hook? 
    // Si actualizo aquí, solo actualiza ESTA instancia del hook si no es un contexto compartido.
    // PERO `fetchProducts` recarga desde el backend.
    // Si no tengo una API para actualizar, el cambio no persistirá.
    // El plan de implementación menciona `Integrar POST /inventory/product`.
    // NO menciona PUT. 
    // Lo dejaré como está por ahora.
    console.warn("API de actualización de producto no integrada aún");
  };

  const deleteProduct = async (id: number) => {
    // Lo mismo para eliminar.
    // Contexto: setProducts(filter).
    // Mimicaré esto pero no persistirá.
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return {
    products,
    loading,
    error,
    refreshProducts: fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct
  };
}
