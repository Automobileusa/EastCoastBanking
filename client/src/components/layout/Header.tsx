import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Bell, Menu, ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Header() {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const isMobile = useIsMobile();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatLastLogin = (lastLogin: string | null) => {
    if (!lastLogin) return "First time login";
    const date = new Date(lastLogin);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => {
                // Toggle sidebar on mobile - this would be connected to sidebar state
                document.getElementById("sidebar")?.classList.toggle("-translate-x-full");
              }}
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </Button>
            <img
              src="https://auth.eastcoastcu.ca/resources/themes/theme-eastcoast-md-refresh-mobile/assets/images/logo.png"
              alt="East Coast Credit Union"
              className="h-10"
            />
            {!isMobile && (
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Online Banking</h1>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="p-2 rounded-lg hover:bg-gray-100 relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </Button>

            <div className="flex items-center space-x-3">
              {!isMobile && user && (
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">
                    Last login: {formatLastLogin(user.lastLogin)}
                  </p>
                </div>
              )}
              <div className="relative">
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="w-10 h-10 bg-eccu-blue rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user ? getInitials(user.name) : "U"}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setShowUserMenu(false);
                        // Navigate to settings
                      }}
                    >
                      Settings
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                    >
                      Sign Out
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
