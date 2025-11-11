import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InventoryItem, InventoryItemSchema, useCreateInventory, useDeleteInventory, useInventory, useUpdateInventory } from '@/api/inventory';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';

type FormValues = Omit<InventoryItem, 'id'>;

export default function InventoryPage() {
  const { data = [], isLoading } = useInventory();
  const createMut = useCreateInventory();
  const updateMut = useUpdateInventory();
  const deleteMut = useDeleteInventory();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);

  const defaultValues: FormValues = useMemo(() => ({
    name: '',
    image: '',
    category: '',
    length: 0,
    width: 0,
    height: 0,
    weight: 0,
  }), []);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(InventoryItemSchema.omit({ id: true })),
    defaultValues,
  });

  function openCreate() {
    setEditing(null);
    reset(defaultValues);
    setOpen(true);
  }

  function openEdit(item: InventoryItem) {
    setEditing(item);
    reset({
      name: item.name,
      image: item.image || '',
      category: item.category,
      length: item.length,
      width: item.width,
      height: item.height,
      weight: item.weight,
    });
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
        <h1 className="text-2xl font-semibold">Inventario</h1>
        <Button onClick={openCreate}>Nuevo ítem</Button>
      </div>

      {isLoading ? (
        <div className="text-sm">Cargando...</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">ID</th>
                <th className="p-2">Nombre</th>
                <th className="p-2">Imagen</th>
                <th className="p-2">Categoría</th>
                <th className="p-2">Longitud</th>
                <th className="p-2">Anchura</th>
                <th className="p-2">Altura</th>
                <th className="p-2">Peso</th>
                <th className="p-2 w-32">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id} className="border-b hover:bg-zinc-50 dark:hover:bg-zinc-800">
                  <td className="p-2 text-xs text-zinc-500">{item.id}</td>
                  <td className="p-2">{item.name}</td>
                  <td className="p-2">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-10 w-10 object-cover rounded border" />
                    ) : (
                      <span className="text-xs text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="p-2">{item.category}</td>
                  <td className="p-2">{item.length}</td>
                  <td className="p-2">{item.width}</td>
                  <td className="p-2">{item.height}</td>
                  <td className="p-2">{item.weight}</td>
                  <td className="p-2 flex gap-2">
                    <Button variant="secondary" onClick={() => openEdit(item)} className="text-xs px-2 py-1">Editar</Button>
                    <Button
                      variant="secondary"
                      className="text-xs px-2 py-1"
                      onClick={() => {
                        if (item.id && confirm('¿Eliminar este ítem?')) {
                          deleteMut.mutate(item.id);
                        }
                      }}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td className="p-4 text-center text-sm text-zinc-500" colSpan={9}>Sin elementos en inventario.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar ítem' : 'Nuevo ítem'}>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Nombre" placeholder="Ej. Caja mediana" {...register('name')} />
          {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}

          <Input label="Imagen (URL)" placeholder="https://..." {...register('image')} />
          {errors.image && <p className="text-xs text-red-600">{errors.image.message as string}</p>}

          <Input label="Categoría" placeholder="Ej. Empaques" {...register('category')} />
          {errors.category && <p className="text-xs text-red-600">{errors.category.message}</p>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input label="Longitud (cm)" type="number" step="0.01" {...register('length')} />
              {errors.length && <p className="text-xs text-red-600">{errors.length.message}</p>}
            </div>
            <div>
              <Input label="Anchura (cm)" type="number" step="0.01" {...register('width')} />
              {errors.width && <p className="text-xs text-red-600">{errors.width.message}</p>}
            </div>
            <div>
              <Input label="Altura (cm)" type="number" step="0.01" {...register('height')} />
              {errors.height && <p className="text-xs text-red-600">{errors.height.message}</p>}
            </div>
            <div>
              <Input label="Peso (kg)" type="number" step="0.01" {...register('weight')} />
              {errors.weight && <p className="text-xs text-red-600">{errors.weight.message}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={createMut.isPending || updateMut.isPending}>{editing ? 'Guardar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
