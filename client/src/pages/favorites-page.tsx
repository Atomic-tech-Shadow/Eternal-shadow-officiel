
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Navigation from "@/components/ui/navigation";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

export default function FavoritesPage() {
  const { user } = useAuth();

  const { data: favorites, isLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}/favorites`],
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">Eternal Shadow Nexus</h1>
          </div>
        </header>
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-10">
            <h2 className="text-xl">Vous devez être connecté pour voir vos favoris</h2>
          </div>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">Eternal Shadow Nexus</h1>
          </div>
        </header>
        <Navigation />
        <main className="container mx-auto px-4 py-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  // Grouper les favoris par type
  const postFavorites = favorites?.filter(fav => fav.targetType === 'post') || [];
  const threadFavorites = favorites?.filter(fav => fav.targetType === 'thread') || [];
  const projectFavorites = favorites?.filter(fav => fav.targetType === 'project') || [];

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Eternal Shadow Nexus</h1>
        </div>
      </header>

      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Mes Favoris</h1>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="threads">Discussions</TabsTrigger>
            <TabsTrigger value="projects">Projets</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-6">
            {postFavorites.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Aucun post dans vos favoris</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {postFavorites.map(fav => (
                  <FavoritePostCard key={fav.id} favoriteId={fav.id} postId={fav.targetId} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="threads" className="mt-6">
            {threadFavorites.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Aucune discussion dans vos favoris</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {threadFavorites.map(fav => (
                  <FavoriteThreadCard key={fav.id} favoriteId={fav.id} threadId={fav.targetId} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="projects" className="mt-6">
            {projectFavorites.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Aucun projet dans vos favoris</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projectFavorites.map(fav => (
                  <FavoriteProjectCard key={fav.id} favoriteId={fav.id} projectId={fav.targetId} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// Composants pour afficher les différents types de favoris

function FavoritePostCard({ favoriteId, postId }: { favoriteId: number, postId: number }) {
  const { data: post, isLoading } = useQuery({
    queryKey: [`/api/posts/${postId}`],
  });

  if (isLoading) {
    return <Card className="flex items-center justify-center p-4 h-40"><Loader2 className="h-6 w-6 animate-spin" /></Card>;
  }

  if (!post) {
    return <Card className="p-4 h-40">Post non disponible</Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="truncate">{post.content.slice(0, 30)}...</CardTitle>
        <CardDescription>Post</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground truncate">{post.content}</p>
        <div className="mt-4">
          <Link href="/" className="text-primary hover:underline">Voir le post</Link>
        </div>
      </CardContent>
    </Card>
  );
}

function FavoriteThreadCard({ favoriteId, threadId }: { favoriteId: number, threadId: number }) {
  const { data: thread, isLoading } = useQuery({
    queryKey: [`/api/forum/threads/${threadId}`],
  });

  if (isLoading) {
    return <Card className="flex items-center justify-center p-4 h-40"><Loader2 className="h-6 w-6 animate-spin" /></Card>;
  }

  if (!thread) {
    return <Card className="p-4 h-40">Discussion non disponible</Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="truncate">{thread.title}</CardTitle>
        <CardDescription>Discussion</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground truncate">{thread.content.slice(0, 50)}...</p>
        <div className="mt-4">
          <Link href={`/forum/${thread.categoryId}/thread/${thread.id}`} className="text-primary hover:underline">
            Voir la discussion
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function FavoriteProjectCard({ favoriteId, projectId }: { favoriteId: number, projectId: number }) {
  const { data: project, isLoading } = useQuery({
    queryKey: [`/api/projects/${projectId}`],
  });

  if (isLoading) {
    return <Card className="flex items-center justify-center p-4 h-40"><Loader2 className="h-6 w-6 animate-spin" /></Card>;
  }

  if (!project) {
    return <Card className="p-4 h-40">Projet non disponible</Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="truncate">{project.name}</CardTitle>
        <CardDescription>Projet</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground truncate">{project.description.slice(0, 50)}...</p>
        <div className="mt-4">
          <Link href={`/projects/${project.id}`} className="text-primary hover:underline">
            Voir le projet
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
