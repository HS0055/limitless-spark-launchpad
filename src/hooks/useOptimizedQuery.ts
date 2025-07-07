import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

interface OptimizedQueryOptions {
  queryKey: string[];
  queryFn: () => Promise<any>;
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean;
  retryAttempts?: number;
  realtimeTable?: string;
  realtimeEvent?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
}

export const useOptimizedQuery = ({
  queryKey,
  queryFn,
  staleTime = 5 * 60 * 1000, // 5 minutes
  gcTime = 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus = false,
  retryAttempts = 3,
  realtimeTable,
  realtimeEvent = '*'
}: OptimizedQueryOptions) => {
  const queryClient = useQueryClient();

  // Optimized query with intelligent caching
  const query = useQuery({
    queryKey,
    queryFn,
    staleTime,
    gcTime,
    refetchOnWindowFocus,
    retry: retryAttempts,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // Real-time updates integration
  useEffect(() => {
    if (!realtimeTable) return;

    const channel = supabase
      .channel(`realtime-${realtimeTable}`)
      .on(
        'postgres_changes' as any,
        {
          event: realtimeEvent,
          schema: 'public',
          table: realtimeTable
        },
        (payload: any) => {
          console.log('Real-time update received:', payload);
          
          // Invalidate and refetch related queries
          queryClient.invalidateQueries({ queryKey });
          
          // Optional: Optimistic updates for better UX
          if (payload.eventType === 'INSERT') {
            queryClient.setQueryData(queryKey, (oldData: any) => {
              if (Array.isArray(oldData)) {
                return [...oldData, payload.new];
              }
              return oldData;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryKey, queryClient, realtimeTable, realtimeEvent]);

  return query;
};

// Performance monitoring hook
export const usePerformanceMonitor = (operationName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Log performance metrics
      console.log(`${operationName} took ${duration.toFixed(2)}ms`);
      
      // Send to analytics if duration is concerning
      if (duration > 1000) {
        console.warn(`Slow operation detected: ${operationName} (${duration.toFixed(2)}ms)`);
      }
    };
  }, [operationName]);
};