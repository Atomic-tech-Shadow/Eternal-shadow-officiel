
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ExperienceBarProps {
  level: {
    level: number;
    experience: number;
    nextLevelExperience: number;
  };
}

export function ExperienceBar({ level }: ExperienceBarProps) {
  const progressPercentage = Math.min(
    Math.round((level.experience / level.nextLevelExperience) * 100),
    100
  );

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="secondary" className="px-3 py-1">
                Niveau {level.level}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Votre niveau actuel</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <span className="text-xs text-muted-foreground">
          {level.experience} / {level.nextLevelExperience} XP
        </span>
      </div>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="w-full">
            <Progress value={progressPercentage} className="h-2" />
          </TooltipTrigger>
          <TooltipContent>
            <p>{progressPercentage}% vers le niveau {level.level + 1}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
