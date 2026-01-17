import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

import { Layout } from "../components/Layout";

export default function GalleryPage({ basePath }: { basePath: string }) {
  const [activeFilter, setActiveFilter] = useState("manicures");

  const asset = (path: string) => `${basePath.replace(/\/+$/, "")}/assets/${path.replace(/^\/+/, "")}`;

  const galleryItems = useMemo(
    () => [
      {
        id: 1,
        category: "manicures",
        title: "French tips",
        image: asset("gallery/manicures/french tip.jpg"),
      },
      {
        id: 2,
        category: "manicures",
        title: "Metalic",
        image: asset("gallery/manicures/metalic.png"),
      },
      {
        id: 3,
        category: "manicures",
        title: "3D",
        image: asset("gallery/manicures/3d.JPG"),
      },
      {
        id: 4,
        category: "manicures",
        title: "3D flower",
        image: asset("gallery/manicures/3d flower.jpg"),
      },
      {
        id: 5,
        category: "manicures",
        title: "Extension",
        image: asset("gallery/manicures/extension.png"),
      },
      {
        id: 6,
        category: "manicures",
        title: "Ombre",
        image: asset("gallery/manicures/ombre.JPG"),
      },
      {
        id: 7,
        category: "manicures",
        title: "BIAB",
        image: asset("gallery/manicures/biab.jpg"),
      },
      {
        id: 8,
        category: "manicures",
        title: "Cat eye",
        image: asset("gallery/manicures/cat eye.png"),
      },
      {
        id: 9,
        category: "manicures",
        title: "Crystal",
        image: asset("gallery/manicures/crytal.jpg"),
      },
      {
        id: 10,
        category: "manicures",
        title: "3D Chrome",
        image: asset("gallery/manicures/3d chrome.jpg"),
      },
      {
        id: 11,
        category: "manicures",
        title: "Polka dot",
        image: asset("gallery/manicures/potka dot.PNG"),
      },
      {
        id: 12,
        category: "pedicures",
        title: "Pedicure Service",
        image:
          "https://images.unsplash.com/photo-1595348020949-87cdfbb44174?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
      {
        id: 13,
        category: "pedicures",
        title: "Foot Care",
        image:
          "https://images.unsplash.com/photo-1595348020949-87cdfbb44174?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
      {
        id: 14,
        category: "pedicures",
        title: "Spa Treatment",
        image:
          "https://images.unsplash.com/photo-1595348020949-87cdfbb44174?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
      {
        id: 15,
        category: "eyebrows",
        title: "Brow Shaping",
        image:
          "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
      {
        id: 16,
        category: "eyebrows",
        title: "Threading",
        image:
          "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
      {
        id: 17,
        category: "eyelashes",
        title: "Lash Extensions",
        image:
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
      {
        id: 18,
        category: "eyelashes",
        title: "Volume Lashes",
        image:
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
      {
        id: 19,
        category: "treatment",
        title: "Nail Treatment",
        image:
          "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
      {
        id: 20,
        category: "treatment",
        title: "Hand Care",
        image:
          "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
    ],
    [basePath]
  );

  const filterCategories = [
    { id: "manicures", label: "Manicures" },
    { id: "pedicures", label: "Pedicures" },
    { id: "eyebrows", label: "Eyebrows" },
    { id: "eyelashes", label: "Eyelashes" },
    { id: "treatment", label: "Treatment" },
  ];

  const filteredItems = galleryItems.filter((item) => item.category === activeFilter);

  return (
    <Layout basePath={basePath}>
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-6xl font-bold text-center text-nail-queen-brown mb-16">Gallery</h1>

          <div className="flex justify-center flex-wrap gap-4 mb-12">
            {filterCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveFilter(category.id)}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium transition-colors",
                  activeFilter === category.id
                    ? "bg-nail-queen-brown text-white"
                    : "bg-white text-nail-queen-brown border border-nail-queen-brown hover:bg-nail-queen-brown hover:text-white"
                )}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="group cursor-pointer">
                <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="mt-4 text-center">
                  <h3 className="text-lg font-medium text-nail-queen-brown">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
