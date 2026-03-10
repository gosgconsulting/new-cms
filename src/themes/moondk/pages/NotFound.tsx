import { ThemeLink } from "../components/ThemeLink";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-heading font-medium text-foreground mb-3">Page not found</h1>
        <p className="text-foreground/70 font-body font-light mb-8 leading-relaxed">
          The page you're looking for doesn't exist (or hasn't been migrated yet).
        </p>
        <ThemeLink
          to="/"
          className="inline-flex items-center justify-center px-8 h-12 bg-primary !text-white hover:bg-primary-hover transition-colors rounded-full font-body font-medium"
        >
          Back to Home
        </ThemeLink>
      </div>
    </div>
  );
}
