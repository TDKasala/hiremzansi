import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger, 
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Menu, User, LogOut, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" onClick={closeMenu}>
            <div className="flex items-center cursor-pointer">
              <div className="bg-amber-500 text-white font-bold p-2 rounded-lg mr-2">ATS</div>
              <span className="text-xl font-bold">Boost</span>
              <span className="text-amber-500 text-xl font-bold">.co.za</span>
            </div>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/">
            <div className="font-medium hover:text-amber-500 transition-colors cursor-pointer">Home</div>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center font-medium hover:text-amber-500 transition-colors">
              <span>Tools</span>
              <ChevronDown className="ml-1 h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Link href="/analyzer">
                  <div className="w-full cursor-pointer">ATS Analyzer</div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/cv-improvement">
                  <div className="w-full cursor-pointer">CV Improvement</div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/job-matcher">
                  <div className="w-full cursor-pointer">Job Matcher</div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/pricing">
            <div className="font-medium hover:text-amber-500 transition-colors cursor-pointer">Pricing</div>
          </Link>
          <Link href="/job-sites">
            <div className="font-medium hover:text-amber-500 transition-colors cursor-pointer">Job Board</div>
          </Link>
          <Link href="/blog">
            <div className="font-medium hover:text-amber-500 transition-colors cursor-pointer">Blog</div>
          </Link>
          <Link href="/contact">
            <div className="font-medium hover:text-amber-500 transition-colors cursor-pointer">Contact</div>
          </Link>
        </nav>

        <div className="hidden md:flex items-center space-x-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Link href="/profile">
                    <div className="w-full cursor-pointer">My Profile</div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/dashboard">
                    <div className="w-full cursor-pointer">Dashboard</div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <button onClick={handleLogout} className="w-full text-left flex items-center">
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Log out</span>
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/auth">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link href="/auth">
                <Button>Sign up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden" onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-[61px] left-0 right-0 bg-white border-b border-border shadow-lg z-50">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link href="/" onClick={closeMenu}>
              <div className="font-medium px-2 py-1.5 hover:bg-muted rounded-md cursor-pointer">Home</div>
            </Link>
            <div className="border-t border-border pt-2">
              <p className="text-sm text-muted-foreground mb-2 px-2">Tools</p>
              <Link href="/analyzer" onClick={closeMenu}>
                <div className="font-medium px-2 py-1.5 hover:bg-muted rounded-md block cursor-pointer">ATS Analyzer</div>
              </Link>
              <Link href="/cv-improvement" onClick={closeMenu}>
                <div className="font-medium px-2 py-1.5 hover:bg-muted rounded-md block cursor-pointer">CV Improvement</div>
              </Link>
              <Link href="/job-matcher" onClick={closeMenu}>
                <div className="font-medium px-2 py-1.5 hover:bg-muted rounded-md block cursor-pointer">Job Matcher</div>
              </Link>
            </div>
            <Link href="/pricing" onClick={closeMenu}>
              <div className="font-medium px-2 py-1.5 hover:bg-muted rounded-md cursor-pointer">Pricing</div>
            </Link>
            <Link href="/job-sites" onClick={closeMenu}>
              <div className="font-medium px-2 py-1.5 hover:bg-muted rounded-md cursor-pointer">Job Board</div>
            </Link>
            <Link href="/blog" onClick={closeMenu}>
              <div className="font-medium px-2 py-1.5 hover:bg-muted rounded-md cursor-pointer">Blog</div>
            </Link>
            <Link href="/contact" onClick={closeMenu}>
              <div className="font-medium px-2 py-1.5 hover:bg-muted rounded-md cursor-pointer">Contact</div>
            </Link>
            <div className="border-t border-border pt-4">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 px-2 py-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{user.username}</span>
                  </div>
                  <div className="space-y-2">
                    <Link href="/profile" onClick={closeMenu}>
                      <div className="font-medium px-2 py-1.5 hover:bg-muted rounded-md cursor-pointer">
                        My Profile
                      </div>
                    </Link>
                    <Link href="/dashboard" onClick={closeMenu}>
                      <div className="font-medium px-2 py-1.5 hover:bg-muted rounded-md cursor-pointer">
                        Dashboard
                      </div>
                    </Link>
                  </div>
                  <Button 
                    variant="destructive" 
                    className="w-full flex items-center justify-center"
                    onClick={() => {
                      handleLogout();
                      closeMenu();
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Log out</span>
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Link href="/auth" onClick={closeMenu}>
                    <Button variant="outline" className="w-full">Log in</Button>
                  </Link>
                  <Link href="/auth" onClick={closeMenu}>
                    <Button className="w-full">Sign up</Button>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}