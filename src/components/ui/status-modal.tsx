'use client';

import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Info,
  LucideIcon 
} from 'lucide-react';
import { Modal } from './modal';
import { Button } from './button';

export type StatusType = 'success' | 'error' | 'warning' | 'info';

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: StatusType;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

const statusConfig: Record<StatusType, { 
  icon: LucideIcon; 
  color: string; 
  bgColor: string; 
  ringColor: string;
  buttonVariant: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'link';
}> = {
  success: {
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    ringColor: 'ring-emerald-50/50',
    buttonVariant: 'primary',
  },
  error: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    ringColor: 'ring-red-50/50',
    buttonVariant: 'destructive',
  },
  warning: {
    icon: AlertCircle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    ringColor: 'ring-amber-50/50',
    buttonVariant: 'primary',
  },
  info: {
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    ringColor: 'ring-blue-50/50',
    buttonVariant: 'primary',
  }
};

export function StatusModal({
  isOpen,
  onClose,
  type = 'info',
  title,
  message,
  actionLabel = 'Entendido',
  onAction
}: StatusModalProps) {
  const config = statusConfig[type];
  const Icon = config.icon;

  const handleAction = () => {
    if (onAction) {
      onAction();
    }
    onClose();
  };

  const footer = (
    <Button
      variant={config.buttonVariant}
      className={`w-full sm:w-auto min-w-[120px] rounded-xl font-semibold shadow-lg shadow-${config.color.split('-')[1]}-500/10`}
      onClick={handleAction}
    >
      {actionLabel}
    </Button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={true}
      size="sm"
      footer={footer}
    >
      <div className="flex flex-col items-center text-center py-4 px-2">
        {/* Animated Icon Container */}
        <div className={`w-20 h-20 ${config.bgColor} rounded-full flex items-center justify-center mb-6 ring-8 ${config.ringColor} animate-in zoom-in-50 duration-500`}>
          <Icon className={`w-10 h-10 ${config.color}`} strokeWidth={2} />
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
          {title}
        </h3>

        <p className="text-gray-500 text-base leading-relaxed max-w-[280px]">
          {message}
        </p>
      </div>
    </Modal>
  );
}

export default StatusModal;
