import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useLocation } from "wouter";

export default function SearchBar() {
  const [, setLocation] = useLocation();
  const [searchType, setSearchType] = useState("posts");
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    switch (searchType) {
      case "posts":
        setLocation(`/search?type=posts&q=${encodeURIComponent(query)}`);
        break;
      case "forum":
        setLocation(`/search?type=forum&q=${encodeURIComponent(query)}`);
        break;
      case "projects":
        setLocation(`/search?type=projects&q=${encodeURIComponent(query)}`);
        break;
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2 items-center">
      <div className="relative flex-1">
        <Input
          type="search"
          placeholder="Rechercher..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 w-full"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
      <Select 
        value={searchType} 
        onValueChange={setSearchType}
        defaultValue="posts"
      >
        <SelectTrigger className="w-[120px] md:w-[180px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="posts">Posts</SelectItem>
          <SelectItem value="forum">Forum</SelectItem>
          <SelectItem value="projects">Projets</SelectItem>
        </SelectContent>
      </Select>
    </form>
  );
}