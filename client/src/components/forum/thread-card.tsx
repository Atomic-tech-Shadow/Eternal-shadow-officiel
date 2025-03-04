import { Link } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pin, Lock } from "lucide-react";
import { ForumThread } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface ThreadCardProps {
  thread: ForumThread;
  replyCount?: number;
  categorySlug: string;
}

export default function ThreadCard({ thread, replyCount, categorySlug }: ThreadCardProps) {
  return (
    <Link href={`/forum/${categorySlug}/thread/${thread.id}`}>
      <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            {thread.isPinned && <Pin className="h-4 w-4 text-primary" />}
            {thread.isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
            {thread.title}
          </h3>
          <div className="flex items-center gap-2">
            {replyCount !== undefined && (
              <Badge variant="secondary">
                {replyCount} réponses
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-muted-foreground line-clamp-2">{thread.content}</p>
          <div className="text-sm text-muted-foreground">
            Mis à jour {formatDistanceToNow(new Date(thread.updatedAt), { addSuffix: true })}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
