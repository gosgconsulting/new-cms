import { Layout } from "@/components/Layout";

const blogPosts = [
  {
    id: 1,
    title: "Top Nail Salon Etiquette Tips You Should Know",
    excerpt: "Going to a nail salon is such an experience that any girl will love to have. It's a change that marks pampering from the staff there. The Nail salon etiquette will help you, whether you are a regular or a first-timer. When you come in for a [...]",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    date: "March 15, 2024"
  },
  {
    id: 2,
    title: "Top Nail Salon Etiquette Tips You Should Know",
    excerpt: "Going to a nail salon is such an experience that any girl will love to have. It's a change that marks pampering from the staff there. The Nail salon etiquette will help you, whether you are a regular or a first-timer. When you come in for a [...]",
    image: "https://images.unsplash.com/photo-1595348020949-87cdfbb44174?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    date: "March 12, 2024"
  },
  {
    id: 3,
    title: "Top Nail Salon Etiquette Tips You Should Know",
    excerpt: "Going to a nail salon is such an experience that any girl will love to have. It's a change that marks pampering from the staff there. The Nail salon etiquette will help you, whether you are a regular or a first-timer. When you come in for a [...]",
    image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    date: "March 10, 2024"
  },
  {
    id: 4,
    title: "Top Nail Salon Etiquette Tips You Should Know",
    excerpt: "Going to a nail salon is such an experience that any girl will love to have. It's a change that marks pampering from the staff there. The Nail salon etiquette will help you, whether you are a regular or a first-timer. When you come in for a [...]",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    date: "March 8, 2024"
  },
  {
    id: 5,
    title: "Top Nail Salon Etiquette Tips You Should Know",
    excerpt: "Going to a nail salon is such an experience that any girl will love to have. It's a change that marks pampering from the staff there. The Nail salon etiquette will help you, whether you are a regular or a first-timer. When you come in for a [...]",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    date: "March 5, 2024"
  },
  {
    id: 6,
    title: "Top Nail Salon Etiquette Tips You Should Know",
    excerpt: "Going to a nail salon is such an experience that any girl will love to have. It's a change that marks pampering from the staff there. The Nail salon etiquette will help you, whether you are a regular or a first-timer. When you come in for a [...]",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    date: "March 3, 2024"
  },
  {
    id: 7,
    title: "Top Nail Salon Etiquette Tips You Should Know",
    excerpt: "Going to a nail salon is such an experience that any girl will love to have. It's a change that marks pampering from the staff there. The Nail salon etiquette will help you, whether you are a regular or a first-timer. When you come in for a [...]",
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    date: "March 1, 2024"
  },
  {
    id: 8,
    title: "Top Nail Salon Etiquette Tips You Should Know",
    excerpt: "Going to a nail salon is such an experience that any girl will love to have. It's a change that marks pampering from the staff there. The Nail salon etiquette will help you, whether you are a regular or a first-timer. When you come in for a [...]",
    image: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    date: "February 28, 2024"
  }
];

export default function Blog() {
  return (
    <Layout>
      {/* Header */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-6xl font-bold text-center text-nail-queen-brown mb-16">
            Our Blog
          </h1>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="pb-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {blogPosts.map((post) => (
              <article key={post.id} className="bg-white rounded-lg overflow-hidden shadow-lg">
                <div className="md:flex">
                  <div className="md:w-1/3">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>
                  <div className="md:w-2/3 p-6">
                    <h2 className="text-xl font-bold text-nail-queen-brown mb-3">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{post.date}</span>
                      <button className="text-nail-queen-brown text-sm font-medium hover:underline">
                        Read more
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
