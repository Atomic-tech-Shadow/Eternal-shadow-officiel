import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Post } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

export default function PostCard({ post }: { post: Post }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-0 pb-4">
        <div className="flex justify-between">
          <span className="font-semibold">@{post.userId}</span>
          <span className="text-sm text-muted-foreground">
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap mb-4">{post.content}</p>
        {post.image && (
          <img 
            src={post.image} 
            alt="Post content"
            className="rounded-md mb-4"
          />
        )}
        <div className="flex gap-2 flex-wrap">
          {post.tags?.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
