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

export default function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/", icon: Home, label: "Accueil" },
    { href: "/forum", icon: MessageSquare, label: "Forum" },
    { href: "/projects", icon: FolderGit2, label: "Projets" },
  ];

  const NavLinks = () => (
    <>
      {links.map(({ href, icon: Icon, label }) => (
        <Link key={href} href={href}>
          <a
            role="link"
            aria-current={location === href ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm font-medium cursor-pointer",
              "hover:text-primary transition-colors",
              location === href
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground"
            )}
            onClick={() => setIsOpen(false)}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </a>
        </Link>
      ))}
    </>
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