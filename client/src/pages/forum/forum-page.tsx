import { useQuery } from "@tanstack/react-query";
import { ForumCategory } from "@shared/schema";
import CategoryCard from "@/components/forum/category-card";
import { Loader2 } from "lucide-react";

export default function ForumPage() {
  const { data: categories, isLoading } = useQuery<ForumCategory[]>({
    queryKey: ["/api/forum/categories"],
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Forum</h1>
      <div className="grid gap-6">
        {categories?.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
          />
        ))}
      </div>
    </div>
  );
}
