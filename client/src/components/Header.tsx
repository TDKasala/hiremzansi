import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ChartLine, Menu, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/pricing", label: "Pricing" },
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-secondary font-bold text-xl md:text-2xl flex items-center">
          <ChartLine className="text-primary mr-2" />
          <span>ATSBoost</span>
        </Link>

        <div className="hidden md:flex space-x-1">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`px-3 py-2 rounded-md text-neutral-700 hover:bg-neutral-100 font-medium ${
                location === link.href ? "bg-neutral-100" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center space-x-3">
          {user ? (
            // Logged in UI
            <div className="hidden md:flex items-center space-x-3">
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-white"
                asChild
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {user.name || user.username}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                    className="text-red-500 focus:text-red-500"
                  >
                    {logoutMutation.isPending ? "Logging out..." : (
                      <>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            // Logged out UI
            <div className="hidden md:flex items-center space-x-3">
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-white"
                asChild
              >
                <Link href="/auth">Log In</Link>
              </Button>
              <Button 
                className="hidden md:inline-flex"
                asChild
              >
                <Link href="/auth?tab=register">Sign Up</Link>
              </Button>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-neutral-700"
            onClick={toggleMobileMenu}
            aria-label="Menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-neutral-200">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`block px-3 py-2 rounded-md text-neutral-700 hover:bg-neutral-100 font-medium ${
                  location === link.href ? "bg-neutral-100" : ""
                }`}
                onClick={closeMobileMenu}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <div className="space-y-2 mt-3 px-3">
                <Link 
                  href="/dashboard"
                  className="block px-4 py-2 border border-primary text-primary text-center rounded-md hover:bg-primary hover:text-white transition-colors"
                  onClick={closeMobileMenu}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    logoutMutation.mutate();
                    closeMobileMenu();
                  }}
                  disabled={logoutMutation.isPending}
                  className="w-full px-4 py-2 bg-red-500 text-white text-center rounded-md hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2"
                >
                  {logoutMutation.isPending ? "Logging out..." : (
                    <>
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex space-x-2 mt-3 px-3">
                <Link 
                  href="/auth"
                  className="flex-1 px-4 py-2 border border-primary text-primary text-center rounded-md hover:bg-primary hover:text-white transition-colors"
                  onClick={closeMobileMenu}
                >
                  Log In
                </Link>
                <Link 
                  href="/auth?tab=register"
                  className="flex-1 px-4 py-2 bg-primary text-white text-center rounded-md hover:bg-opacity-90 transition-colors"
                  onClick={closeMobileMenu}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
