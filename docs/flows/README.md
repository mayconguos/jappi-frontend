# Flujos del Sistema Japi Express

Este directorio contiene la documentación visual de los procesos de negocio y flujos técnicos del sistema, representados mediante diagramas **Mermaid**.

## Mapeo Técnico (API Endpoints)

| Proceso | Acción | Endpoint | Componente Principal |
| :--- | :--- | :--- | :--- |
| **Autenticación** | Login | `POST /auth/login` | `LoginForm.tsx` |
| | Registro | `POST /auth/register` | `RegisterForm.tsx` |
| **Empresa** | Registrar Envío | `POST /shipping` | `ShipmentForm.tsx` |
| | Carga Masiva | `POST /shipping/bulk` | `BulkUpload.tsx` |
| | Ver Kardex | `GET /inventory/kardex/:id` | `KardexTable.tsx` |
| **Administración** | Activar Cuenta | `PUT /auth/activate/:id` | `PendingTable.tsx` |
| | Asignar Zona | `PUT /courier-zones/assign` | `ZoneModal.tsx` |
| **Transportista** | Obtener Entregas | `GET /deliveries/carrier/:id` | `CarrierDeliveriesTable.tsx` |
| | Confirmar Entrega | `PUT /deliveries/complete/:id` | `DeliveryDetailModal.tsx` |

## Índice de Diagramas

1.  [Ciclo de Vida del Envío](./shipment_lifecycle.mermaid)
2.  [Operaciones de Inventario](./inventory_ops.mermaid)
3.  [Workflow del Transportista](./carrier_workflow.mermaid)
4.  [Registro y Activación de Cuentas](./auth_activation.mermaid)
5.  [Matriz de Permisos por Rol](./permissions_matrix.mermaid)

---
*Nota: Para visualizar estos archivos correctamente en VS Code, se recomienda la extensión "Mermaid Editor" o verlos directamente en GitHub/GitLab.*
