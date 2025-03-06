import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface LevelProgressProps {
  userId: number;
}

interface LevelInfo {
  level: number;
  experience: number;
  nextLevelExperience: number;
}

export default function LevelProgress({ userId }: LevelProgressProps) {
  const { data, isLoading } = useQuery<LevelInfo>({
    queryKey: [`/api/users/${userId}/level`],
  });

  if (isLoading) {
    return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
  }

  if (!data) {
    return null;
  }

  const progress = (data.experience / data.nextLevelExperience) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Niveau {data.level}</span>
        <span>{data.experience} / {data.nextLevelExperience} XP</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}