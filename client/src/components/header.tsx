import { Button } from "@/components/ui/button";

interface HeaderProps {
  userRole: "patient" | "provider";
  onRoleChange: (role: "patient" | "provider") => void;
}

export default function Header({ userRole, onRoleChange }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-medical-blue">DNA Diet Club</h1>
            </div>
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              <span className="text-dark-slate font-medium">Personalized Health Management</span>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={userRole === "patient" ? "default" : "ghost"}
                size="sm"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  userRole === "patient" 
                    ? "bg-medical-blue text-white shadow-sm hover:bg-medical-blue" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                }`}
                onClick={() => onRoleChange("patient")}
              >
                Patient Portal
              </Button>
              <Button
                variant={userRole === "provider" ? "default" : "ghost"}
                size="sm"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  userRole === "provider" 
                    ? "bg-medical-blue text-white shadow-sm hover:bg-medical-blue" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                }`}
                onClick={() => onRoleChange("provider")}
              >
                Provider Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
