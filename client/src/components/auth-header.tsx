import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { LogOut, User as UserIcon, Crown } from "lucide-react";
import type { User } from "@/hooks/useAuth";

interface AuthHeaderProps {
  user: User;
}

export default function AuthHeader({ user }: AuthHeaderProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/logout", {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      setLocation("/login");
      window.location.reload(); // Force refresh to clear auth state
    },
    onError: (error: any) => {
      toast({
        title: "Logout Error",
        description: error.message || "Failed to logout",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <UserIcon className="w-4 h-4 text-blue-600" />
        <span className="font-medium text-gray-900">{user.name}</span>
        {user.type === 'provider' ? (
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            <Crown className="w-3 h-3 mr-1" />
            Provider
          </Badge>
        ) : (
          <Badge variant={user.hasSubscription ? "default" : "secondary"}>
            {user.hasSubscription ? "Subscribed" : "Free"}
          </Badge>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => logoutMutation.mutate()}
        disabled={logoutMutation.isPending}
        className="text-gray-600 hover:text-gray-900"
      >
        <LogOut className="w-4 h-4 mr-1" />
        {logoutMutation.isPending ? "Logging out..." : "Logout"}
      </Button>
    </div>
  );
}