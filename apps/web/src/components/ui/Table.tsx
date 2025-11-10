import { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export function Table({ className, ...rest }: HTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={clsx('w-full text-sm border-collapse', className)}
      {...rest}
    />
  );
}
