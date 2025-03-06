import { useQuery } from "@tanstack/react-query";
import { Badge } from "@shared/schema";
import { Loader2 } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface UserBadgesProps {
  userId: number;
}

export default function UserBadges({ userId }: UserBadgesProps) {
  const { data: badges, isLoading } = useQuery<Badge[]>({
    queryKey: [`/api/users/${userId}/badges`],
  });

  if (isLoading) {
    return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
  }

  if (!badges?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucun badge pour le moment
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <HoverCard key={badge.id}>
          <HoverCardTrigger asChild>
            <div
              className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center cursor-help"
              aria-label={badge.name}
            >
              {badge.icon}
            </div>
          </HoverCardTrigger>
          <HoverCardContent>
            <div className="space-y-1">
              <h4 className="font-medium">{badge.name}</h4>
              <p className="text-sm text-muted-foreground">
                {badge.description}
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
      ))}
    </div>
  );
}
