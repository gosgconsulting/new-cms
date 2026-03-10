import { Layout } from "../components/Layout";

interface LegalPlaceholderPageProps {
  basePath: string;
  title: string;
  description?: string;
}

export default function LegalPlaceholderPage({
  basePath,
  title,
  description,
}: LegalPlaceholderPageProps) {
  return (
    <Layout basePath={basePath}>
      <section className="py-20 bg-background min-h-[60vh] flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-4xl font-bold text-nail-queen-brown mb-6">{title}</h1>
          {description && <p className="text-gray-600 mb-8 max-w-2xl mx-auto">{description}</p>}
          <p className="text-gray-500">
            This page is coming soon. Please continue prompting to fill in the content for this page.
          </p>
        </div>
      </section>
    </Layout>
  );
}
