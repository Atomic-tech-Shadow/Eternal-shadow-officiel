import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReportSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Flag, Loader2 } from "lucide-react";

interface ReportDialogProps {
  targetId: number;
  targetType: "post" | "thread" | "reply";
}

export default function ReportDialog({ targetId, targetType }: ReportDialogProps) {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(insertReportSchema),
    defaultValues: {
      targetId,
      targetType,
      reason: "",
    },
  });

  const reportMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/reports", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Signalement envoyé",
        description: "Merci de nous avoir signalé ce contenu.",
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Flag className="h-4 w-4 mr-2" />
          Signaler
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Signaler ce contenu</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit((data) => reportMutation.mutate(data))}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="reason">Raison du signalement</Label>
            <Textarea
              id="reason"
              {...form.register("reason")}
              placeholder="Expliquez pourquoi ce contenu devrait être modéré..."
              disabled={reportMutation.isPending}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={reportMutation.isPending}
          >
            {reportMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Envoyer le signalement
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
