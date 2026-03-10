import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Teacher {
  id: number;
  name: string;
  title: string;
  specialties: string[];
  experience: string;
  image: string;
  description: string;
}

export function FacultySlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const teachers: Teacher[] = [
    {
      id: 1,
      name: "Gwee Poh Lin",
      title: "Principal & Artistic Director",
      specialties: [
        "Ballet",
        "Classical Technique",
        "Performance Coaching",
      ],
      experience: "20+ years",
      image:
        "https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg",
      description:
        "Leading our academy with passion and expertise, bringing world-class ballet education to Singapore with a focus on technical excellence and artistic expression.",
    },
    {
      id: 2,
      name: "Jessica Shi",
      title: "Senior Ballet Instructor",
      specialties: ["Ballet", "Pointe Work", "Youth Development"],
      experience: "15+ years",
      image:
        "https://images.pexels.com/photos/11212163/pexels-photo-11212163.jpeg",
      description:
        "Dedicated to nurturing young dancers with patience and precision, specializing in foundational technique and building confidence in every student.",
    },
    {
      id: 3,
      name: "Delia",
      title: "Contemporary & Jazz Instructor",
      specialties: ["Jazz CSTD", "Contemporary", "Musical Theatre"],
      experience: "12+ years",
      image:
        "https://images.pexels.com/photos/3587320/pexels-photo-3587320.jpeg",
      description:
        "Bringing energy and creativity to every class, inspiring students to express themselves through dynamic movement and contemporary dance styles.",
    },
    {
      id: 4,
      name: "Maryna",
      title: "Elite Program Director",
      specialties: ["Competition Training", "Advanced Ballet", "Performance"],
      experience: "18+ years",
      image:
        "https://images.pexels.com/photos/33426874/pexels-photo-33426874.jpeg",
      description:
        "Guiding our most dedicated students toward professional excellence, with extensive experience in competition preparation and advanced technique.",
    },
    {
      id: 5,
      name: "Azizi",
      title: "DSA Specialist",
      specialties: [
        "DSA Preparation",
        "Portfolio Development",
        "Audition Coaching",
      ],
      experience: "10+ years",
      image:
        "https://images.pexels.com/photos/5150478/pexels-photo-5150478.jpeg",
      description:
        "Expert in preparing students for Direct School Admission, providing comprehensive support for auditions and portfolio development.",
    },
  ];

  // Auto-rotation effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % teachers.length);
    }, 8000); // Change slide every 8 seconds

    return () => clearInterval(timer);
  }, [teachers.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % teachers.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + teachers.length) % teachers.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const currentTeacher = teachers[currentSlide];

  return (
    <section id="faculty" className="py-20 bg-dance-black relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-dance-white mb-6">
            World-Class Teachers
          </h2>
          <p className="text-xl font-body font-light text-dance-gray-200 max-w-3xl mx-auto leading-relaxed">
            Learn from internationally acclaimed artists and educators who bring
            decades of professional experience to inspire and guide your
            journey.
          </p>
        </div>

        {/* Faculty Slider */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 text-dance-white hover:text-dance-pink transition-all duration-300"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 text-dance-white hover:text-dance-pink transition-all duration-300"
          >
            <ChevronRight className="h-8 w-8" />
          </button>

          {/* Teacher Content */}
          <div className="mx-8">
            <div className="bg-dance-gray-900 rounded-3xl p-8 md:p-12 shadow-2xl hover:shadow-3xl transition-all duration-500 group">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                {/* Teacher Details - Left Side */}
                <div className="order-2 md:order-1">
                  <h3 className="text-3xl md:text-4xl font-body font-bold text-dance-white mb-2">
                    {currentTeacher.name}
                  </h3>
                  <p className="text-dance-pink font-medium text-lg mb-2">
                    {currentTeacher.title}
                  </p>
                  <div className="mb-6">
                    <span className="bg-dance-pink text-dance-white px-3 py-1 rounded-full text-sm font-medium">
                      {currentTeacher.experience}
                    </span>
                  </div>

                  <p className="font-body font-light text-dance-gray-200 leading-relaxed mb-8">
                    {currentTeacher.description}
                  </p>

                  <div className="mb-8">
                    <h4 className="font-body font-medium text-dance-white mb-4">
                      Specializations:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {currentTeacher.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="bg-dance-pink/20 text-dance-pink px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Teacher Image - Right Side */}
                <div className="order-1 md:order-2 relative">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-500">
                    <img
                      src={currentTeacher.image}
                      alt={currentTeacher.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dance-pink/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center mt-12 space-x-3">
            {teachers.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-dance-pink scale-125"
                    : "bg-dance-white/50 hover:bg-dance-white/80"
                }`}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
