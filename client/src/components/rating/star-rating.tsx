
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, StarHalf } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface StarRatingProps {
  targetType: string;
  targetId: number;
  interactive?: boolean;
}

export default function StarRating({ targetType, targetId, interactive = true }: StarRatingProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hoverRating, setHoverRating] = useState(0);

  const { data: ratingInfo } = useQuery({
    queryKey: [`/api/ratings/${targetType}/${targetId}/average`],
    enabled: targetId > 0,
  });

  const rateMutation = useMutation({
    mutationFn: async (score: number) => {
      if (!user) throw new Error("Vous devez être connecté pour noter");

      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetType,
          targetId,
          score,
        }),
      });

      if (!response.ok) throw new Error("Erreur lors de la notation");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Notation enregistrée",
        description: "Merci pour votre évaluation !",
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/ratings/${targetType}/${targetId}/average`]
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const averageRating = ratingInfo?.average || 0;
  const totalRatings = ratingInfo?.count || 0;

  const handleClick = (score: number) => {
    if (interactive && user) {
      rateMutation.mutate(score);
    }
  };

  const renderStar = (position: number) => {
    const filled = hoverRating >= position || (!hoverRating && averageRating >= position);
    const halfFilled = !filled && !hoverRating && (averageRating >= position - 0.5 && averageRating < position);
    
    return (
      <span
        key={position}
        className={`cursor-${interactive ? "pointer" : "default"} transition-colors`}
        onMouseEnter={() => interactive && setHoverRating(position)}
        onMouseLeave={() => interactive && setHoverRating(0)}
        onClick={() => handleClick(position)}
      >
        {halfFilled ? (
          <StarHalf className="w-5 h-5 text-yellow-400" />
        ) : (
          <Star 
            className={`w-5 h-5 ${filled ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`} 
          />
        )}
      </span>
    );
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map(renderStar)}
      </div>
      {totalRatings > 0 && (
        <span className="text-xs text-muted-foreground mt-1">
          {averageRating.toFixed(1)} ({totalRatings} avis)
        </span>
      )}
    </div>
  );
}
