import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import { Seller, SellerSchema, useCreateSeller, useDeleteSeller, useSellers, useUpdateSeller } from '@/api/sellers';

type FormValues = Omit<Seller, 'id'>;

export default function SellersPage() {
  const { data = [], isLoading } = useSellers();
  const createMut = useCreateSeller();
  const updateMut = useUpdateSeller();
  const deleteMut = useDeleteSeller();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Seller | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(SellerSchema.omit({ id: true })),
    defaultValues: { name: '', phone: '', email: '' },
  });

  function openCreate() {
    setEditing(null);
    reset({ name: '', phone: '', email: '' });
    setOpen(true);
  }
  function openEdit(item: Seller) {
    setEditing(item);
    reset({ name: item.name, phone: item.phone, email: item.email });
    setOpen(true);
  }

  async function onSubmit(values: FormValues) {
    if (editing) {
      await updateMut.mutateAsync({ ...editing, ...values });
    } else {
      await createMut.mutateAsync(values);
    }
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Vendedores</h1>
        <Button onClick={openCreate}>Nuevo vendedor</Button>
      </div>

      {isLoading ? (
        <div className="text-sm">Cargando...</div>
      ) : (
        <Table>
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">ID</th>
              <th className="p-2">Nombre</th>
              <th className="p-2">Teléfono</th>
              <th className="p-2">Correo</th>
              <th className="p-2 w-32">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map((s) => (
              <tr key={s.id} className="border-b hover:bg-zinc-50 dark:hover:bg-zinc-800">
                <td className="p-2 text-xs text-zinc-500">{s.id}</td>
                <td className="p-2">{s.name}</td>
                <td className="p-2">{s.phone}</td>
                <td className="p-2">{s.email}</td>
                <td className="p-2 flex gap-2">
                  <Button variant="secondary" className="text-xs px-2 py-1" onClick={() => openEdit(s)}>Editar</Button>
                  <Button variant="secondary" className="text-xs px-2 py-1" onClick={() => { if (s.id && confirm('¿Eliminar vendedor?')) deleteMut.mutate(s.id); }}>Eliminar</Button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-sm text-zinc-500">Sin vendedores.</td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar vendedor' : 'Nuevo vendedor'}>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Nombre" placeholder="Ej. Juan Pérez" {...register('name')} />
          {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
          <Input label="Teléfono" placeholder="Ej. +34 600 000 000" {...register('phone')} />
          {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
          <Input label="Correo" type="email" placeholder="correo@ejemplo.com" {...register('email')} />
          {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={createMut.isPending || updateMut.isPending}>{editing ? 'Guardar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
