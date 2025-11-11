import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Category, CategorySchema, useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from '@/api/categories';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';

type FormValues = Omit<Category, 'id'>;

export default function CategoriesPage() {
  const { data = [], isLoading } = useCategories();
  const createMut = useCreateCategory();
  const updateMut = useUpdateCategory();
  const deleteMut = useDeleteCategory();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(CategorySchema.omit({ id: true })),
    defaultValues: { name: '' },
  });

  function openCreate() {
    setEditing(null);
    reset({ name: '' });
    setOpen(true);
  }
  function openEdit(item: Category) {
    setEditing(item);
    reset({ name: item.name });
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
        <h1 className="text-2xl font-semibold">Categorías</h1>
        <Button onClick={openCreate}>Nueva categoría</Button>
      </div>
      {isLoading ? (
        <div className="text-sm">Cargando...</div>
      ) : (
        <Table>
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">ID</th>
              <th className="p-2">Nombre</th>
              <th className="p-2 w-32">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="border-b hover:bg-zinc-50 dark:hover:bg-zinc-800">
                <td className="p-2 text-xs text-zinc-500">{item.id}</td>
                <td className="p-2">{item.name}</td>
                <td className="p-2 flex gap-2">
                  <Button variant="secondary" className="text-xs px-2 py-1" onClick={() => openEdit(item)}>Editar</Button>
                  <Button
                    variant="secondary"
                    className="text-xs px-2 py-1"
                    onClick={() => {
                      if (item.id && confirm('¿Eliminar esta categoría?')) {
                        deleteMut.mutate(item.id);
                      }
                    }}
                  >Eliminar</Button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={3} className="p-4 text-center text-sm text-zinc-500">Sin categorías.</td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar categoría' : 'Nueva categoría'}>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Nombre" placeholder="Ej. Empaques" {...register('name')} />
          {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={createMut.isPending || updateMut.isPending}>{editing ? 'Guardar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
