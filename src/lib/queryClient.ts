import { QueryClient } from "@tanstack/react-query";

// Create a client with optimized settings for our use case
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // How long to consider data fresh (don't refetch during this time)
      staleTime: 1000 * 60 * 5, // 5 minutes

      // How long to keep unused data in cache
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)

      // Don't refetch when window regains focus
      refetchOnWindowFocus: false,

      // Don't refetch on mount if we have data
      refetchOnMount: false,

      // Retry failed requests 2 times
      retry: 2,

      // Wait 1 second between retries
      retryDelay: 1000,
    },
    mutations: {
      // Don't retry mutations by default
      retry: false,
    },
  },
});
