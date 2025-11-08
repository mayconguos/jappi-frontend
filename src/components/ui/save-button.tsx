import { useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from './button';

interface SaveButtonProps {
  onSave: () => Promise<boolean>;
  className?: string;
}

export function SaveButton({ onSave, className = "" }: SaveButtonProps) {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`flex justify-end pt-6 border-t border-gray-200 mt-6 ${className}`}>
      <Button
        onClick={handleSave}
        disabled={saving}
        size="lg"
      >
        <Save size={16} className="mr-2" />
        {saving ? 'Guardando...' : 'Guardar cambios'}
      </Button>
    </div>
  );
}