import { useState, useCallback, useEffect } from 'react';

export interface PaginationResult<T> {
  data: T[];
  total: number;
}

export interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  autoFetch?: boolean;
}

export interface UsePaginationResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  loading: boolean;
  error: Error | null;
  hasNext: boolean;
  hasPrev: boolean;
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  setLimit: (limit: number) => void;
  refresh: () => Promise<void>;
}

/**
 * Custom hook for paginated data fetching
 */
export const usePagination = <T>(
  fetchFunction: (page: number, limit: number) => Promise<PaginationResult<T>>,
  options: UsePaginationOptions = {}
): UsePaginationResult<T> => {
  const {
    initialPage = 1,
    initialLimit = 20,
    autoFetch = true,
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPage = useCallback(
    async (pageNum: number) => {
      try {
        setLoading(true);
        setError(null);

        const result = await fetchFunction(pageNum, limit);

        setData(result.data);
        setTotal(result.total);
        setPage(pageNum);
      } catch (err) {
        const error = err as Error;
        setError(error);
        console.error('Pagination error:', error);
      } finally {
        setLoading(false);
      }
    },
    [fetchFunction, limit]
  );

  const nextPage = useCallback(async () => {
    const totalPages = Math.ceil(total / limit);
    if (page < totalPages) {
      await fetchPage(page + 1);
    }
  }, [page, total, limit, fetchPage]);

  const prevPage = useCallback(async () => {
    if (page > 1) {
      await fetchPage(page - 1);
    }
  }, [page, fetchPage]);

  const goToPage = useCallback(
    async (pageNum: number) => {
      const totalPages = Math.ceil(total / limit);
      const validPage = Math.max(1, Math.min(pageNum, totalPages));
      await fetchPage(validPage);
    },
    [total, limit, fetchPage]
  );

  const updateLimit = useCallback(
    (newLimit: number) => {
      setLimit(newLimit);
      setPage(1); // Reset to first page when limit changes
    },
    []
  );

  const refresh = useCallback(async () => {
    await fetchPage(page);
  }, [page, fetchPage]);

  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchPage(page);
    }
  }, [autoFetch]); // Only run on mount

  return {
    data,
    page,
    limit,
    total,
    totalPages,
    loading,
    error,
    hasNext,
    hasPrev,
    nextPage,
    prevPage,
    goToPage,
    setLimit: updateLimit,
    refresh,
  };
};

export default usePagination;
