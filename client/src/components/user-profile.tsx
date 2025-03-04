import { useQuery } from "@tanstack/react-query";
import { Badge, User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface UserProfileProps {
  user: User;
}

export default function UserProfile({ user }: UserProfileProps) {
  const { data: levelInfo, isLoading: levelLoading } = useQuery({
    queryKey: [`/api/users/${user.id}/level`],
  });

  const { data: badges, isLoading: badgesLoading } = useQuery<Badge[]>({
    queryKey: [`/api/users/${user.id}/badges`],
  });

  if (levelLoading || badgesLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const progressPercentage = levelInfo
    ? (levelInfo.experience / levelInfo.nextLevelExperience) * 100
    : 0;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {user.avatar && (
              <img
                src={user.avatar}
                alt={user.username}
                className="h-16 w-16 rounded-full"
              />
            )}
            <div>
              <h3 className="text-lg font-semibold">@{user.username}</h3>
              {user.bio && <p className="text-sm text-muted-foreground">{user.bio}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Level {levelInfo?.level}</span>
              <span>{levelInfo?.experience} / {levelInfo?.nextLevelExperience} XP</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {badges && badges.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Badges</h4>
              <div className="flex flex-wrap gap-2">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-center gap-1 bg-accent p-1 rounded-md"
                    title={badge.description}
                  >
                    <span>{badge.icon}</span>
                    <span className="text-sm">{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
