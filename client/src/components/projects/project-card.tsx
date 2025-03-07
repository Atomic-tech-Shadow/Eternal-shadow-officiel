
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Project } from "@shared/schema";

interface ProjectCardProps {
  project: Project;
  isFavorited?: boolean;
  onFavoriteToggle?: (id: string) => void;
  className?: string;
}

export default function ProjectCard({ 
  project, 
  isFavorited = false, 
  onFavoriteToggle,
  className 
}: ProjectCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(project.id);
    }
  };

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className={cn("cursor-pointer transition-all hover:shadow-md", className)}>
        <CardHeader className="p-4 pb-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{project.name || project.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={handleFavoriteClick}
              aria-label={isFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              <Heart className={cn("h-5 w-5", isFavorited ? "fill-primary text-primary" : "text-muted-foreground")} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="flex flex-wrap gap-1 mb-2">
            {project.tags && project.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {project.author && (
              <>
                <Avatar className="h-6 w-6">
                  <AvatarImage src={project.author.avatarUrl} alt={project.author.name} />
                  <AvatarFallback>{project.author.name?.substring(0, 2) || "UN"}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">{project.author.name}</span>
              </>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {new Date(project.createdAt).toLocaleDateString()}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
