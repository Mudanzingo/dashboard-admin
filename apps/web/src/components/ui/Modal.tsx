import { ReactNode } from 'react';
import { clsx } from 'clsx';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded bg-white dark:bg-zinc-800 border shadow">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-sm font-semibold">{title}</h3>
          <Button variant="secondary" onClick={onClose} className="text-xs px-2 py-1">Cerrar</Button>
        </div>
        <div className="p-4 text-sm space-y-4">{children}</div>
      </div>
    </div>
  );
}
