import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Post } from "@shared/schema";
import PostCard from "@/components/post-card";
import CreatePost from "@/components/create-post";
import UserProfile from "@/components/user-profile";
import Navigation from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Eternal Shadow Nexus</h1>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Logout
            </Button>
          </div>
        </div>
      </header>

      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CreatePost />

            <div className="mt-8 space-y-6">
              {isLoading ? (
                <div className="flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                posts?.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))
              )}
            </div>
          </div>

          <div>
            {user && <UserProfile user={user} />}
          </div>
        </div>
      </main>
    </div>
  );
}