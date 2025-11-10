import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useApi } from './client';

export const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  price: z.number().nonnegative(),
});
export type Product = z.infer<typeof ProductSchema>;

export function useProducts() {
  const { api } = useApi();
  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      // Placeholder API; replace with backend endpoint
      // Simulated delay
      await new Promise(r => setTimeout(r, 300));
      return [
        { id: '1', name: 'Caja', price: 10 },
        { id: '2', name: 'Palet', price: 55 },
      ];
    },
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  const { api } = useApi();
  return useMutation({
    mutationFn: async (data: Omit<Product, 'id'>) => {
      ProductSchema.parse(data);
      // Placeholder API call
      await new Promise(r => setTimeout(r, 300));
      return { id: crypto.randomUUID(), ...data } as Product;
    },
    onSuccess: (created) => {
      qc.setQueryData<Product[]>(['products'], (old = []) => [...old, created]);
    },
  });
}
