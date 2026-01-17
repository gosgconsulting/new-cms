import { Layout } from "../components/Layout";

export default function NotFoundPage({
  basePath,
  path,
}: {
  basePath: string;
  path?: string;
}) {
  return (
    <Layout basePath={basePath}>
      <div className="min-h-[60vh] flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
          {path ? <p className="text-sm text-gray-500 mb-6">{path}</p> : null}
          <a href={basePath} className="text-nail-queen-brown hover:underline">
            Return to Home
          </a>
        </div>
      </div>
    </Layout>
  );
}
