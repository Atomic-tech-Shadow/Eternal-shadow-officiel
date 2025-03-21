import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ForumPage from "@/pages/forum/forum-page";
import CategoryPage from "@/pages/forum/category-page";
import ThreadPage from "@/pages/forum/thread-page";
import ProjectsPage from "@/pages/projects/projects-page";
import ProjectPage from "@/pages/projects/project-page";
import TemplatesPage from "@/pages/templates/templates-page";
import FavoritesPage from "@/pages/favorites-page";
import ReportsPage from "@/pages/moderation/reports-page";
import SearchPage from "@/pages/search-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import ProfilePage from "@/pages/profile-page";


function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/forum" component={ForumPage} />
      <Route path="/forum/:slug" component={CategoryPage} />
      <Route path="/forum/:slug/thread/:threadId" component={ThreadPage} />
      <Route path="/projects" component={ProjectsPage} />
      <Route path="/projects/:projectId" component={ProjectPage} />
      <Route path="/templates" component={TemplatesPage} />
      <ProtectedRoute path="/favorites" component={FavoritesPage} />
      <ProtectedRoute path="/moderation" component={ReportsPage} />
      <Route path="/search" component={SearchPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;