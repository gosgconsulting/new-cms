import { ThemeLink } from "../components/ThemeLink";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-light text-foreground mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-6">
          The page you’re looking for doesn’t exist (or hasn’t been migrated yet).
        </p>
        <ThemeLink
          to="/"
          className="inline-flex items-center justify-center px-6 h-12 bg-foreground text-background hover:bg-foreground/90 transition-colors rounded-none font-light"
        >
          Back to Home
        </ThemeLink>
      </div>
    </div>
  );
}
