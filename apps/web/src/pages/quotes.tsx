import { useMemo, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import { Quote, QuoteSchema, useCreateQuote, useDeleteQuote, useQuotes, useUpdateQuote } from '@/api/quotes';
import { useInventory } from '@/api/inventory';
import { useServices } from '@/api/services';
import { useProducts } from '@/api/products';
import { z } from 'zod';

type FormValues = Omit<Quote, 'id'>;
type SectionKey = 'schedule' | 'origin' | 'destination' | 'inventory' | 'services' | 'products';

const housingTypes = ['Casa', 'Departamento', 'Oficina', 'Bodega'];

export default function QuotesPage() {
  const { data = [], isLoading } = useQuotes();
  const createMut = useCreateQuote();
  const updateMut = useUpdateQuote();
  const deleteMut = useDeleteQuote();

  // Modal para crear cotización solo con datos del cliente
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const CustomerSchema = z.object({
    customer: QuoteSchema.shape.customer,
  });
  const customerForm = useForm<{ customer: FormValues['customer'] }>({
    resolver: zodResolver(CustomerSchema),
    defaultValues: { customer: { name: '', phone: '', email: '' } },
  });
  function openCreate() {
    customerForm.reset({ customer: { name: '', phone: '', email: '' } });
    setOpenCreateModal(true);
  }
  async function onCreateSubmit(values: { customer: FormValues['customer'] }) {
    await createMut.mutateAsync({
      customer: values.customer,
      serviceDate: '',
      serviceTime: '',
      origin: { zipCode: '', address: '', housingType: '', floors: 0, extra: '' },
      destination: { zipCode: '', address: '', housingType: '', floors: 0, extra: '' },
      inventory: [],
      services: [],
      products: [],
    });
    setOpenCreateModal(false);
  }

  // Modal de edición por sección
  const [sectionOpen, setSectionOpen] = useState<SectionKey | null>(null);
  const [selected, setSelected] = useState<Quote | null>(null);

  // Formularios por sección
  const scheduleForm = useForm<{ serviceDate: string; serviceTime: string }>({
    defaultValues: { serviceDate: '', serviceTime: '' },
  });
  const addressDefault = useMemo(() => ({ zipCode: '', address: '', housingType: '', floors: 0, extra: '' }), []);
  const originForm = useForm<{ origin: FormValues['origin'] }>({ defaultValues: { origin: addressDefault } });
  const destinationForm = useForm<{ destination: FormValues['destination'] }>({ defaultValues: { destination: addressDefault } });
  const inventoryForm = useForm<{ inventory: FormValues['inventory'] }>({ defaultValues: { inventory: [] } });
  const invFA = useFieldArray({ control: inventoryForm.control, name: 'inventory' });
  const invWatch = inventoryForm.watch('inventory');
  const servicesForm = useForm<{ services: FormValues['services'] }>({ defaultValues: { services: [] } });
  const srvFA = useFieldArray({ control: servicesForm.control, name: 'services' });
  const productsForm = useForm<{ products: FormValues['products'] }>({ defaultValues: { products: [] } });
  const prodFA = useFieldArray({ control: productsForm.control, name: 'products' });
  const srvWatch = servicesForm.watch('services');
  const prodWatch = productsForm.watch('products');
  const { data: invCatalog = [] } = useInventory();
  const [invSearch, setInvSearch] = useState('');
  const [invQtyMap, setInvQtyMap] = useState<Record<string, number>>({});
  const filteredInv = useMemo(() => {
    const t = invSearch.trim().toLowerCase();
    if (!t) return invCatalog;
    return invCatalog.filter(it => it.name.toLowerCase().includes(t));
  }, [invSearch, invCatalog]);

  // Catálogo de servicios con buscador y cantidades
  const { data: srvCatalog = [] } = useServices();
  const [srvSearch, setSrvSearch] = useState('');
  const [srvQtyMap, setSrvQtyMap] = useState<Record<string, number>>({});
  const filteredSrv = useMemo(() => {
    const t = srvSearch.trim().toLowerCase();
    if (!t) return srvCatalog;
    return srvCatalog.filter(s => s.name.toLowerCase().includes(t));
  }, [srvSearch, srvCatalog]);

  // Catálogo de productos con buscador y cantidades
  const { data: prodCatalog = [] } = useProducts();
  const [prodSearch, setProdSearch] = useState('');
  const [prodQtyMap, setProdQtyMap] = useState<Record<string, number>>({});
  const filteredProd = useMemo(() => {
    const t = prodSearch.trim().toLowerCase();
    if (!t) return prodCatalog;
    return prodCatalog.filter(p => p.name.toLowerCase().includes(t));
  }, [prodSearch, prodCatalog]);

  function openSection(q: Quote, sec: SectionKey) {
    setSelected(q);
    setSectionOpen(sec);
    // Pre-cargar valores
    if (sec === 'schedule') {
      scheduleForm.reset({ serviceDate: q.serviceDate || '', serviceTime: q.serviceTime || '' });
    } else if (sec === 'origin') {
      originForm.reset({ origin: q.origin });
    } else if (sec === 'destination') {
      destinationForm.reset({ destination: q.destination });
    } else if (sec === 'inventory') {
      inventoryForm.reset({ inventory: q.inventory || [] });
    } else if (sec === 'services') {
      servicesForm.reset({ services: q.services || [] });
    } else if (sec === 'products') {
      productsForm.reset({ products: q.products || [] });
    }
  }
  async function saveSection() {
    if (!selected || !sectionOpen) return;
    let patch: Partial<Quote> = {};
    if (sectionOpen === 'schedule') {
      const v = scheduleForm.getValues();
      patch = { serviceDate: v.serviceDate, serviceTime: v.serviceTime };
    } else if (sectionOpen === 'origin') {
      const v = originForm.getValues();
      patch = { origin: v.origin };
    } else if (sectionOpen === 'destination') {
      const v = destinationForm.getValues();
      patch = { destination: v.destination };
    } else if (sectionOpen === 'inventory') {
      const v = inventoryForm.getValues();
      patch = { inventory: v.inventory };
    } else if (sectionOpen === 'services') {
      const v = servicesForm.getValues();
      patch = { services: v.services };
    } else if (sectionOpen === 'products') {
      const v = productsForm.getValues();
      patch = { products: v.products };
    }
    await updateMut.mutateAsync({ ...selected, ...patch });
    setSectionOpen(null);
    setSelected(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Cotizaciones</h1>
          <span className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs px-2 py-1 border">
            Total: {data.length}
          </span>
        </div>
        <Button onClick={openCreate}>Nueva cotización</Button>
      </div>

      {isLoading ? (
        <div className="text-sm">Cargando...</div>
      ) : (
        <Table>
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">ID</th>
              <th className="p-2">Cliente</th>
              <th className="p-2">Fecha</th>
              <th className="p-2">Hora</th>
              <th className="p-2 min-w-[420px]">Secciones</th>
              <th className="p-2 w-28">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map((q) => (
              <tr key={q.id} className="border-b hover:bg-zinc-50 dark:hover:bg-zinc-800">
                <td className="p-2 text-xs text-zinc-500">{q.id}</td>
                <td className="p-2">{q.customer.name}</td>
                <td className="p-2">{q.serviceDate}</td>
                <td className="p-2">{q.serviceTime}</td>
                <td className="p-2">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" className="text-xs px-2 py-1" onClick={() => openSection(q, 'schedule')}>Fecha y hora</Button>
                    <Button variant="secondary" className="text-xs px-2 py-1" onClick={() => openSection(q, 'origin')}>Origen</Button>
                    <Button variant="secondary" className="text-xs px-2 py-1" onClick={() => openSection(q, 'destination')}>Destino</Button>
                    <Button variant="secondary" className="text-xs px-2 py-1" onClick={() => openSection(q, 'inventory')}>Inventario</Button>
                    <Button variant="secondary" className="text-xs px-2 py-1" onClick={() => openSection(q, 'services')}>Servicios</Button>
                    <Button variant="secondary" className="text-xs px-2 py-1" onClick={() => openSection(q, 'products')}>Productos</Button>
                  </div>
                </td>
                <td className="p-2 flex gap-2">
                  <Button variant="secondary" className="text-xs px-2 py-1" onClick={() => { if (q.id && confirm('¿Eliminar cotización?')) deleteMut.mutate(q.id); }}>Eliminar</Button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-sm text-zinc-500">Sin cotizaciones.</td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      {/* Modal: Crear cotización (solo datos del cliente) */}
      <Modal open={openCreateModal} onClose={() => setOpenCreateModal(false)} title="Nueva cotización">
        <form className="space-y-4" onSubmit={customerForm.handleSubmit(onCreateSubmit)}>
          <section className="space-y-2">
            <h3 className="font-semibold text-sm">Datos del cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input label="Nombre" {...customerForm.register('customer.name')} />
              <Input label="Teléfono" {...customerForm.register('customer.phone')} />
              <Input label="Correo" type="email" {...customerForm.register('customer.email')} />
            </div>
          </section>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpenCreateModal(false)}>Cancelar</Button>
            <Button type="submit" loading={createMut.isPending}>Crear</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edición por sección */}
      <Modal open={!!sectionOpen} onClose={() => setSectionOpen(null)} title={sectionOpen ? `Editar ${sectionOpen}` : ''}>
        {sectionOpen === 'schedule' && (
          <form className="space-y-3" onSubmit={scheduleForm.handleSubmit(async () => { await saveSection(); })}>
            <Input label="Fecha" type="date" {...scheduleForm.register('serviceDate')} />
            <Input label="Hora" type="time" {...scheduleForm.register('serviceTime')} />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setSectionOpen(null)}>Cancelar</Button>
              <Button type="submit" loading={updateMut.isPending}>Guardar</Button>
            </div>
          </form>
        )}
        {sectionOpen === 'origin' && (
          <form className="space-y-4" onSubmit={originForm.handleSubmit(async () => { await saveSection(); })}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Código postal" {...originForm.register('origin.zipCode')} />
              <label className="block text-sm">
                <div className="mb-1 text-xs text-zinc-600 dark:text-zinc-300">Tipo de vivienda</div>
                <select className="w-full rounded border px-3 py-2 bg-white dark:bg-zinc-900" {...originForm.register('origin.housingType')}>
                  <option value="">Selecciona...</option>
                  {housingTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <Input label="Número de pisos" type="number" {...originForm.register('origin.floors', { valueAsNumber: true })} />
              <div className="md:col-span-3">
                <Input label="Dirección" {...originForm.register('origin.address')} />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm">
                  <div className="mb-1 text-xs text-zinc-600 dark:text-zinc-300">Descripción adicional</div>
                  <textarea className="w-full rounded border px-3 py-2 bg-white dark:bg-zinc-900 min-h-[80px]" {...originForm.register('origin.extra')} />
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setSectionOpen(null)}>Cancelar</Button>
              <Button type="submit" loading={updateMut.isPending}>Guardar</Button>
            </div>
          </form>
        )}
        {sectionOpen === 'destination' && (
          <form className="space-y-4" onSubmit={destinationForm.handleSubmit(async () => { await saveSection(); })}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Código postal" {...destinationForm.register('destination.zipCode')} />
              <label className="block text-sm">
                <div className="mb-1 text-xs text-zinc-600 dark:text-zinc-300">Tipo de vivienda</div>
                <select className="w-full rounded border px-3 py-2 bg-white dark:bg-zinc-900" {...destinationForm.register('destination.housingType')}>
                  <option value="">Selecciona...</option>
                  {housingTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <Input label="Número de pisos" type="number" {...destinationForm.register('destination.floors', { valueAsNumber: true })} />
              <div className="md:col-span-3">
                <Input label="Dirección" {...destinationForm.register('destination.address')} />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm">
                  <div className="mb-1 text-xs text-zinc-600 dark:text-zinc-300">Descripción adicional</div>
                  <textarea className="w-full rounded border px-3 py-2 bg-white dark:bg-zinc-900 min-h-[80px]" {...destinationForm.register('destination.extra')} />
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setSectionOpen(null)}>Cancelar</Button>
              <Button type="submit" loading={updateMut.isPending}>Guardar</Button>
            </div>
          </form>
        )}
        {sectionOpen === 'inventory' && (
          <form className="space-y-4" onSubmit={inventoryForm.handleSubmit(async () => { await saveSection(); })}>
            <div className="space-y-2">
              <div className="text-sm font-medium">Agregar desde inventario</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input label="Buscar (nombre o categoría)" value={invSearch} onChange={(e) => setInvSearch(e.target.value)} />
              </div>
              <div className="max-h-48 overflow-auto rounded border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-800 text-left">
                      <th className="p-2">Nombre</th>
                      <th className="p-2 hidden md:table-cell">Categoría</th>
                      <th className="p-2 w-40">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInv.map((it) => (
                      <tr key={it.id} className="border-t">
                        <td className="p-2">{it.name}</td>
                        <td className="p-2 hidden md:table-cell">{it.category}</td>
                        <td className="p-2 w-48">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={1}
                              className="w-16 rounded border px-2 py-1 text-xs bg-white dark:bg-zinc-900"
                              value={invQtyMap[it.id!] ?? 1}
                              onChange={(e) => {
                                const val = Math.max(1, parseInt(e.target.value) || 1);
                                setInvQtyMap((m) => ({ ...m, [it.id!]: val }));
                              }}
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              className="text-xs"
                              onClick={() => {
                                const q = invQtyMap[it.id!] ?? 1;
                                invFA.append({ itemId: it.id || '', image: it.image || '', name: it.name, category: it.category, quantity: q });
                              }}
                            >Agregar</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredInv.length === 0 && (
                      <tr><td className="p-2 text-xs text-zinc-500" colSpan={3}>Sin resultados.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Ítems seleccionados</div>
              {invFA.fields.length === 0 && <div className="text-xs text-zinc-500">Aún no agregas ítems.</div>}
              {invFA.fields.map((f, i) => (
                <div key={f.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                  <div>
                    <div className="mb-1 text-xs text-zinc-600 dark:text-zinc-300">Nombre</div>
                    <div className="px-3 py-2 rounded border bg-zinc-50 dark:bg-zinc-900/40 text-sm">
                      {invWatch?.[i]?.name || ''}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-zinc-600 dark:text-zinc-300">Categoría</div>
                    <div className="px-3 py-2 rounded border bg-zinc-50 dark:bg-zinc-900/40 text-sm">
                      {invWatch?.[i]?.category || ''}
                    </div>
                  </div>
                  <Input label="Cantidad" type="number" {...inventoryForm.register(`inventory.${i}.quantity` as const, { valueAsNumber: true })} />
                  <div className="flex items-end">
                    <Button type="button" variant="secondary" className="text-xs px-2 py-1" onClick={() => invFA.remove(i)}>Quitar</Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setSectionOpen(null)}>Cancelar</Button>
              <Button type="submit" loading={updateMut.isPending}>Guardar</Button>
            </div>
          </form>
        )}
        {sectionOpen === 'services' && (
          <form className="space-y-4" onSubmit={servicesForm.handleSubmit(async () => { await saveSection(); })}>
            <div className="space-y-2">
              <div className="text-sm font-medium">Agregar desde servicios</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input label="Buscar servicio" value={srvSearch} onChange={(e) => setSrvSearch(e.target.value)} />
              </div>
              <div className="max-h-48 overflow-auto rounded border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-800 text-left">
                      <th className="p-2">Nombre</th>
                      <th className="p-2 hidden md:table-cell">Código</th>
                      <th className="p-2 w-48">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSrv.map((s) => (
                      <tr key={s.id} className="border-t">
                        <td className="p-2">{s.name}</td>
                        <td className="p-2 hidden md:table-cell">{s.code}</td>
                        <td className="p-2 w-48">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={1}
                              className="w-16 rounded border px-2 py-1 text-xs bg-white dark:bg-zinc-900"
                              value={srvQtyMap[s.id!] ?? 1}
                              onChange={(e) => {
                                const val = Math.max(1, parseInt(e.target.value) || 1);
                                setSrvQtyMap((m) => ({ ...m, [s.id!]: val }));
                              }}
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              className="text-xs"
                              onClick={() => {
                                const q = srvQtyMap[s.id!] ?? 1;
                                srvFA.append({ serviceId: s.id || '', name: s.name, quantity: q });
                              }}
                            >Agregar</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredSrv.length === 0 && (
                      <tr><td className="p-2 text-xs text-zinc-500" colSpan={3}>Sin resultados.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Servicios seleccionados</div>
              {srvFA.fields.length === 0 && <div className="text-xs text-zinc-500">Aún no agregas servicios.</div>}
              {srvFA.fields.map((f, i) => (
                <div key={f.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                  <div>
                    <div className="mb-1 text-xs text-zinc-600 dark:text-zinc-300">Nombre</div>
                    <div className="px-3 py-2 rounded border bg-zinc-50 dark:bg-zinc-900/40 text-sm">
                      {srvWatch?.[i]?.name || ''}
                    </div>
                  </div>
                  <Input label="Cantidad" type="number" {...servicesForm.register(`services.${i}.quantity` as const, { valueAsNumber: true })} />
                  <div className="flex items-end">
                    <Button type="button" variant="secondary" className="text-xs px-2 py-1" onClick={() => srvFA.remove(i)}>Quitar</Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setSectionOpen(null)}>Cancelar</Button>
              <Button type="submit" loading={updateMut.isPending}>Guardar</Button>
            </div>
          </form>
        )}
        {sectionOpen === 'products' && (
          <form className="space-y-4" onSubmit={productsForm.handleSubmit(async () => { await saveSection(); })}>
            <div className="space-y-2">
              <div className="text-sm font-medium">Agregar desde productos</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input label="Buscar producto" value={prodSearch} onChange={(e) => setProdSearch(e.target.value)} />
              </div>
              <div className="max-h-48 overflow-auto rounded border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-800 text-left">
                      <th className="p-2">Nombre</th>
                      <th className="p-2 hidden md:table-cell">Precio</th>
                      <th className="p-2 w-48">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProd.map((p) => (
                      <tr key={p.id} className="border-t">
                        <td className="p-2">{p.name}</td>
                        <td className="p-2 hidden md:table-cell">${p.price}</td>
                        <td className="p-2 w-48">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={1}
                              className="w-16 rounded border px-2 py-1 text-xs bg-white dark:bg-zinc-900"
                              value={prodQtyMap[p.id!] ?? 1}
                              onChange={(e) => {
                                const val = Math.max(1, parseInt(e.target.value) || 1);
                                setProdQtyMap((m) => ({ ...m, [p.id!]: val }));
                              }}
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              className="text-xs"
                              onClick={() => {
                                const q = prodQtyMap[p.id!] ?? 1;
                                prodFA.append({ productId: p.id || '', name: p.name, quantity: q });
                              }}
                            >Agregar</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredProd.length === 0 && (
                      <tr><td className="p-2 text-xs text-zinc-500" colSpan={3}>Sin resultados.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Productos seleccionados</div>
              {prodFA.fields.length === 0 && <div className="text-xs text-zinc-500">Aún no agregas productos.</div>}
              {prodFA.fields.map((f, i) => (
                <div key={f.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                  <div>
                    <div className="mb-1 text-xs text-zinc-600 dark:text-zinc-300">Nombre</div>
                    <div className="px-3 py-2 rounded border bg-zinc-50 dark:bg-zinc-900/40 text-sm">
                      {prodWatch?.[i]?.name || ''}
                    </div>
                  </div>
                  <Input label="Cantidad" type="number" {...productsForm.register(`products.${i}.quantity` as const, { valueAsNumber: true })} />
                  <div className="flex items-end">
                    <Button type="button" variant="secondary" className="text-xs px-2 py-1" onClick={() => prodFA.remove(i)}>Quitar</Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setSectionOpen(null)}>Cancelar</Button>
              <Button type="submit" loading={updateMut.isPending}>Guardar</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
