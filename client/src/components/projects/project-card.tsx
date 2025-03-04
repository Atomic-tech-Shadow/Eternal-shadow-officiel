import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Project } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Github, Globe } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  memberCount?: number;
}

export default function ProjectCard({ project, memberCount }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
        <CardHeader className="space-y-0">
          <div className="flex justify-between items-start">
            <CardTitle>{project.name}</CardTitle>
            <Badge>{project.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{project.description}</p>
          
          <div className="flex gap-4">
            {project.repository && (
              <a
                href={project.repository}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                <Github className="h-4 w-4" />
                Repository
              </a>
            )}
            {project.websiteUrl && (
              <a
                href={project.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                <Globe className="h-4 w-4" />
                Website
              </a>
            )}
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              {memberCount} membre{memberCount !== 1 ? "s" : ""}
            </span>
            <span>
              Mis à jour {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
