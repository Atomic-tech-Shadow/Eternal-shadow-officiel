import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { ForumThread, ForumCategory, insertForumThreadSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ThreadCard from "@/components/forum/thread-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function CategoryPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: categories } = useQuery<ForumCategory[]>({
    queryKey: ["/api/forum/categories"],
  });

  const category = categories?.find((c) => c.slug === slug);

  const { data: threads, isLoading } = useQuery<ForumThread[]>({
    queryKey: [`/api/forum/categories/${category?.id}/threads`],
    enabled: !!category?.id,
  });

  const form = useForm({
    resolver: zodResolver(insertForumThreadSchema),
    defaultValues: {
      title: "",
      content: "",
      categoryId: category?.id,
    },
  });

  const createThreadMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/forum/threads", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/forum/categories/${category?.id}/threads`] });
      toast({
        title: "Succès",
        description: "Votre discussion a été créée",
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

  if (!category) {
    return <div>Catégorie non trouvée</div>;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-4">
            <span>{category.icon}</span>
            {category.name}
          </h1>
          <p className="text-muted-foreground mt-2">{category.description}</p>
        </div>

        {user && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>Nouvelle discussion</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer une nouvelle discussion</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={form.handleSubmit((data) =>
                  createThreadMutation.mutate({ ...data, categoryId: category.id })
                )}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="title">Titre</Label>
                  <Input
                    id="title"
                    {...form.register("title")}
                    disabled={createThreadMutation.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Contenu</Label>
                  <Textarea
                    id="content"
                    {...form.register("content")}
                    disabled={createThreadMutation.isPending}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={createThreadMutation.isPending}
                  className="w-full"
                >
                  {createThreadMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Créer la discussion
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4">
        {threads?.map((thread) => (
          <ThreadCard
            key={thread.id}
            thread={thread}
            categorySlug={category.slug}
          />
        ))}
      </div>
    </div>
  );
}
