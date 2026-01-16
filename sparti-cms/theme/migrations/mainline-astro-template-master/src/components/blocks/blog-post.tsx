import { format } from "date-fns";

type CmsPost = {
  title: string;
  excerpt?: string | null;
  content?: string | null;
  published_at?: string | null;
  created_at?: string | null;
};

const BlogPost = ({ post, children }: { post: CmsPost; children?: React.ReactNode }) => {
  const publishedAt = post.published_at || post.created_at || null;

  return (
    <section>
      <div className="container">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center">
          <h1 className="max-w-3xl text-4xl font-bold md:text-5xl">{post.title}</h1>
          {post.excerpt && <h3 className="text-muted-foreground max-w-4xl">{post.excerpt}</h3>}
          <div className="text-sm text-muted-foreground">
            {publishedAt ? `Published on ${format(new Date(publishedAt), "MMMM d, yyyy")}` : null}
          </div>
        </div>
      </div>
      <div className="container">
        <div className="prose mx-auto max-w-3xl">{children}</div>
      </div>
    </section>
  );
};

export { BlogPost };