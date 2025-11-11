import { useState } from 'react';
import { useForm, useFieldArray, type UseFormRegister, type Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import { Provider, ProviderSchema, useCreateProvider, useDeleteProvider, useProviders, useUpdateProvider } from '@/api/providers';

type FormValues = Omit<Provider, 'id'>;

export default function ProvidersPage() {
  const { data = [], isLoading } = useProviders();
  const createMut = useCreateProvider();
  const updateMut = useUpdateProvider();
  const deleteMut = useDeleteProvider();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Provider | null>(null);

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(ProviderSchema.omit({ id: true })),
    defaultValues: { nombre: '', empresa: '', telefono: '', ciudad: '', trucks: [] },
  });

  function openCreate() {
    setEditing(null);
  reset({ nombre: '', empresa: '', telefono: '', ciudad: '', trucks: [] });
    setOpen(true);
  }
  function openEdit(item: Provider) {
    setEditing(item);
  reset({ nombre: item.nombre, empresa: item.empresa, telefono: item.telefono, ciudad: item.ciudad, trucks: item.trucks || [] });
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
        <h1 className="text-2xl font-semibold">Proveedores</h1>
        <Button onClick={openCreate}>Nuevo proveedor</Button>
      </div>

      {isLoading ? (
        <div className="text-sm">Cargando...</div>
      ) : (
        <Table>
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">ID</th>
              <th className="p-2">Nombre</th>
              <th className="p-2">Empresa</th>
              <th className="p-2">Teléfono</th>
              <th className="p-2">Ciudad</th>
              <th className="p-2">Camiones</th>
              <th className="p-2 w-32">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.id} className="border-b hover:bg-zinc-50 dark:hover:bg-zinc-800">
                <td className="p-2 text-xs text-zinc-500">{p.id}</td>
                <td className="p-2">{p.nombre}</td>
                <td className="p-2">{p.empresa}</td>
                <td className="p-2">{p.telefono}</td>
                <td className="p-2">{p.ciudad}</td>
                <td className="p-2 text-xs">{p.trucks?.length || 0}</td>
                <td className="p-2 flex gap-2">
                  <Button variant="secondary" className="text-xs px-2 py-1" onClick={() => openEdit(p)}>Editar</Button>
                  <Button variant="secondary" className="text-xs px-2 py-1" onClick={() => { if (p.id && confirm('¿Eliminar proveedor?')) deleteMut.mutate(p.id); }}>Eliminar</Button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-sm text-zinc-500">Sin proveedores.</td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar proveedor' : 'Nuevo proveedor'}>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Input label="Nombre" {...register('nombre')} />
            {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre.message}</p>}
          </div>
          <div>
            <Input label="Empresa" {...register('empresa')} />
            {errors.empresa && <p className="mt-1 text-xs text-red-600">{errors.empresa.message}</p>}
          </div>
          <div>
            <Input label="Teléfono" {...register('telefono')} />
            {errors.telefono && <p className="mt-1 text-xs text-red-600">{errors.telefono.message}</p>}
          </div>
          <div>
            <Input label="Ciudad" {...register('ciudad')} />
            {errors.ciudad && <p className="mt-1 text-xs text-red-600">{errors.ciudad.message}</p>}
          </div>
          {/** Gestión de camiones (CRUD simple en el mismo modal) */}
          <fieldset className="border rounded p-3">
            <legend className="text-sm font-medium">Camiones</legend>
            <TrucksEditor register={register} control={control} />
          </fieldset>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={createMut.isPending || updateMut.isPending}>{editing ? 'Guardar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// Editor simple de camiones usando índices de 0..N en el formulario actual
function TrucksEditor({ register, control }: { register: UseFormRegister<FormValues>; control: Control<FormValues> }) {
  const { fields, append, remove } = useFieldArray({ control, name: 'trucks' });
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500">Agrega camiones del proveedor.</p>
        <Button type="button" variant="secondary" className="text-xs" onClick={() => append({ brand: '', model: '', year: new Date().getFullYear(), capacity: 0, car_plate: '' })}>Agregar camión</Button>
      </div>
      {fields.length === 0 && (
        <div className="text-xs text-zinc-500">Sin camiones.</div>
      )}
      {fields.map((f, i) => (
        <div key={f.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
          <Input label="Marca" {...register(`trucks.${i}.brand` as const)} />
          <Input label="Modelo" {...register(`trucks.${i}.model` as const)} />
          <Input label="Año" type="number" {...register(`trucks.${i}.year` as const, { valueAsNumber: true })} />
          <Input label="Capacidad" type="number" step="0.01" {...register(`trucks.${i}.capacity` as const, { valueAsNumber: true })} />
          <Input label="Placa" {...register(`trucks.${i}.car_plate` as const)} />
          <div className="flex items-end">
            <Button type="button" variant="secondary" className="text-xs px-2 py-1" onClick={() => remove(i)}>Quitar</Button>
          </div>
        </div>
      ))}
    </div>
  );
}
