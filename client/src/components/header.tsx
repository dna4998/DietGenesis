import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AppLogo from "@/components/app-logo";
import AuthHeader from "./auth-header";
import type { User } from "@/hooks/useAuth";

interface HeaderProps {
  userRole: "patient" | "provider";
  onRoleChange: (role: "patient" | "provider") => void;
  logoUrl?: string;
  title?: string;
  user?: User;
}

export default function Header({ 
  userRole, 
  onRoleChange, 
  logoUrl, 
  title = "DNA Diet Club",
  user
}: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <AppLogo logoUrl={logoUrl} title={title} />

          {/* Authentication Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <AuthHeader user={user} />
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">View as:</span>
                <Button
                  variant={userRole === "patient" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onRoleChange("patient")}
                >
                  Patient
                </Button>
                <Button
                  variant={userRole === "provider" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onRoleChange("provider")}
                >
                  Provider
                </Button>
              </div>
            )}
            
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>System Online</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}