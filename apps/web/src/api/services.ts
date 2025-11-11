import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

export const ServiceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'El nombre es obligatorio'),
  code: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim() : v),
    z
      .string()
      .min(1, 'El código es obligatorio')
      .max(32, 'Máximo 32 caracteres')
      .regex(/^[A-Z0-9_-]+$/i, 'Usa letras, dígitos, guión y guión bajo')
      .transform((s) => s.toUpperCase())
  ),
  basePrice: z.coerce.number().nonnegative('Debe ser >= 0'),
});
export type Service = z.infer<typeof ServiceSchema>;

const STORAGE_KEY = 'services-items';

function readStore(): Service[] {
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
function writeStore(items: Service[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useServices() {
  return useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 120));
      return readStore();
    },
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Service, 'id'>) => {
      const payload = ServiceSchema.omit({ id: true }).parse(data);
      const created: Service = { id: crypto.randomUUID(), ...payload };
      const current = readStore();
      writeStore([...current, created]);
      return created;
    },
    onSuccess: (created) => {
      qc.setQueryData<Service[]>(['services'], (old = []) => [...old, created]);
    },
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Service) => {
      const payload = ServiceSchema.parse(data);
      const current = readStore();
      const next = current.map((s) => (s.id === payload.id ? payload : s));
      writeStore(next);
      return payload;
    },
    onSuccess: (updated) => {
      qc.setQueryData<Service[]>(['services'], (old = []) => old.map((s) => (s.id === updated.id ? updated : s)));
    },
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const current = readStore();
      const next = current.filter((s) => s.id !== id);
      writeStore(next);
      return id;
    },
    onSuccess: (id) => {
      qc.setQueryData<Service[]>(['services'], (old = []) => old.filter((s) => s.id !== id));
    },
  });
}
