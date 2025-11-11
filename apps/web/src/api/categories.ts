import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

export const CategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'El nombre es obligatorio'),
});
export type Category = z.infer<typeof CategorySchema>;

const STORAGE_KEY = 'categories-items';

function readStore(): Category[] {
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

function writeStore(items: Category[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 150));
      return readStore();
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Category, 'id'>) => {
      const payload = CategorySchema.omit({ id: true }).parse(data);
      const created: Category = { id: crypto.randomUUID(), ...payload };
      const current = readStore();
      const next = [...current, created];
      writeStore(next);
      return created;
    },
    onSuccess: (created) => {
      qc.setQueryData<Category[]>(['categories'], (old = []) => [...old, created]);
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Category) => {
      const payload = CategorySchema.parse(data);
      const current = readStore();
      const next = current.map((it) => (it.id === payload.id ? payload : it));
      writeStore(next);
      return payload;
    },
    onSuccess: (updated) => {
      qc.setQueryData<Category[]>(['categories'], (old = []) => old.map((it) => (it.id === updated.id ? updated : it)));
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const current = readStore();
      const next = current.filter((it) => it.id !== id);
      writeStore(next);
      return id;
    },
    onSuccess: (id) => {
      qc.setQueryData<Category[]>(['categories'], (old = []) => old.filter((it) => it.id !== id));
    },
  });
}
