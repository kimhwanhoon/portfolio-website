import { PortfolioForm } from "@/app/admin/_components/portfolio-form";

export default function NewPortfolioPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          New Portfolio Item
        </h1>
        <p className="text-sm text-zinc-500">Create a new portfolio item.</p>
      </div>
      <PortfolioForm />
    </div>
  );
}
