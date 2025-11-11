import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import { Service, ServiceSchema, useCreateService, useDeleteService, useServices, useUpdateService } from '@/api/services';

type FormValues = Omit<Service, 'id'>;

export default function ServicesPage() {
  const { data = [], isLoading } = useServices();
  const createMut = useCreateService();
  const updateMut = useUpdateService();
  const deleteMut = useDeleteService();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(ServiceSchema.omit({ id: true })),
    defaultValues: { name: '', code: '', basePrice: 0 },
  });

  function openCreate() {
    setEditing(null);
    reset({ name: '', code: '', basePrice: 0 });
    setOpen(true);
  }
  function openEdit(item: Service) {
    setEditing(item);
    reset({ name: item.name, code: item.code, basePrice: item.basePrice });
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
        <h1 className="text-2xl font-semibold">Servicios</h1>
        <Button onClick={openCreate}>Nuevo servicio</Button>
      </div>

      {isLoading ? (
        <div className="text-sm">Cargando...</div>
      ) : (
        <Table>
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">ID</th>
              <th className="p-2">Nombre</th>
              <th className="p-2">Código</th>
              <th className="p-2">Precio base</th>
              <th className="p-2 w-32">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map((s) => (
              <tr key={s.id} className="border-b hover:bg-zinc-50 dark:hover:bg-zinc-800">
                <td className="p-2 text-xs text-zinc-500">{s.id}</td>
                <td className="p-2">{s.name}</td>
                <td className="p-2 font-mono text-xs">{s.code}</td>
                <td className="p-2">${s.basePrice}</td>
                <td className="p-2 flex gap-2">
                  <Button variant="secondary" className="text-xs px-2 py-1" onClick={() => openEdit(s)}>Editar</Button>
                  <Button variant="secondary" className="text-xs px-2 py-1" onClick={() => { if (s.id && confirm('¿Eliminar servicio?')) deleteMut.mutate(s.id); }}>Eliminar</Button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-sm text-zinc-500">Sin servicios.</td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar servicio' : 'Nuevo servicio'}>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Input label="Nombre" placeholder="Ej. Envío urgente" {...register('name')} />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <Input label="Código (MAYÚS, dígitos, -, _)" placeholder="EJEMPLO_01" {...register('code')} />
            {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code.message}</p>}
          </div>
          <div>
            <Input label="Precio base" type="number" step="0.01" {...register('basePrice', { valueAsNumber: true })} />
            {errors.basePrice && <p className="mt-1 text-xs text-red-600">{errors.basePrice.message as string}</p>}
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
