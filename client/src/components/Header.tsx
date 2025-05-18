import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger, 
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" onClick={closeMenu}>
            <a className="flex items-center">
              <div className="bg-amber-500 text-white font-bold p-2 rounded-lg mr-2">ATS</div>
              <span className="text-xl font-bold">Boost</span>
              <span className="text-amber-500 text-xl font-bold">.co.za</span>
            </a>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/">
            <a className="font-medium hover:text-amber-500 transition-colors">Home</a>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center font-medium hover:text-amber-500 transition-colors">
              <span>Tools</span>
              <ChevronDown className="ml-1 h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Link href="/analyzer">
                  <a className="w-full">ATS Analyzer</a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/cv-improvement">
                  <a className="w-full">CV Improvement</a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/job-matcher">
                  <a className="w-full">Job Matcher</a>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/pricing">
            <a className="font-medium hover:text-amber-500 transition-colors">Pricing</a>
          </Link>
          <Link href="/job-sites">
            <a className="font-medium hover:text-amber-500 transition-colors">Job Board</a>
          </Link>
          <Link href="/blog">
            <a className="font-medium hover:text-amber-500 transition-colors">Blog</a>
          </Link>
          <Link href="/contact">
            <a className="font-medium hover:text-amber-500 transition-colors">Contact</a>
          </Link>
        </nav>

        <div className="hidden md:flex items-center space-x-3">
          <Link href="/auth">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link href="/auth">
            <Button>Sign up</Button>
          </Link>
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
              <a className="font-medium px-2 py-1.5 hover:bg-muted rounded-md">Home</a>
            </Link>
            <div className="border-t border-border pt-2">
              <p className="text-sm text-muted-foreground mb-2 px-2">Tools</p>
              <Link href="/analyzer" onClick={closeMenu}>
                <a className="font-medium px-2 py-1.5 hover:bg-muted rounded-md block">ATS Analyzer</a>
              </Link>
              <Link href="/cv-improvement" onClick={closeMenu}>
                <a className="font-medium px-2 py-1.5 hover:bg-muted rounded-md block">CV Improvement</a>
              </Link>
              <Link href="/job-matcher" onClick={closeMenu}>
                <a className="font-medium px-2 py-1.5 hover:bg-muted rounded-md block">Job Matcher</a>
              </Link>
            </div>
            <Link href="/pricing" onClick={closeMenu}>
              <a className="font-medium px-2 py-1.5 hover:bg-muted rounded-md">Pricing</a>
            </Link>
            <Link href="/job-sites" onClick={closeMenu}>
              <a className="font-medium px-2 py-1.5 hover:bg-muted rounded-md">Job Board</a>
            </Link>
            <Link href="/blog" onClick={closeMenu}>
              <a className="font-medium px-2 py-1.5 hover:bg-muted rounded-md">Blog</a>
            </Link>
            <Link href="/contact" onClick={closeMenu}>
              <a className="font-medium px-2 py-1.5 hover:bg-muted rounded-md">Contact</a>
            </Link>
            <div className="border-t border-border pt-4 flex space-x-2">
              <Link href="/auth" onClick={closeMenu}>
                <Button variant="outline" className="w-full">Log in</Button>
              </Link>
              <Link href="/auth" onClick={closeMenu}>
                <Button className="w-full">Sign up</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}