# Modal Component

Componente modal reutilizable y accesible con múltiples opciones de configuración.

## Características

- **Accesibilidad completa**: Soporte para screen readers, manejo de focus, ARIA attributes
- **Múltiples tamaños**: sm, md, lg, xl, full
- **Control de cierre**: ESC, click fuera, botón X
- **Prevención de scroll**: Bloquea el scroll del body cuando está abierto
- **Animaciones suaves**: Transiciones CSS para apertura/cierre
- **Footer opcional**: Componente ModalFooter para botones de acción
- **Hook personalizado**: useModal para manejo de estado

## Uso Básico

```tsx
import { Modal, ModalFooter, useModal } from '@/components/ui/modal';

function MyComponent() {
  const { isOpen, openModal, closeModal } = useModal();

  return (
    <>
      <button onClick={openModal}>Abrir Modal</button>
      
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        title="Mi Modal"
        description="Descripción del modal"
      >
        <p>Contenido del modal...</p>
        
        <ModalFooter>
          <button onClick={closeModal}>Cancelar</button>
          <button onClick={handleConfirm}>Confirmar</button>
        </ModalFooter>
      </Modal>
    </>
  );
}
```

## Props del Modal

| Prop | Tipo | Descripción | Default |
|------|------|-------------|---------|
| `isOpen` | `boolean` | Si el modal está abierto | - |
| `onClose` | `() => void` | Función para cerrar el modal | - |
| `title` | `string` | Título del modal (opcional) | - |
| `description` | `string` | Descripción (opcional) | - |
| `children` | `React.ReactNode` | Contenido del modal | - |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | Tamaño del modal | `'md'` |
| `closeOnOverlayClick` | `boolean` | Cerrar al hacer click fuera | `true` |
| `closeOnEscape` | `boolean` | Cerrar con tecla ESC | `true` |
| `className` | `string` | Clases CSS adicionales | `''` |
| `showCloseButton` | `boolean` | Mostrar botón X de cerrar | `true` |

## Hook useModal

El hook `useModal` proporciona una forma sencilla de manejar el estado del modal:

```tsx
const {
  isOpen,      // boolean: estado actual del modal
  openModal,   // () => void: función para abrir
  closeModal,  // () => void: función para cerrar
  toggleModal, // () => void: función para alternar
  setIsOpen    // (boolean) => void: setter directo
} = useModal(false); // parámetro opcional: estado inicial
```

## Ejemplos de Uso

### Modal de Confirmación

```tsx
function ConfirmationModal() {
  const { isOpen, openModal, closeModal } = useModal();

  const handleConfirm = () => {
    // Lógica de confirmación
    closeModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="Confirmar Acción"
      description="¿Estás seguro de que quieres continuar?"
      size="sm"
    >
      <p>Esta acción no se puede deshacer.</p>
      
      <ModalFooter>
        <Button variant="outline" onClick={closeModal}>
          Cancelar
        </Button>
        <Button onClick={handleConfirm} className="bg-red-600">
          Confirmar
        </Button>
      </ModalFooter>
    </Modal>
  );
}
```

### Modal de Formulario

```tsx
function FormModal() {
  const { isOpen, openModal, closeModal } = useModal();

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="Nuevo Usuario"
      description="Completa la información del usuario"
      size="lg"
    >
      <form className="space-y-4">
        <Input label="Nombre" />
        <Input label="Email" />
        <Select label="Rol" options={roles} />
      </form>
      
      <ModalFooter>
        <Button variant="outline" onClick={closeModal}>
          Cancelar
        </Button>
        <Button type="submit">
          Guardar Usuario
        </Button>
      </ModalFooter>
    </Modal>
  );
}
```

### Modal de Información

```tsx
function InfoModal() {
  const { isOpen, openModal, closeModal } = useModal();

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="Información del Sistema"
      size="md"
      closeOnOverlayClick={false} // No cerrar al hacer click fuera
    >
      <div className="space-y-4">
        <p>Versión: 1.0.0</p>
        <p>Última actualización: 23/08/2025</p>
        <p>Desarrollado por: Equipo Jappi</p>
      </div>
      
      <ModalFooter>
        <Button onClick={closeModal}>
          Entendido
        </Button>
      </ModalFooter>
    </Modal>
  );
}
```

### Modal Full Screen

```tsx
function FullScreenModal() {
  const { isOpen, openModal, closeModal } = useModal();

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="Editor Avanzado"
      size="full"
      closeOnEscape={false} // No cerrar con ESC
    >
      <div className="h-96">
        {/* Contenido que necesita mucho espacio */}
        <CodeEditor />
      </div>
      
      <ModalFooter>
        <Button variant="outline" onClick={closeModal}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>
          Guardar Cambios
        </Button>
      </ModalFooter>
    </Modal>
  );
}
```

## Accesibilidad

El componente Modal incluye:

- ✅ Atributos ARIA apropiados (`role="dialog"`, `aria-modal`, `aria-labelledby`, `aria-describedby`)
- ✅ Manejo de focus trap (el focus se mantiene dentro del modal)
- ✅ Soporte para screen readers
- ✅ Navegación por teclado (ESC para cerrar)
- ✅ Prevención del scroll del body cuando está abierto

## Tamaños Disponibles

- `sm`: max-w-sm (384px)
- `md`: max-w-md (448px) - **default**
- `lg`: max-w-lg (512px)
- `xl`: max-w-2xl (672px)
- `full`: max-w-7xl (1280px)

## Personalización

Puedes personalizar el modal añadiendo clases CSS adicionales:

```tsx
<Modal
  className="my-custom-modal"
  // ... otras props
>
  {/* contenido */}
</Modal>
```

## Casos de Uso Recomendados

1. **Confirmaciones**: Acciones destructivas o importantes
2. **Formularios**: Creación/edición de elementos
3. **Información**: Mostrar detalles o ayuda
4. **Selección**: Elegir entre opciones
5. **Previsualización**: Mostrar contenido ampliado
6. **Configuración**: Ajustes y preferencias
