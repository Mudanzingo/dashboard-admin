import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

const TruckSchema = z.object({
  id: z.string().optional(),
  brand: z.string().min(1, 'Marca requerida'),
  model: z.string().min(1, 'Modelo requerido'),
  year: z.coerce.number().int().min(1900, 'Año inválido').max(new Date().getFullYear() + 1, 'Año demasiado grande'),
  capacity: z.coerce.number().nonnegative('Capacidad inválida'),
  car_plate: z.string().min(3, 'Placa inválida'),
});
export type Truck = z.infer<typeof TruckSchema>;

export const ProviderSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(2, 'El nombre es obligatorio'),
  empresa: z.string().min(1, 'La empresa es obligatoria'),
  telefono: z.string().min(7, 'Teléfono inválido'),
  ciudad: z.string().min(2, 'Ciudad obligatoria'),
  trucks: z.array(TruckSchema).default([]),
});
export type Provider = z.infer<typeof ProviderSchema>;

const STORAGE_KEY = 'providers-items';

function readStore(): Provider[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}
function writeStore(items: Provider[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useProviders() {
  return useQuery<Provider[]>({
    queryKey: ['providers'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 120));
      return readStore();
    },
  });
}

export function useCreateProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Provider, 'id'>) => {
      const payload = ProviderSchema.omit({ id: true }).parse(data);
      const created: Provider = { id: crypto.randomUUID(), ...payload };
      const current = readStore();
      writeStore([...current, created]);
      return created;
    },
    onSuccess: (created) => {
      qc.setQueryData<Provider[]>(['providers'], (old = []) => [...old, created]);
    },
  });
}

export function useUpdateProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Provider) => {
      const payload = ProviderSchema.parse(data);
      const current = readStore();
      const next = current.map((p) => (p.id === payload.id ? payload : p));
      writeStore(next);
      return payload;
    },
    onSuccess: (updated) => {
      qc.setQueryData<Provider[]>(['providers'], (old = []) => old.map((p) => (p.id === updated.id ? updated : p)));
    },
  });
}

export function useDeleteProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const current = readStore();
      const next = current.filter((p) => p.id !== id);
      writeStore(next);
      return id;
    },
    onSuccess: (id) => {
      qc.setQueryData<Provider[]>(['providers'], (old = []) => old.filter((p) => p.id !== id));
    },
  });
}
