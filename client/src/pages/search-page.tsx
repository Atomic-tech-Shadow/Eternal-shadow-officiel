import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Post, ForumThread, Project } from "@shared/schema";
import PostCard from "@/components/post-card";
import ThreadCard from "@/components/forum/thread-card";
import ProjectCard from "@/components/projects/project-card";
import { Loader2 } from "lucide-react";

export default function SearchPage() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1]);
  const type = searchParams.get("type");
  const query = searchParams.get("q");

  const { data: results, isLoading } = useQuery({
    queryKey: [`/api/search/${type}`, query],
    enabled: !!type && !!query,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">
        Résultats pour "{query}"
      </h1>

      <div className="grid gap-6">
        {results?.map((result: Post | ForumThread | Project) => {
          switch (type) {
            case "posts":
              return <PostCard key={result.id} post={result as Post} />;
            case "forum":
              return (
                <ThreadCard
                  key={result.id}
                  thread={result as ForumThread}
                  categorySlug="general"
                />
              );
            case "projects":
              return <ProjectCard key={result.id} project={result as Project} />;
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}
