# SelectionCard Component

Componente reutilizable para crear cards de selección con diferentes opciones visuales y funcionalidades.

## Características

- **Múltiples colores de tema**: blue, green, purple, red, yellow, indigo
- **Estados interactivos**: hover, selected, disabled
- **Iconos personalizables**: SVG, componentes de iconos, etc.
- **Animaciones suaves**: transiciones y efectos hover
- **Responsive**: Se adapta a diferentes tamaños de pantalla
- **Accesible**: Manejo de estados y focus

## Uso Básico

```tsx
import { SelectionCard, SelectionCardGroup } from '@/components/ui/selection-card';

// Card individual
<SelectionCard
  id="option1"
  title="Opción 1"
  description="Descripción de la opción"
  color="blue"
  icon={<YourIcon />}
  onClick={(id) => handleSelection(id)}
  isSelected={selectedOption === 'option1'}
/>

// Grupo de cards
<SelectionCardGroup
  title="Selecciona una opción"
  description="Elige la opción que mejor se adapte a tus necesidades"
  columns={2}
>
  <SelectionCard {...props1} />
  <SelectionCard {...props2} />
</SelectionCardGroup>
```

## Props

### SelectionCard

| Prop | Tipo | Descripción | Default |
|------|------|-------------|---------|
| `id` | `string` | Identificador único para la card | - |
| `title` | `string` | Título principal de la card | - |
| `description` | `string` | Descripción o subtítulo | - |
| `icon` | `React.ReactNode` | Elemento de icono | - |
| `color` | `'blue' \| 'green' \| 'purple' \| 'red' \| 'yellow' \| 'indigo'` | Color del tema | `'blue'` |
| `isSelected` | `boolean` | Si la card está seleccionada | `false` |
| `disabled` | `boolean` | Si la card está deshabilitada | `false` |
| `onClick` | `(id: string) => void` | Función al hacer click | - |
| `className` | `string` | Clases CSS adicionales | `''` |

### SelectionCardGroup

| Prop | Tipo | Descripción | Default |
|------|------|-------------|---------|
| `title` | `string` | Título del grupo (opcional) | - |
| `description` | `string` | Descripción del grupo (opcional) | - |
| `children` | `React.ReactNode` | Cards a mostrar | - |
| `columns` | `1 \| 2 \| 3 \| 4` | Número de columnas en el grid | `2` |
| `className` | `string` | Clases CSS adicionales | `''` |

## Ejemplos de Uso

### Métodos de Pago (Como en RegisterForm)

```tsx
<SelectionCardGroup
  title="Método de Pago"
  description="Selecciona tu método de pago preferido"
  columns={2}
>
  <SelectionCard
    id="bank"
    title="Cuenta Bancaria"
    description="Registra una cuenta bancaria"
    color="blue"
    icon={<CreditCardIcon />}
    onClick={handlePaymentMethod}
  />
  
  <SelectionCard
    id="app"
    title="App de Pagos"
    description="Usa YAPE, PLIN, etc."
    color="green"
    icon={<PhoneIcon />}
    onClick={handlePaymentMethod}
  />
</SelectionCardGroup>
```

### Tipos de Plan/Suscripción

```tsx
<SelectionCardGroup
  title="Elige tu Plan"
  description="Selecciona el plan que mejor se adapte a tu negocio"
  columns={3}
>
  <SelectionCard
    id="basic"
    title="Plan Básico"
    description="Perfecto para emprendedores"
    color="blue"
    icon={<StarIcon />}
    onClick={handlePlanSelection}
  />
  
  <SelectionCard
    id="premium"
    title="Plan Premium"
    description="Para empresas en crecimiento"
    color="purple"
    icon={<CrownIcon />}
    onClick={handlePlanSelection}
  />
  
  <SelectionCard
    id="enterprise"
    title="Plan Empresarial"
    description="Solución completa para grandes empresas"
    color="yellow"
    icon={<BuildingIcon />}
    onClick={handlePlanSelection}
  />
</SelectionCardGroup>
```

### Tipos de Usuario

```tsx
<SelectionCardGroup
  title="¿Quién eres?"
  description="Esto nos ayudará a personalizar tu experiencia"
  columns={2}
>
  <SelectionCard
    id="individual"
    title="Persona Natural"
    description="Soy un emprendedor individual"
    color="green"
    icon={<UserIcon />}
    isSelected={userType === 'individual'}
    onClick={handleUserType}
  />
  
  <SelectionCard
    id="company"
    title="Empresa"
    description="Represento una empresa"
    color="indigo"
    icon={<BuildingIcon />}
    isSelected={userType === 'company'}
    onClick={handleUserType}
  />
</SelectionCardGroup>
```

### Card Deshabilitada

```tsx
<SelectionCard
  id="coming-soon"
  title="Próximamente"
  description="Esta opción estará disponible pronto"
  color="red"
  icon={<ClockIcon />}
  disabled={true}
  onClick={handleSelection}
/>
```

## Ventajas de la Componentización

1. **Reutilización**: Fácil de usar en diferentes partes de la aplicación
2. **Consistencia**: Mantiene el mismo estilo en toda la app
3. **Mantenibilidad**: Cambios centralizados afectan todos los usos
4. **Flexibilidad**: Múltiples opciones de personalización
5. **Accesibilidad**: Estados y animaciones manejados consistentemente
6. **Tipado**: TypeScript garantiza el uso correcto del componente

## Patrones de Colores

- `blue`: Para opciones principales, bancarias, profesionales
- `green`: Para pagos, apps, confirmaciones, éxito
- `purple`: Para premium, características especiales
- `red`: Para eliminar, cancelar, advertencias
- `yellow`: Para destacar, planes enterprise
- `indigo`: Para tecnología, corporativo
