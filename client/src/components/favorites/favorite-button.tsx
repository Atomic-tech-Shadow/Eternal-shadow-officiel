
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookmarkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";

interface FavoriteButtonProps {
  targetType: string;
  targetId: number;
  buttonText?: string;
}

export default function FavoriteButton({ targetType, targetId, buttonText = "Favoris" }: FavoriteButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: favorites, isLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}/favorites`],
    enabled: !!user,
  });

  const isFavorite = favorites?.some(
    fav => fav.targetType === targetType && fav.targetId === targetId
  );

  const addToFavoritesMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetType,
          targetId,
        }),
      });

      if (!response.ok) throw new Error("Erreur lors de l'ajout aux favoris");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Ajouté aux favoris",
        description: "L'élément a été ajouté à vos favoris",
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/users/${user?.id}/favorites`]
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

  const removeFromFavoritesMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/favorites/${targetType}/${targetId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erreur lors de la suppression des favoris");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Retiré des favoris",
        description: "L'élément a été retiré de vos favoris",
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/users/${user?.id}/favorites`]
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

  const handleToggleFavorite = () => {
    if (!user) {
      toast({
        title: "Authentification requise",
        description: "Veuillez vous connecter pour ajouter aux favoris",
        variant: "destructive",
      });
      return;
    }

    if (isFavorite) {
      removeFromFavoritesMutation.mutate();
    } else {
      addToFavoritesMutation.mutate();
    }
  };

  if (!user) return null;

  return (
    <Button
      variant={isFavorite ? "default" : "outline"}
      size="sm"
      onClick={handleToggleFavorite}
      disabled={isLoading || addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending}
    >
      <BookmarkIcon className={`w-4 h-4 ${isFavorite ? "fill-white" : ""} mr-2`} />
      {buttonText}
    </Button>
  );
}
