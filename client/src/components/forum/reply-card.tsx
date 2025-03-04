import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ForumReply } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface ReplyCardProps {
  reply: ForumReply;
  author: { username: string; avatar?: string | null };
}

export default function ReplyCard({ reply, author }: ReplyCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          {author.avatar && (
            <img
              src={author.avatar}
              alt={author.username}
              className="h-8 w-8 rounded-full"
            />
          )}
          <span className="font-semibold">@{author.username}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
        </span>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{reply.content}</p>
      </CardContent>
    </Card>
  );
}
