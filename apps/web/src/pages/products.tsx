import { useState } from 'react';
import { useProducts, useCreateProduct, ProductSchema } from '@/api/products';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';

export default function ProductsPage() {
  const { data, isLoading, error } = useProducts();
  const createProduct = useCreateProduct();
  const [open, setOpen] = useState(false);

  type FormData = z.infer<typeof ProductSchema>;
  const form = useForm<FormData>({
    resolver: zodResolver(ProductSchema.pick({ name: true, price: true })),
    defaultValues: { name: '', price: 0 },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createProduct.mutateAsync(values);
      toast.success('Producto creado');
      setOpen(false);
      form.reset();
    } catch (e: any) {
      toast.error(e.message || 'Error al crear');
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Productos</h2>
        <Button onClick={() => setOpen(true)}>Nuevo</Button>
      </div>

      {isLoading && <div className="text-sm">Cargando...</div>}
      {error && <div className="text-sm text-red-500">{(error as Error).message}</div>}

      <Table>
        <thead>
          <tr>
            <th className="text-left p-2">Nombre</th>
            <th className="text-left p-2">Precio</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="p-2">{p.name}</td>
              <td className="p-2">${p.price}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal open={open} onClose={() => setOpen(false)} title="Nuevo producto">
        <form className="space-y-3" onSubmit={onSubmit}>
          <Input label="Nombre" {...form.register('name')} />
          <Input
            label="Precio"
            type="number"
            step="0.01"
            {...form.register('price', { valueAsNumber: true })}
          />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={createProduct.isPending}>
              Crear
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
