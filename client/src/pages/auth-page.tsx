import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();

  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <AuthForm
                  mode="login"
                  onSubmit={(data) => loginMutation.mutate(data)}
                  isPending={loginMutation.isPending}
                />
              </TabsContent>
              
              <TabsContent value="register">
                <AuthForm
                  mode="register" 
                  onSubmit={(data) => registerMutation.mutate(data)}
                  isPending={registerMutation.isPending}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="hidden lg:flex flex-col justify-center p-12 bg-accent">
        <h1 className="text-4xl font-bold mb-6 text-accent-foreground">
          Eternal Shadow Nexus
        </h1>
        <p className="text-lg text-accent-foreground/80">
          Join our cyberpunk community for anime and tech enthusiasts. Share your passion,
          connect with others, and explore the digital frontier.
        </p>
      </div>
    </div>
  );
}

function AuthForm({ 
  mode,
  onSubmit,
  isPending 
}: {
  mode: "login" | "register"
  onSubmit: (data: any) => void
  isPending: boolean
}) {
  const form = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          {...form.register("username")}
          disabled={isPending}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...form.register("password")}
          disabled={isPending}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {mode === "login" ? "Login" : "Register"}
      </Button>
    </form>
  );
}
