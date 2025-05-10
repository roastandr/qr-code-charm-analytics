
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Header() {
  const { user, logout } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0 sm:max-w-xs">
              <nav className="grid gap-6 py-6">
                <Link 
                  to="/" 
                  className="flex items-center gap-2 font-semibold"
                  onClick={() => setSheetOpen(false)}
                >
                  <QrCode className="h-6 w-6" />
                  <span className="text-lg">QR Tracker</span>
                </Link>
                
                <div className="grid gap-4">
                  <h4 className="font-medium">Pages</h4>
                  <div className="grid gap-2">
                    <Link
                      to="/"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-accent"
                      onClick={() => setSheetOpen(false)}
                    >
                      Home
                    </Link>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-accent"
                      onClick={() => setSheetOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </div>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
          
          <Link to="/" className="flex items-center gap-2">
            <QrCode className="h-6 w-6" />
            <span className="font-semibold text-lg hidden md:inline-block">QR Tracker</span>
          </Link>
          
          <nav className="hidden md:flex gap-6 ml-6">
            <Link to="/" className="text-sm font-medium transition-colors hover:text-foreground/80">
              Home
            </Link>
            <Link to="/dashboard" className="text-sm font-medium transition-colors hover:text-foreground/80">
              Dashboard
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(user.name || user.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default">
              <Link to="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
