
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Home, MessageSquare, FolderGit2, Menu, X, User, Heart } from "lucide-react";
import SearchBar from "@/components/ui/search";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";

export default function Navigation() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const NavItems = () => (
    <>
      <Link href="/">
        <a className={cn(
          "flex items-center px-4 py-2 text-sm font-medium rounded-md",
          location === "/" 
            ? "bg-primary text-primary-foreground" 
            : "hover:bg-muted"
        )}>
          <Home className="w-4 h-4 mr-2" />
          Accueil
        </a>
      </Link>
      <Link href="/forum">
        <a className={cn(
          "flex items-center px-4 py-2 text-sm font-medium rounded-md",
          location.startsWith("/forum") 
            ? "bg-primary text-primary-foreground" 
            : "hover:bg-muted"
        )}>
          <MessageSquare className="w-4 h-4 mr-2" />
          Forum
        </a>
      </Link>
      <Link href="/projects">
        <a className={cn(
          "flex items-center px-4 py-2 text-sm font-medium rounded-md",
          location.startsWith("/projects") 
            ? "bg-primary text-primary-foreground" 
            : "hover:bg-muted"
        )}>
          <FolderGit2 className="w-4 h-4 mr-2" />
          Projets
        </a>
      </Link>
      <Link href="/profile">
        <a className={cn(
          "flex items-center px-4 py-2 text-sm font-medium rounded-md",
          location === "/profile" 
            ? "bg-primary text-primary-foreground" 
            : "hover:bg-muted"
        )}>
          <User className="w-4 h-4 mr-2" />
          Profil
        </a>
      </Link>
      <Link href="/favorites">
        <a className={cn(
          "flex items-center px-4 py-2 text-sm font-medium rounded-md",
          location === "/favorites" 
            ? "bg-primary text-primary-foreground" 
            : "hover:bg-muted"
        )}>
          <Heart className="w-4 h-4 mr-2" />
          Favoris
        </a>
      </Link>
    </>
  );

  return (
    <nav className="border-b sticky top-0 bg-background z-50" aria-label="Navigation principale">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between md:hidden">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <button className="p-2" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[250px] sm:w-[300px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2 mt-4">
                <NavItems />
              </div>
            </SheetContent>
          </Sheet>
          <SearchBar className="w-full max-w-xs mx-2" />
        </div>
        <div className="hidden md:flex md:items-center md:justify-between">
          <div className="flex items-center gap-1">
            <NavItems />
          </div>
          <SearchBar className="w-full max-w-xs" />
        </div>
      </div>
    </nav>
  );
}
