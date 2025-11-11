import { useState } from 'react';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, ProductSchema, Product } from '@/api/products';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';

export default function ProductsPage() {
  const { data = [], isLoading, error } = useProducts();
  const createMut = useCreateProduct();
  const updateMut = useUpdateProduct();
  const deleteMut = useDeleteProduct();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  type FormValues = Omit<Product, 'id'>;
  const form = useForm<FormValues>({
    resolver: zodResolver(ProductSchema.omit({ id: true })),
    defaultValues: {
      name: '',
      image: '',
      description: '',
      quantity: 0,
      price: 0,
    },
  });

  function openCreate() {
    setEditing(null);
    form.reset({ name: '', image: '', description: '', quantity: 0, price: 0 });
    setOpen(true);
  }
  function openEdit(item: Product) {
    setEditing(item);
    form.reset({
      name: item.name,
      image: item.image || '',
      description: item.description || '',
      quantity: item.quantity,
      price: item.price,
    });
    setOpen(true);
  }

  const onSubmit = form.handleSubmit(async (values) => {
    if (editing) {
      await updateMut.mutateAsync({ ...editing, ...values });
    } else {
      await createMut.mutateAsync(values);
    }
    setOpen(false);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Productos</h2>
        <Button onClick={openCreate}>Nuevo</Button>
      </div>

      {isLoading && <div className="text-sm">Cargando...</div>}
      {error && <div className="text-sm text-red-500">{(error as Error).message}</div>}

      <Table>
        <thead>
          <tr>
            <th className="text-left p-2">ID</th>
            <th className="text-left p-2">Nombre</th>
            <th className="text-left p-2">Imagen</th>
            <th className="text-left p-2">Descripción</th>
            <th className="text-left p-2">Cantidad</th>
            <th className="text-left p-2">Precio</th>
            <th className="text-left p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="p-2 text-xs text-zinc-500">{p.id}</td>
              <td className="p-2 font-medium">{p.name}</td>
              <td className="p-2">{p.image ? <img src={p.image} alt={p.name} className="h-10 w-10 object-cover rounded border" /> : <span className="text-xs text-zinc-400">—</span>}</td>
              <td className="p-2 text-xs max-w-xs truncate" title={p.description}>{p.description || <span className="text-zinc-400">(sin descripción)</span>}</td>
              <td className="p-2">{p.quantity}</td>
              <td className="p-2">${p.price}</td>
              <td className="p-2 flex gap-2">
                <Button variant="secondary" className="text-xs px-2 py-1" onClick={() => openEdit(p)}>Editar</Button>
                <Button variant="secondary" className="text-xs px-2 py-1" onClick={() => { if (p.id && confirm('¿Eliminar producto?')) deleteMut.mutate(p.id); }}>Eliminar</Button>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={6} className="p-4 text-center text-sm text-zinc-500">Sin productos.</td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar producto' : 'Nuevo producto'}>
        <form className="space-y-3" onSubmit={onSubmit}>
          <Input label="Nombre" {...form.register('name')} />
          <Input label="Imagen (URL)" placeholder="https://..." {...form.register('image')} />
          <Input label="Descripción" {...form.register('description')} />
          <Input label="Cantidad" type="number" {...form.register('quantity', { valueAsNumber: true })} />
          <Input label="Precio" type="number" step="0.01" {...form.register('price', { valueAsNumber: true })} />
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={createMut.isPending || updateMut.isPending}>{editing ? 'Guardar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
