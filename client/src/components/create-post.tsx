import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPostSchema, InsertPost } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function CreatePost() {
  const { toast } = useToast();
  const form = useForm<InsertPost>({
    resolver: zodResolver(insertPostSchema),
    defaultValues: {
      content: "",
      image: "",
      tags: [],
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: InsertPost) => {
      const res = await apiRequest("POST", "/api/posts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      form.reset();
      toast({
        title: "Success",
        description: "Post created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <form
          onSubmit={form.handleSubmit((data) => createPostMutation.mutate(data))}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              {...form.register("content")}
              placeholder="What's on your mind?"
              disabled={createPostMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              {...form.register("image")}
              placeholder="https://..."
              disabled={createPostMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              {...form.register("tags")}
              placeholder="anime, tech, cyberpunk"
              disabled={createPostMutation.isPending}
              onChange={(e) => {
                const tags = e.target.value.split(",").map((t) => t.trim());
                form.setValue("tags", tags);
              }}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createPostMutation.isPending}
          >
            {createPostMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Post
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
