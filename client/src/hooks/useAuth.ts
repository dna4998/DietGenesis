import { useQuery } from "@tanstack/react-query";

export interface User {
  id: number;
  name: string;
  email: string;
  type: 'patient' | 'provider';
  hasSubscription?: boolean;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: (failureCount, error: any) => {
      // Retry up to 2 times for non-auth errors
      if (error?.message?.includes('401') || error?.message?.includes('Not authenticated')) {
        return false; // Don't retry auth errors
      }
      return failureCount < 2;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Refetch every 30 seconds to maintain session
  });

  const typedUser = user as User | undefined;
  
  return {
    user: typedUser,
    isLoading,
    isAuthenticated: !!typedUser,
    isPatient: typedUser?.type === 'patient',
    isProvider: typedUser?.type === 'provider',
    hasSubscription: typedUser?.hasSubscription || typedUser?.type === 'provider', // Providers always have access
    error,
  };
}