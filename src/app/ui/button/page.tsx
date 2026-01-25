import { Button } from '@/components/ui/button';

export default function ButtonExamples() {
  return (
    <div className="space-y-8 p-8 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Button Component</h1>
        <p className="text-gray-500">Componente de botón estándar de nuestro sistema de diseño.</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">Variants</h2>
        <div className="flex flex-wrap gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
          <Button variant="primary">Primary (Default)</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">Sizes</h2>
        <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
          <Button size="sm">Small</Button>
          <Button size="md">Medium (Default)</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="Icon only">
            <span role="img" aria-label="star">⭐</span>
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">States</h2>
        <div className="flex flex-wrap gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
          <Button disabled>Disabled Primary</Button>
          <Button variant="secondary" disabled>Disabled Secondary</Button>
          <Button isLoading>Loading</Button>
        </div>
      </section>
    </div>
  );
}
