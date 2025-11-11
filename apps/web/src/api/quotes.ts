import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

const AddressSchema = z.object({
  zipCode: z.string().optional().default(''),
  address: z.string().optional().default(''),
  housingType: z.string().optional().default(''),
  floors: z.coerce.number().int().nonnegative('Debe ser >= 0').optional().default(0),
  extra: z.string().optional().default(''),
});

// Línea de inventario dentro de una cotización. itemId permite enlazar con el inventario global.
const InventoryLineSchema = z.object({
  itemId: z.string().optional().default(''),
  image: z.string().url('URL inválida').or(z.literal('').transform(() => '')),
  name: z.string().min(1, 'Nombre requerido'),
  category: z.string().min(1, 'Categoría requerida'),
  quantity: z.coerce.number().int().nonnegative('Debe ser >= 0'),
});

const ServiceLineSchema = z.object({
  serviceId: z.string().optional().default(''),
  name: z.string().min(1, 'Nombre requerido'),
  quantity: z.coerce.number().int().positive('Debe ser > 0'),
});

const ProductLineSchema = z.object({
  productId: z.string().optional().default(''),
  name: z.string().min(1, 'Nombre requerido'),
  quantity: z.coerce.number().int().positive('Debe ser > 0'),
});

export const QuoteSchema = z.object({
  id: z.string().optional(),
  customer: z.object({
    name: z.string().min(2, 'Nombre requerido'),
    phone: z.string().min(7, 'Teléfono inválido'),
    email: z.string().email('Correo inválido'),
  }),
  serviceDate: z.string().optional().default(''),
  serviceTime: z.string().optional().default(''),
  origin: AddressSchema,
  destination: AddressSchema,
  inventory: z.array(InventoryLineSchema).default([]),
  services: z.array(ServiceLineSchema).default([]),
  products: z.array(ProductLineSchema).default([]),
});

export type Quote = z.infer<typeof QuoteSchema>;

const STORAGE_KEY = 'quotes-items';

function readStore(): Quote[] {
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
function writeStore(items: Quote[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useQuotes() {
  return useQuery<Quote[]>({
    queryKey: ['quotes'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 120));
      return readStore();
    },
  });
}

export function useCreateQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Quote, 'id'>) => {
      const payload = QuoteSchema.omit({ id: true }).parse(data);
      const created: Quote = { id: crypto.randomUUID(), ...payload };
      const current = readStore();
      writeStore([...current, created]);
      return created;
    },
    onSuccess: (created) => {
      qc.setQueryData<Quote[]>(['quotes'], (old = []) => [...old, created]);
    },
  });
}

export function useUpdateQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Quote) => {
      const payload = QuoteSchema.parse(data);
      const current = readStore();
      const next = current.map((q) => (q.id === payload.id ? payload : q));
      writeStore(next);
      return payload;
    },
    onSuccess: (updated) => {
      qc.setQueryData<Quote[]>(['quotes'], (old = []) => old.map((q) => (q.id === updated.id ? updated : q)));
    },
  });
}

export function useDeleteQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const current = readStore();
      const next = current.filter((q) => q.id !== id);
      writeStore(next);
      return id;
    },
    onSuccess: (id) => {
      qc.setQueryData<Quote[]>(['quotes'], (old = []) => old.filter((q) => q.id !== id));
    },
  });
}
