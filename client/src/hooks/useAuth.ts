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