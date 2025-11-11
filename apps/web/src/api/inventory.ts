import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

export const InventoryItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'El nombre es obligatorio'),
  image: z.string().url('Debe ser una URL válida').or(z.literal('').transform(() => '')),
  category: z.string().min(1, 'La categoría es obligatoria'),
  length: z.coerce.number().nonnegative('Debe ser >= 0'),
  width: z.coerce.number().nonnegative('Debe ser >= 0'),
  height: z.coerce.number().nonnegative('Debe ser >= 0'),
  weight: z.coerce.number().nonnegative('Debe ser >= 0'),
});
export type InventoryItem = z.infer<typeof InventoryItemSchema>;

const STORAGE_KEY = 'inventory-items';

function readStore(): InventoryItem[] {
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

function writeStore(items: InventoryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useInventory() {
  return useQuery<InventoryItem[]>({
    queryKey: ['inventory'],
    queryFn: async () => {
      // Simula una latencia pequeña para UX
      await new Promise((r) => setTimeout(r, 200));
      return readStore();
    },
  });
}

export function useCreateInventory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<InventoryItem, 'id'>) => {
      const payload = InventoryItemSchema.omit({ id: true }).parse(data);
      await new Promise((r) => setTimeout(r, 150));
      const created: InventoryItem = { id: crypto.randomUUID(), ...payload };
      const current = readStore();
      const next = [...current, created];
      writeStore(next);
      return created;
    },
    onSuccess: (created) => {
      qc.setQueryData<InventoryItem[]>(['inventory'], (old = []) => [...old, created]);
    },
  });
}

export function useUpdateInventory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: InventoryItem) => {
      const payload = InventoryItemSchema.parse(data);
      await new Promise((r) => setTimeout(r, 150));
      const current = readStore();
      const next = current.map((it) => (it.id === payload.id ? payload : it));
      writeStore(next);
      return payload;
    },
    onSuccess: (updated) => {
      qc.setQueryData<InventoryItem[]>(['inventory'], (old = []) => old.map((it) => (it.id === updated.id ? updated : it)));
    },
  });
}

export function useDeleteInventory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await new Promise((r) => setTimeout(r, 100));
      const current = readStore();
      const next = current.filter((it) => it.id !== id);
      writeStore(next);
      return id;
    },
    onSuccess: (id) => {
      qc.setQueryData<InventoryItem[]>(['inventory'], (old = []) => old.filter((it) => it.id !== id));
    },
  });
}
