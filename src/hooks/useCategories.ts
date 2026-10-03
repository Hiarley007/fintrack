import { useQuery } from '@tanstack/react-query';

import { listCategories } from '@/services/categories';

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: listCategories,
    staleTime: Infinity,
  });
}