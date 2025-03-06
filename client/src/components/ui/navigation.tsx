import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Home, MessageSquare, FolderGit2, Menu, X } from "lucide-react";
import SearchBar from "@/components/ui/search";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Added a placeholder for useAuth.  Replace with your actual implementation.
const useAuth = () => ({ user: true }); // Replace with your actual auth logic

export default function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const links = [
    { href: "/", icon: Home, label: "Accueil" },
    { href: "/forum", icon: MessageSquare, label: "Forum" },
    { href: "/projects", icon: FolderGit2, label: "Projets" },
    { href: "/templates", icon: FolderGit2, label: "Modèles" }, // Added Templates link
  ];

  const NavLinks = () => (
    <>
      {links.map(({ href, icon: Icon, label }) => (
        <div key={href} className="relative">
          <Link 
            href={href}
            onClick={() => setIsOpen(false)}
          >
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm font-medium cursor-pointer",
                "hover:text-primary transition-colors",
                location === href
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </div>
          </Link>
        </div>
      ))}
      {user && ( // Added Favorites link conditionally
        <div className="relative">
          <Link 
            href="/favorites"
            onClick={() => setIsOpen(false)}
          >
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm font-medium cursor-pointer",
                "hover:text-primary transition-colors",
                location === "/favorites"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
              )}
            >
              <span className="h-4 w-4">&#9733;</span> {/* Star icon placeholder */}
              Favoris
            </div>
          </Link>
        </div>
      )}
    </>
  )
  );

  return (
    <nav className="border-b sticky top-0 bg-background z-50" aria-label="Navigation principale">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile Menu */}
          <div className="lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <button
                  className="p-2 hover:bg-accent rounded-md"
                  aria-label="Menu principal"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 mt-4">
                  <NavLinks />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            <NavLinks />
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <SearchBar />
          </div>
        </div>
      </div>
    </nav>
  );
}