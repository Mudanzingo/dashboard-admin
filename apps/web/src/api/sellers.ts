import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

export const SellerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'El nombre es obligatorio'),
  phone: z.string().min(7, 'Teléfono inválido'),
  email: z.string().email('Correo inválido'),
});
export type Seller = z.infer<typeof SellerSchema>;

const STORAGE_KEY = 'sellers-items';

function readStore(): Seller[] {
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
function writeStore(items: Seller[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useSellers() {
  return useQuery<Seller[]>({
    queryKey: ['sellers'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 120));
      return readStore();
    },
  });
}

export function useCreateSeller() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Seller, 'id'>) => {
      const payload = SellerSchema.omit({ id: true }).parse(data);
      const created: Seller = { id: crypto.randomUUID(), ...payload };
      const current = readStore();
      writeStore([...current, created]);
      return created;
    },
    onSuccess: (created) => {
      qc.setQueryData<Seller[]>(['sellers'], (old = []) => [...old, created]);
    },
  });
}

export function useUpdateSeller() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Seller) => {
      const payload = SellerSchema.parse(data);
      const current = readStore();
      const next = current.map((s) => (s.id === payload.id ? payload : s));
      writeStore(next);
      return payload;
    },
    onSuccess: (updated) => {
      qc.setQueryData<Seller[]>(['sellers'], (old = []) => old.map((s) => (s.id === updated.id ? updated : s)));
    },
  });
}

export function useDeleteSeller() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const current = readStore();
      const next = current.filter((s) => s.id !== id);
      writeStore(next);
      return id;
    },
    onSuccess: (id) => {
      qc.setQueryData<Seller[]>(['sellers'], (old = []) => old.filter((s) => s.id !== id));
    },
  });
}
