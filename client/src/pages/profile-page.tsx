
import React from "react";
import { useUser } from "@/hooks/use-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFavorites } from "@/hooks/use-favorites";
import { useProjects } from "@/hooks/use-projects";
import { ProjectCard } from "@/components/projects/project-card";
import { ExperienceBar } from "@/components/experience-bar";

export default function ProfilePage() {
  const { user, level, badges } = useUser();
  const { favorites } = useFavorites();
  const { projects, isLoading } = useProjects();

  const userProjects = projects?.filter(project => project.authorId === user?.id);
  
  if (!user) return <div className="p-8 text-center">Chargement du profil...</div>;

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Profil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatarUrl || ""} alt={user.username} />
                  <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold">{user.username}</h2>
                <ExperienceBar level={level} />
                
                <div className="w-full pt-4">
                  <h3 className="font-semibold mb-2">Badges</h3>
                  {badges && badges.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {badges.map((badge) => (
                        <Badge key={badge.id} variant="outline">
                          {badge.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">Aucun badge pour le moment</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Tabs defaultValue="projects">
            <TabsList className="w-full">
              <TabsTrigger className="flex-1" value="projects">Mes Projets</TabsTrigger>
              <TabsTrigger className="flex-1" value="favorites">Favoris</TabsTrigger>
              <TabsTrigger className="flex-1" value="activity">Activité</TabsTrigger>
            </TabsList>
            
            <TabsContent value="projects" className="mt-4">
              {isLoading ? (
                <div className="text-center p-4">Chargement des projets...</div>
              ) : userProjects && userProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <p className="text-muted-foreground mb-4">Vous n'avez pas encore créé de projet</p>
                    <a href="/projects/create" className="text-primary hover:underline">
                      Créer un projet
                    </a>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="favorites" className="mt-4">
              {favorites && favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favorites.map((favorite) => (
                    <ProjectCard key={favorite.id} project={favorite} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <p className="text-muted-foreground mb-4">Vous n'avez pas encore de favoris</p>
                    <a href="/projects" className="text-primary hover:underline">
                      Explorer les projets
                    </a>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="activity" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground">Historique d'activité à venir</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
