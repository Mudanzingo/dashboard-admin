import { forwardRef, InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, className, ...rest },
  ref
) {
  return (
    <label className="block text-sm">
      {label && <div className="mb-1 text-xs text-zinc-600 dark:text-zinc-300">{label}</div>}
      <input
        ref={ref}
        className={clsx(
          'w-full rounded border px-3 py-2 bg-white dark:bg-zinc-900 outline-none focus:ring-2 ring-zinc-300 dark:ring-zinc-700',
          className
        )}
        {...rest}
      />
    </label>
  );
});
