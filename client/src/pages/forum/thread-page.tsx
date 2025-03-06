import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ForumThread, ForumReply, ForumCategory, insertForumReplySchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ReplyCard from "@/components/forum/reply-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Lock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import StarRating from "@/components/rating/star-rating"; // Placeholder component
import FavoriteButton from "@/components/favorites/favorite-button"; // Placeholder component


export default function ThreadPage() {
  const { threadId, slug } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: categories } = useQuery<ForumCategory[]>({
    queryKey: ["/api/forum/categories"],
  });

  const category = categories?.find((c) => c.slug === slug);

  const { data: thread, isLoading: threadLoading } = useQuery<ForumThread>({
    queryKey: [`/api/forum/threads/${threadId}`],
    enabled: !!threadId,
  });

  const { data: replies, isLoading: repliesLoading } = useQuery<ForumReply[]>({
    queryKey: [`/api/forum/threads/${threadId}/replies`],
    enabled: !!threadId,
  });

  const form = useForm({
    resolver: zodResolver(insertForumReplySchema),
    defaultValues: {
      content: "",
      threadId: parseInt(threadId),
    },
  });

  const createReplyMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest(
        "POST",
        `/api/forum/threads/${threadId}/replies`,
        data
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/forum/threads/${threadId}/replies`],
      });
      toast({
        title: "Succès",
        description: "Votre réponse a été ajoutée",
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

  if (threadLoading || repliesLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!thread || !category) {
    return <div>Discussion non trouvée</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/forum">Forum</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/forum/${category.slug}`}>{category.name}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{thread.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="space-y-8 mt-4">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-2">
            {thread.title}
            {thread.isLocked && <Lock className="h-6 w-6 text-muted-foreground" />}
          </h1>
          <p className="text-muted-foreground mt-2">
            Créé {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
          </p>
          <div className="flex justify-between items-start">
            <div></div>
            <div className="flex flex-col items-end gap-2">
              <StarRating targetType="thread" targetId={thread.id} />
              <FavoriteButton targetType="thread" targetId={thread.id} />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6">
          <p className="whitespace-pre-wrap">{thread.content}</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Réponses</h2>
          {replies?.map((reply) => (
            <ReplyCard
              key={reply.id}
              reply={reply}
              author={{ username: "user" }}
            />
          ))}
        </div>

        {user && !thread.isLocked && (
          <form
            onSubmit={form.handleSubmit((data) => createReplyMutation.mutate(data))}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="content">Votre réponse</Label>
              <Textarea
                id="content"
                {...form.register("content")}
                disabled={createReplyMutation.isPending}
                rows={4}
              />
            </div>

            <Button
              type="submit"
              disabled={createReplyMutation.isPending}
            >
              {createReplyMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Répondre
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}