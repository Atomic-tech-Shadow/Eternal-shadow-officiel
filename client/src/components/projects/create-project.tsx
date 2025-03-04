import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProjectSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function CreateProject() {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(insertProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      repository: "",
      websiteUrl: "",
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/projects", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Succès",
        description: "Votre projet a été créé",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Créer un nouveau projet</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit((data) => createProjectMutation.mutate(data))}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Nom du projet</Label>
            <Input
              id="name"
              {...form.register("name")}
              disabled={createProjectMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              disabled={createProjectMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="repository">Repository (optionnel)</Label>
            <Input
              id="repository"
              {...form.register("repository")}
              placeholder="https://github.com/..."
              disabled={createProjectMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Site web (optionnel)</Label>
            <Input
              id="websiteUrl"
              {...form.register("websiteUrl")}
              placeholder="https://..."
              disabled={createProjectMutation.isPending}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createProjectMutation.isPending}
          >
            {createProjectMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Créer le projet
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
