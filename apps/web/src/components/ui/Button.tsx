import { ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

export function Button({ variant = 'primary', loading = false, className, children, ...rest }: ButtonProps) {
  return (
    <button
      className={clsx(
        'px-3 py-1.5 rounded text-sm font-medium border transition disabled:opacity-50',
        variant === 'primary' && 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900',
        variant === 'secondary' && 'bg-transparent',
        className
      )}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading ? '...' : children}
    </button>
  );
}
