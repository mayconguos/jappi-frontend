import { Button } from '@/components/ui/button';

export default function ButtonExamples() {
  return (
    <div className="space-y-4 p-6">
      <h1 className="text-xl font-bold mb-4">Ejemplos de UI Button</h1>
      <div className="flex flex-wrap gap-4">
        <Button>Default</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="warning">Warning</Button>
        <Button variant="info">Info</Button>
      </div>
      <div className="flex flex-wrap gap-4 mt-6">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
        <Button size="icon" aria-label="icon button">
          <span role="img" aria-label="star">⭐</span>
        </Button>
      </div>
      <div className="flex flex-wrap gap-4 mt-6">
        <Button disabled>Disabled</Button>
        <Button variant="outline" disabled>Outline Disabled</Button>
      </div>
    </div>
  );
}
