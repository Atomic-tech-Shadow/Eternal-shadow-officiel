import { useQuery, useMutation } from "@tanstack/react-query";
import { Report } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";

export default function ReportsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: reports, isLoading } = useQuery<Report[]>({
    queryKey: ["/api/reports"],
  });

  const updateReportMutation = useMutation({
    mutationFn: async ({
      reportId,
      status,
      resolution,
    }: {
      reportId: number;
      status: string;
      resolution?: string;
    }) => {
      const res = await apiRequest("PATCH", `/api/reports/${reportId}`, {
        status,
        resolution,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({
        title: "Succès",
        description: "Le signalement a été mis à jour",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
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
      <h1 className="text-4xl font-bold mb-8">Modération</h1>

      <div className="grid gap-6">
        {reports?.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>Signalement #{report.id}</span>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(report.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">Raison :</p>
                <p className="text-muted-foreground">{report.reason}</p>
              </div>

              {report.status === "pending" ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    updateReportMutation.mutate({
                      reportId: report.id,
                      status: formData.get("status") as string,
                      resolution: formData.get("resolution") as string,
                    });
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="status">Statut</Label>
                    <Select name="status" defaultValue="rejected">
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="accepted">Accepté</SelectItem>
                        <SelectItem value="rejected">Rejeté</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resolution">Résolution</Label>
                    <Textarea
                      name="resolution"
                      placeholder="Expliquez la décision prise..."
                      disabled={updateReportMutation.isPending}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={updateReportMutation.isPending}
                  >
                    {updateReportMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Mettre à jour
                  </Button>
                </form>
              ) : (
                <div>
                  <p className="font-medium">Résolution :</p>
                  <p className="text-muted-foreground">{report.resolution}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
