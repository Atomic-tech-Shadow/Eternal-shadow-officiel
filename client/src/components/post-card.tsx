import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Post } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";
import { Heart as HeartIcon, MessageSquare as MessageSquareIcon } from "lucide-react";
import StarRating from "./rating/star-rating";
import FavoriteButton from "./favorites/favorite-button";

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
      <CardFooter className="flex justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center space-x-2">
            <HeartIcon className="h-5 w-5 text-slate-500" />
            <span className="text-sm text-slate-500">0 likes</span>
          </div>
          <StarRating targetType="post" targetId={post.id} />
        </div>
        <div className="flex flex-col gap-2 items-end">
          <Button variant="ghost" size="sm">
            <MessageSquareIcon className="h-5 w-5 mr-1" />
            Commenter
          </Button>
          <FavoriteButton targetType="post" targetId={post.id} />
        </div>
      </CardFooter>
    </Card>
  );
}