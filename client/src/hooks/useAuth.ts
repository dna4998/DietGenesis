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
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user: user as User | undefined,
    isLoading,
    isAuthenticated: !!user,
    isPatient: user?.type === 'patient',
    isProvider: user?.type === 'provider',
    hasSubscription: user?.hasSubscription || user?.type === 'provider', // Providers always have access
    error,
  };
}