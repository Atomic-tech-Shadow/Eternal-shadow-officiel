import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Home, MessageSquare, FolderGit2 } from "lucide-react";
import SearchBar from "@/components/ui/search";

export default function Navigation() {
  const [location] = useLocation();

  const links = [
    { href: "/", icon: Home, label: "Accueil" },
    { href: "/forum", icon: MessageSquare, label: "Forum" },
    { href: "/projects", icon: FolderGit2, label: "Projets" },
  ];

  return (
    <nav className="border-b" aria-label="Navigation principale">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
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
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </a>
              </Link>
            ))}
          </div>
          <div className="w-1/3">
            <SearchBar />
          </div>
        </div>
      </div>
    </nav>
  );
}