
import { useState, useEffect } from "react";
import { useUser } from "./use-user";
import { Project } from "@/types";

export function useFavorites() {
  const [favorites, setFavorites] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/users/${user.id}/favorites`);
        
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des favoris");
        }
        
        const data = await response.json();
        setFavorites(data);
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des favoris:", err);
        setError("Impossible de charger les favoris");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  const addToFavorites = async (projectId: number) => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/users/${user.id}/favorites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectId }),
      });
      
      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout aux favoris");
      }
      
      // Mise à jour de l'état local
      const projectResponse = await fetch(`/api/projects/${projectId}`);
      if (projectResponse.ok) {
        const project = await projectResponse.json();
        setFavorites((prev) => [...prev, project]);
      }
      
      return true;
    } catch (err) {
      console.error("Erreur lors de l'ajout aux favoris:", err);
      return false;
    }
  };

  const removeFromFavorites = async (projectId: number) => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/users/${user.id}/favorites/${projectId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Erreur lors de la suppression des favoris");
      }
      
      // Mise à jour de l'état local
      setFavorites((prev) => prev.filter((project) => project.id !== projectId));
      
      return true;
    } catch (err) {
      console.error("Erreur lors de la suppression des favoris:", err);
      return false;
    }
  };

  const isFavorite = (projectId: number) => {
    return favorites.some((project) => project.id === projectId);
  };

  return {
    favorites,
    isLoading,
    error,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
  };
}
