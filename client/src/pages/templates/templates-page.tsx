
import TemplatesList from "@/components/templates/templates-list";
import Navigation from "@/components/ui/navigation";

export default function TemplatesPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Eternal Shadow Nexus</h1>
        </div>
      </header>

      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <TemplatesList />
      </main>
    </div>
  );
}
