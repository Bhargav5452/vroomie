import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Search, Plus, Calendar, User } from "lucide-react";

export default function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/find-ride", icon: Search, label: "Find" },
    { href: "/offer-ride", icon: Plus, label: "Offer" },
    { href: "/bookings", icon: Calendar, label: "Bookings" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 px-6 py-3 z-50">
      <div className="flex items-center justify-around">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = location === href;
          
          return (
            <Link key={href} href={href}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex flex-col items-center space-y-1 h-auto p-2"
                data-testid={`nav-${label.toLowerCase()}`}
              >
                <Icon 
                  className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-gray-400'}`} 
                />
                <span 
                  className={`text-xs ${isActive ? 'text-primary font-medium' : 'text-gray-400'}`}
                >
                  {label}
                </span>
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
