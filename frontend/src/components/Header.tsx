import { Ticket, User, LogOut, TicketCheck } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { LanguageSelector } from "./LanguageSelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
}

export function Header({ currentView, onNavigate, onOpenLogin, onOpenSignup }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();

  const handleSignOut = async () => {
    await signOut();
    onNavigate("home");
  };

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onNavigate("home")}
          >
            <div className="bg-blue-600 p-2 rounded-lg">
              <Ticket className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl">ProTicket</span>
          </div>
          
          <nav className="flex items-center gap-4">
            <Button
              variant={currentView === "home" ? "default" : "ghost"}
              onClick={() => onNavigate("home")}
            >
              {t("header.home")}
            </Button>
            
            {user?.role === "organizer" && (
              <Button
                variant={currentView === "dashboard" ? "default" : "ghost"}
                onClick={() => onNavigate("dashboard")}
              >
                {t("header.dashboard")}
              </Button>
            )}

            {user?.role === "buyer" && (
              <Button
                variant={currentView === "my-tickets" ? "default" : "ghost"}
                onClick={() => onNavigate("my-tickets")}
              >
                {t("header.myTickets")}
              </Button>
            )}
            
            <div className="flex items-center gap-2 ml-4 pl-4 border-l">
              <LanguageSelector />
              
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      {user.name}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span>{user.name}</span>
                        <span className="text-xs text-gray-500">{user.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {user.role === "organizer" ? t("auth.organizer") : t("auth.buyer")}
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      {t("header.logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={onOpenLogin}>
                    {t("header.login")}
                  </Button>
                  <Button size="sm" onClick={onOpenSignup}>
                    {t("header.signup")}
                  </Button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
