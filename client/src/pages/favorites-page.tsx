import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import ProjectCard from "@/components/projects/project-card";
import Navigation from "@/components/ui/navigation";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { useFavorites } from "@/hooks/use-favorites";
import { Button } from "@/components/ui/button";

export default function FavoritesPage() {
  const { user } = useAuth();
  const { favorites, isLoading, error } = useFavorites();

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
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  // Filtrer les favoris par type
  const articleFavorites = favorites?.filter(fav => fav.targetType === 'article') || [];
  const projectFavorites = favorites?.filter(fav => fav.targetType === 'project') || [];
  const threadFavorites = favorites?.filter(fav => fav.targetType === 'thread') || [];
  const postFavorites = favorites?.filter(fav => fav.targetType === 'post') || [];

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Eternal Shadow Nexus</h1>
        </div>
      </header>
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Vos Favoris</h2>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="articles">Articles</TabsTrigger>
            <TabsTrigger value="projects">Projets</TabsTrigger>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {favorites?.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[30vh] bg-muted/40 rounded-lg p-8">
                <p className="text-center text-muted-foreground mb-4">
                  Vous n'avez pas encore ajouté d'éléments à vos favoris.
                </p>
                <div className="flex gap-4">
                  <Button asChild variant="default">
                    <Link href="/projects">Découvrir des projets</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/articles">Explorer les articles</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projectFavorites.map(fav => (
                  <FavoriteProjectCard key={fav.id} favoriteId={fav.id} projectId={fav.targetId} />
                ))}
                {postFavorites.map(fav => (
                  <FavoritePostCard key={fav.id} favoriteId={fav.id} postId={fav.targetId} />
                ))}
                {threadFavorites.map(fav => (
                  <FavoriteThreadCard key={fav.id} favoriteId={fav.id} threadId={fav.targetId} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="articles" className="mt-6">
            {articleFavorites.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Aucun article dans vos favoris</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Ajouter le rendu des cartes d'articles */}
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

          <TabsContent value="discussions" className="mt-6">
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
        </Tabs>
      </main>
    </div>
  );
}

// Components temporaires pour le rendu des favoris
function FavoriteProjectCard({ favoriteId, projectId }: { favoriteId: number, projectId: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Projet #{projectId}</CardTitle>
        <CardDescription>Favori #{favoriteId}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Détails du projet à venir</p>
        <div className="mt-4">
          <Link href={`/projects/${projectId}`} className="text-primary hover:underline">
            Voir le projet
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function FavoritePostCard({ favoriteId, postId }: { favoriteId: number, postId: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Post #{postId}</CardTitle>
        <CardDescription>Favori #{favoriteId}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Détails du post à venir</p>
        <div className="mt-4">
          <Link href="/" className="text-primary hover:underline">Voir le post</Link>
        </div>
      </CardContent>
    </Card>
  );
}

function FavoriteThreadCard({ favoriteId, threadId }: { favoriteId: number, threadId: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Discussion #{threadId}</CardTitle>
        <CardDescription>Favori #{favoriteId}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Détails de la discussion à venir</p>
        <div className="mt-4">
          <Link href={`/forum/thread/${threadId}`} className="text-primary hover:underline">
            Voir la discussion
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}