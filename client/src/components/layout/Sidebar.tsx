import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  BarChart3,
  University,
  ArrowLeftRight,
  Send,
  Receipt,
  CheckSquare,
  Link,
  Settings,
  LifeBuoy,
  LogOut,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "My Accounts", href: "/accounts", icon: University },
  { name: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { name: "Transfer Money", href: "/transfer", icon: Send },
  { name: "Pay Bills", href: "/bills", icon: Receipt },
  { name: "Order Cheques", href: "/cheques", icon: CheckSquare },
  { name: "Link Accounts", href: "/external", icon: Link },
];

const secondaryNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Support", href: "/support", icon: LifeBuoy },
];

export default function Sidebar() {
  const [location, setLocation] = useLocation();
  const { logout } = useAuth();

  return (
    <aside
      id="sidebar"
      className="w-64 bg-white shadow-sm min-h-screen border-r border-gray-200 transform -translate-x-full lg:translate-x-0 transition-transform duration-200 ease-in-out fixed lg:static z-30"
    >
      <div className="p-6">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Button
                key={item.name}
                variant="ghost"
                className={`w-full justify-start space-x-3 px-4 py-3 rounded-lg ${
                  isActive
                    ? "bg-eccu-blue-light text-eccu-blue font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setLocation(item.href)}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Button>
            );
          })}

          <div className="border-t border-gray-200 mt-8 pt-8">
            {secondaryNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Button
                  key={item.name}
                  variant="ghost"
                  className={`w-full justify-start space-x-3 px-4 py-3 rounded-lg ${
                    isActive
                      ? "bg-eccu-blue-light text-eccu-blue font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setLocation(item.href)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Button>
              );
            })}

            <Button
              variant="ghost"
              className="w-full justify-start space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50"
              onClick={logout}
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </Button>
          </div>
        </nav>
      </div>
    </aside>
  );
}
