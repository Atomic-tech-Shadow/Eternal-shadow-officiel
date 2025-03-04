import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ForumCategory } from "@shared/schema";

interface CategoryCardProps {
  category: ForumCategory;
  threadCount?: number;
}

export default function CategoryCard({ category, threadCount }: CategoryCardProps) {
  return (
    <Link href={`/forum/${category.slug}`}>
      <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <span className="text-3xl">{category.icon}</span>
          <div>
            <CardTitle>{category.name}</CardTitle>
            {threadCount !== undefined && (
              <Badge variant="secondary" className="mt-1">
                {threadCount} discussions
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{category.description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
