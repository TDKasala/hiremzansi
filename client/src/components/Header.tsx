import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Menu, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector";
import hireMzansiLogo from "@assets/Fresh Hire Mzansi Logo with Blue and Green Palette_1749062584652.png";

import New_logo from "@assets/New logo.png";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { t } = useTranslation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { href: "/", label: t('common.home') },
    { href: "/templates", label: "CV Templates" },
    { href: "/skills-quiz", label: "Skills Quiz" },
    { href: "/tools/interview-practice", label: "Interview Practice" },
    { href: "/jobs", label: "Find Jobs" },
    { href: "/job-sites", label: "Job Board" },
    { href: "/referral", label: "Refer & Earn" },
    { href: "/pricing", label: t('common.pricing') },
    { href: "/blog", label: t('common.blog') },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4 lg:px-6 py-4 flex justify-between items-center">
        <Link href="/" className="group flex items-center space-x-3 transition-transform duration-200 hover:scale-105">
          <div className="relative">
            <img 
              src={New_logo} 
              alt="Hire Mzansi Logo" 
              className="h-10 md:h-12 transition-all duration-300 group-hover:brightness-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/30 to-blue-500/30 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl animate-pulse"></div>
            <div className="absolute -inset-2 bg-gradient-to-r from-green-300/20 to-blue-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 blur-2xl delay-100"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center space-x-1">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`relative px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 hover:scale-105 group ${
                location === link.href 
                  ? "text-white bg-gradient-to-r from-green-500 to-blue-600 shadow-lg shadow-green-500/25" 
                  : "text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100"
              }`}
            >
              <span className="relative z-10">{link.label}</span>
              {location === link.href && (
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl opacity-20 animate-pulse"></div>
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          <div className="hidden md:block">
            <LanguageSelector />
          </div>
          {user ? (
            // Logged in UI
            (<div className="hidden lg:flex items-center space-x-3">
              <Button
                variant="outline"
                className="border-2 border-green-500/30 text-green-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:border-green-500 transition-all duration-300 font-medium"
                asChild
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative rounded-full w-10 h-10 bg-gradient-to-r from-green-100 to-blue-100 hover:from-green-200 hover:to-blue-200 transition-all duration-300 group"
                  >
                    <User className="h-5 w-5 text-gray-700 group-hover:text-gray-900 transition-colors" />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-white/95 backdrop-blur-lg border border-gray-200 shadow-xl rounded-xl p-1">
                  <div className="px-3 py-2 text-sm font-medium text-gray-700 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg mb-1">
                    {user.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="font-medium text-primary">
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/premium-tools">CV Tools</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/job-sites">Job Board</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/referrals">Referral Earnings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/referral">Refer & Earn</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/tools/ats-keywords">ATS Keywords</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href="/interview-practice">Interview Practice</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                  
                  {user && user.isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="font-semibold text-primary">
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      setIsLoggingOut(true);
                      await signOut();
                      setIsLoggingOut(false);
                    }}
                    disabled={isLoggingOut}
                    className="text-red-500 focus:text-red-500"
                  >
                    {isLoggingOut ? "Logging out..." : (
                      <>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>{t('common.logout')}</span>
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>)
          ) : (
            // Logged out UI
            (<div className="hidden lg:flex items-center space-x-3">
              <Button
                variant="outline"
                className="border-2 border-blue-500/30 text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:border-blue-500 transition-all duration-300 font-medium"
                asChild
              >
                <Link href="/auth">{t('common.login')}</Link>
              </Button>
              <Button 
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                asChild
              >
                <Link href="/auth?tab=register">{t('common.signup')}</Link>
              </Button>
            </div>)
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden relative w-10 h-10 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 transition-all duration-300 group"
            onClick={toggleMobileMenu}
            aria-label="Menu"
          >
            <Menu className="h-5 w-5 text-gray-700 group-hover:text-gray-900 transition-colors" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Button>
        </div>
      </div>
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50" onClick={closeMobileMenu}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <div 
            className="absolute right-0 top-0 h-full w-1/2 bg-white/80 backdrop-blur-lg border-l border-gray-200/50 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-3 overflow-y-auto h-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeMobileMenu}
                  className="h-8 w-8 rounded-full"
                >
                  <span className="sr-only">Close menu</span>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
              
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={`block px-4 py-3 rounded-xl font-medium transition-all duration-300 text-right ${
                    location === link.href 
                      ? "text-white bg-gradient-to-r from-green-500 to-blue-600 shadow-lg" 
                      : "text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200"
                  }`}
                  onClick={closeMobileMenu}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="md:block lg:hidden mb-4">
                <LanguageSelector />
              </div>
              
              {user ? (
                <div className="space-y-3 mt-4 pt-4 border-t border-gray-200/50">
                  <Link 
                    href="/dashboard"
                    className="block px-4 py-3 bg-gradient-to-r from-green-100 to-blue-100 text-green-700 text-right rounded-xl hover:from-green-200 hover:to-blue-200 transition-all duration-300 font-medium"
                    onClick={closeMobileMenu}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/premium-tools"
                    className="block px-4 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white text-right rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg"
                    onClick={closeMobileMenu}
                  >
                    Premium Tools
                  </Link>
                  <Link 
                    href="/job-sites"
                    className="block px-4 py-2 border border-primary text-primary text-right rounded-md hover:bg-primary hover:text-white transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Job Board
                  </Link>
                  <Link 
                    href="/referral"
                    className="block px-4 py-2 border border-primary text-primary text-right rounded-md hover:bg-primary hover:text-white transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Refer & Earn
                  </Link>
                  <Link 
                    href="/interview/practice"
                    className="block px-4 py-2 border border-primary text-primary text-right rounded-md hover:bg-primary hover:text-white transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Interview Practice
                  </Link>
                  <Link 
                    href="/skills/analyze"
                    className="block px-4 py-2 border border-primary text-primary text-right rounded-md hover:bg-primary hover:text-white transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Skill Gap Analysis
                  </Link>
                  
                  {user && user.isAdmin && (
                    <Link 
                      href="/admin"
                      className="block px-4 py-2 border-2 border-amber-500 bg-amber-100 text-amber-700 font-medium text-right rounded-md hover:bg-amber-200 transition-colors"
                      onClick={closeMobileMenu}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={async () => {
                      setIsLoggingOut(true);
                      await signOut();
                      setIsLoggingOut(false);
                      closeMobileMenu();
                    }}
                    disabled={isLoggingOut}
                    className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-right rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center justify-end gap-2 font-medium shadow-lg"
                  >
                    {isLoggingOut ? "Logging out..." : (
                      <>
                        <span>{t('common.logout')}</span>
                        <LogOut className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-3 mt-4 pt-4 border-t border-gray-200/50">
                  <Link 
                    href="/auth"
                    className="flex-1 px-4 py-3 border-2 border-blue-500/30 text-blue-700 text-right rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:border-blue-500 transition-all duration-300 font-medium"
                    onClick={closeMobileMenu}
                  >
                    {t('common.login')}
                  </Link>
                  <Link 
                    href="/auth?tab=register"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white text-right rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg"
                    onClick={closeMobileMenu}
                  >
                    {t('common.signup')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
