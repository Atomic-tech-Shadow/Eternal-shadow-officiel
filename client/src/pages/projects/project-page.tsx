import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Project, ProjectMember, User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { Github, Globe, Users, Loader2 } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import StarRating from "@/components/rating/star-rating";
import FavoriteButton from "@/components/favorites/favorite-button";

export default function ProjectPage() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: members, isLoading: membersLoading } = useQuery<(ProjectMember & { user: User })[]>({
    queryKey: [`/api/projects/${projectId}/members`],
  });

  const joinProjectMutation = useMutation({
    mutationFn: async (role: string) => {
      const res = await apiRequest("POST", `/api/projects/${projectId}/members`, {
        userId: user?.id,
        role,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/members`] });
      toast({
        title: "Succès",
        description: "Vous avez rejoint le projet",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (projectLoading || membersLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return <div>Projet non trouvé</div>;
  }

  const isUserMember = members?.some((member) => member.userId === user?.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/projects">Projets</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{project.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid gap-8 lg:grid-cols-3 mt-4">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-3xl">{project.name}</CardTitle>
                  <div className="mt-2">
                    <StarRating targetType="project" targetId={project.id} />
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  {user && !isUserMember && (
                    <Select
                      onValueChange={(role) => joinProjectMutation.mutate(role)}
                      disabled={joinProjectMutation.isPending}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Rejoindre le projet" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Membre</SelectItem>
                        <SelectItem value="contributor">Contributeur</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  <FavoriteButton targetType="project" targetId={project.id} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg">{project.description}</p>

              <div className="flex gap-4">
                {project.repository && (
                  <a
                    href={project.repository}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Github className="h-5 w-5" />
                    Repository
                  </a>
                )}
                {project.websiteUrl && (
                  <a
                    href={project.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Globe className="h-5 w-5" />
                    Site web
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Membres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members?.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {member.user.avatar && (
                        <img
                          src={member.user.avatar}
                          alt={member.user.username}
                          className="h-8 w-8 rounded-full"
                        />
                      )}
                      <span>@{member.user.username}</span>
                    </div>
                    <span className="text-sm text-muted-foreground capitalize">
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}