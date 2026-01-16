import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type CmsPost = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  created_at?: string;
  published_at?: string;
};

const withBase = (path: string) => {
  const base = (import.meta as any).env?.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : base + "/";
  if (path.startsWith("/")) return normalizedBase.replace(/\/$/, "") + path;
  return normalizedBase + path;
};

const BlogPosts = ({ posts }: { posts: CmsPost[] }) => {
  return (
    <>
      <section>
        <div className="container max-w-5xl space-y-4 text-center">
          <h1 className="text-2xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
            Blog
          </h1>

          <p className="text-muted-foreground max-w-md leading-snug font-medium lg:mx-auto">
            Updates, ideas, and practical tactics from Sparti.
          </p>
        </div>
      </section>
      <section className="container flex max-w-5xl flex-col-reverse gap-8 md:gap-14 lg:flex-row lg:items-end">
        <div className="container">
          <div className="mt-20 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <a
                key={post.id}
                className="rounded-xl border bg-card shadow-sm hover:bg-muted/30 transition-colors"
                href={withBase(`/blog/${post.slug}`)}
              >
                <div className="p-4">
                  <h2 className="mb-1 font-semibold line-clamp-2">{post.title}</h2>
                  <p className="text-muted-foreground line-clamp-3 text-sm">
                    {post.excerpt || "Read the full post"}
                  </p>
                  <Separator className="my-5" />
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium">Sparti</span>
                    <Badge variant="secondary" className="h-fit">
                      Article
                    </Badge>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export { BlogPosts };