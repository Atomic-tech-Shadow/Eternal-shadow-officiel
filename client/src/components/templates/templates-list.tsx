
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ContentTemplate } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import CreateTemplate from "./create-template";

export default function TemplatesList() {
  const [category, setCategory] = useState<string | undefined>(undefined);
  const { data: templates, isLoading } = useQuery<ContentTemplate[]>({
    queryKey: ["/api/templates", category],
    queryFn: async () => {
      const url = category 
        ? `/api/templates?category=${encodeURIComponent(category)}`
        : "/api/templates";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch templates");
      return response.json();
    }
  });

  const categories = [
    { value: "anime_review", label: "Critique d'anime" },
    { value: "tutorial", label: "Tutoriel" },
    { value: "project", label: "Projet technique" },
    { value: "discussion", label: "Discussion" },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Modèles de contenu</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Créer un modèle</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <CreateTemplate />
          </DialogContent>
        </Dialog>
      </div>

      <div className="w-full max-w-xs">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Toutes les catégories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Toutes les catégories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates?.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
              <div className="text-xs bg-secondary/40 rounded p-1 inline-block">
                {categories.find(c => c.value === template.category)?.label || template.category}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigator.clipboard.writeText(template.content)}>
                Utiliser ce modèle
              </Button>
            </CardFooter>
          </Card>
        ))}
        
        {templates && templates.length === 0 && (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">
              Aucun modèle disponible. Créez-en un nouveau !
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
