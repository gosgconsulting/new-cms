import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Award,
  Users,
  Calendar,
} from "lucide-react";

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  date?: string;
  type: "image" | "video";
}

interface Category {
  id: string;
  name: string;
  description: string;
  count: number;
}

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentIndex, setCurrentIndex] = useState(0);

  const categories: Category[] = [
    {
      id: "all",
      name: "All",
      description: "View all gallery content",
      count: 24,
    },
    {
      id: "performances",
      name: "Performances",
      description: "Student showcases and recitals",
      count: 8,
    },
    {
      id: "competitions",
      name: "Competitions",
      description: "Awards and competition highlights",
      count: 6,
    },
    {
      id: "classes",
      name: "Classes",
      description: "Behind the scenes in our studios",
      count: 5,
    },
    {
      id: "events",
      name: "Events",
      description: "Special workshops and masterclasses",
      count: 5,
    },
  ];

  const galleryItems: GalleryItem[] = [
    {
      id: "1",
      title: "Annual Recital 2024",
      category: "performances",
      image: "/theme/sissonne/assets/placeholder.svg",
      description:
        "Our students shine in their annual showcase, displaying months of dedicated training and artistic growth.",
      date: "March 2024",
      type: "image",
    },
    {
      id: "2",
      title: "RAD Ballet Examination",
      category: "competitions",
      image: "/theme/sissonne/assets/placeholder.svg",
      description:
        "Students achieving excellence in Royal Academy of Dance examinations with outstanding results.",
      date: "February 2024",
      type: "image",
    },
    {
      id: "3",
      title: "Jazz Class Highlights",
      category: "classes",
      image: "/theme/sissonne/assets/placeholder.svg",
      description:
        "Dynamic movements and expressive choreography in our CSTD Jazz program.",
      date: "January 2024",
      type: "video",
    },
    {
      id: "4",
      title: "International Dance Competition",
      category: "competitions",
      image: "/theme/sissonne/assets/placeholder.svg",
      description:
        "Our Elite team bringing home gold medals from regional dance competitions.",
      date: "December 2023",
      type: "image",
    },
    {
      id: "5",
      title: "Master Class with Elena Mikhailova",
      category: "events",
      image: "/theme/sissonne/assets/placeholder.svg",
      description:
        "Special workshop featuring classical ballet techniques from our principal instructor.",
      date: "November 2023",
      type: "image",
    },
    {
      id: "6",
      title: "Contemporary Fusion Performance",
      category: "performances",
      image: "/theme/sissonne/assets/placeholder.svg",
      description:
        "Innovative choreography blending classical and modern dance elements.",
      date: "October 2023",
      type: "video",
    },
  ];

  const filteredItems =
    selectedCategory === "all"
      ? galleryItems
      : galleryItems.filter((item) => item.category === selectedCategory);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredItems.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + filteredItems.length) % filteredItems.length,
    );
  };

  const currentItem = filteredItems[currentIndex];
  const currentCategoryInfo = categories.find(
    (cat) => cat.id === selectedCategory,
  );

  return (
    <div className="bg-background min-h-screen">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-dance-black via-stage-drama to-dance-black py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-dance-white mb-6">
              Performance <span className="text-dance-pink">Gallery</span>
            </h1>
            <p className="text-xl text-dance-gray-200 max-w-3xl mx-auto leading-relaxed">
              Witness the artistry, dedication, and growth of our dance
              community through stunning moments captured from performances,
              competitions, and special events.
            </p>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="bg-dance-white py-8 sticky top-0 z-40 border-b border-dance-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="overflow-x-auto">
            <div className="flex space-x-1 min-w-full">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setCurrentIndex(0);
                  }}
                  className={`flex-shrink-0 px-6 py-3 rounded-full font-medium transition-all duration-300 whitespace-nowrap ${
                    selectedCategory === category.id
                      ? "bg-dance-pink text-dance-white shadow-lg transform scale-105"
                      : "bg-dance-gray-100 text-dance-gray-800 hover:bg-dance-gray-200"
                  }`}
                >
                  <span className="font-semibold">{category.name}</span>
                  <span className="ml-2 text-sm opacity-75">
                    ({category.count})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Category Description */}
          {currentCategoryInfo && (
            <div className="text-center mt-4">
              <p className="text-dance-gray-600">
                {currentCategoryInfo.description}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Main Gallery Carousel */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredItems.length > 0 ? (
            <div className="relative">
              {/* Current Image/Video Display */}
              <div className="relative bg-dance-black rounded-3xl overflow-hidden shadow-2xl cursor-pointer" onClick={(e) => { e.stopPropagation(); nextSlide(); }}>
                <div className="aspect-video md:aspect-[21/9] relative group">
                  <img
                    src={currentItem.image}
                    alt={currentItem.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/80 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center px-6 text-center">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">{currentItem.title}</h3>
                      <p className="text-gray-200 max-w-2xl mx-auto">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.
                      </p>
                    </div>
                  </div>
                  {currentItem.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                      <button className="bg-dance-pink/90 text-dance-white p-4 rounded-full hover:bg-dance-pink transition-colors duration-200 pointer-events-auto">
                        <Play className="h-8 w-8" />
                      </button>
                    </div>
                  )}

                  {/* Navigation Arrows */}
                  {filteredItems.length > 1 && (
                    <>
                      <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-dance-black/50 hover:bg-dance-black/75 text-dance-white p-3 rounded-full transition-all duration-200 z-20"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-dance-black/50 hover:bg-dance-black/75 text-dance-white p-3 rounded-full transition-all duration-200 z-20"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </>
                  )}

                  {/* Image Overlay Info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-dance-black/80 to-transparent p-6 pointer-events-none">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl md:text-3xl font-bold text-dance-white mb-2">
                          {currentItem.title}
                        </h3>
                        <p className="text-dance-gray-200 text-lg max-w-2xl">
                          {currentItem.description}
                        </p>
                      </div>
                      {currentItem.date && (
                        <div className="flex items-center space-x-2 text-dance-pink">
                          <Calendar className="h-5 w-5" />
                          <span className="font-medium">
                            {currentItem.date}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Thumbnail Navigation */}
              {filteredItems.length > 1 && (
                <div className="mt-6 flex justify-center">
                  <div className="flex space-x-3 overflow-x-auto max-w-full pb-2">
                    {filteredItems.map((item, index) => (
                      <div
                        key={item.id}
                        className={`flex-shrink-0 relative rounded-lg overflow-hidden transition-all duration-300 cursor-pointer group ${
                          index === currentIndex
                            ? "ring-3 ring-dance-pink transform scale-105"
                            : "opacity-70 hover:opacity-100"
                        }`}
                        onClick={() => setCurrentIndex(index)}
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-20 h-12 md:w-24 md:h-16 object-cover"
                        />
                        {/* Thumbnail Hover Overlay */}
                        <div className="absolute inset-0 bg-dance-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center px-2 text-center pointer-events-none">
                          <p className="text-[10px] md:text-xs text-dance-white leading-snug">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                          </p>
                        </div>
                        {item.type === "video" && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <Play className="h-4 w-4 text-dance-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gallery Stats */}
              <div className="mt-8 text-center">
                <p className="text-dance-gray-600">
                  Viewing {currentIndex + 1} of {filteredItems.length}{" "}
                  {selectedCategory === "all"
                    ? "items"
                    : currentCategoryInfo?.name.toLowerCase()}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-dance-gray-400 mb-4">
                <Award className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-dance-gray-800 mb-2">
                No items in this category yet
              </h3>
              <p className="text-dance-gray-600">
                Check back soon for more content in this category.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Highlights */}
      <section className="py-16 bg-dance-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dance-black mb-4">
              Academy <span className="text-dance-pink">Highlights</span>
            </h2>
            <p className="text-xl text-dance-gray-700 max-w-2xl mx-auto">
              Celebrating our students' achievements and memorable moments
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-dance-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-center">
                <div className="bg-dance-pink/10 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                  <Award className="h-8 w-8 text-dance-pink" />
                </div>
                <h3 className="text-xl font-bold text-dance-black mb-2">
                  Competition Winners
                </h3>
                <p className="text-dance-gray-600 mb-4">
                  Our students have won over 50 awards in regional and
                  international competitions
                </p>
                <button
                  onClick={() => setSelectedCategory("competitions")}
                  className="text-dance-pink font-medium hover:underline"
                >
                  View Competition Gallery →
                </button>
              </div>
            </div>

            <div className="bg-dance-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-center">
                <div className="bg-dance-pink/10 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                  <Users className="h-8 w-8 text-dance-pink" />
                </div>
                <h3 className="text-xl font-bold text-dance-black mb-2">
                  Student Performances
                </h3>
                <p className="text-dance-gray-600 mb-4">
                  Annual recitals and showcases featuring our talented dancers
                </p>
                <button
                  onClick={() => setSelectedCategory("performances")}
                  className="text-dance-pink font-medium hover:underline"
                >
                  View Performance Gallery →
                </button>
              </div>
            </div>

            <div className="bg-dance-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-center">
                <div className="bg-dance-pink/10 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-dance-pink" />
                </div>
                <h3 className="text-xl font-bold text-dance-black mb-2">
                  Special Events
                </h3>
                <p className="text-dance-gray-600 mb-4">
                  Masterclasses, workshops, and special events with guest
                  instructors
                </p>
                <button
                  onClick={() => setSelectedCategory("events")}
                  className="text-dance-pink font-medium hover:underline"
                >
                  View Events Gallery →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
