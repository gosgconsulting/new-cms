import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Play,
  Star,
  Award,
  Users,
  Calendar,
  ArrowRight,
  Phone,
  Mail,
  CheckCircle,
  MapPin,
  Clock,
  Trophy,
} from "lucide-react";
import { HeroSlider } from "../components/HeroSlider";
import { TestimonialSlider } from "../components/TestimonialSlider";
import { FacultySlider } from "../components/FacultySlider";
import { GallerySlider } from "../components/GallerySlider";

export default function Lora() {
  const [selectedProgram, setSelectedProgram] = useState("ballet");

  const programs = [
    {
      id: "ballet",
      name: "Ballet",
      level: "All Levels",
      description:
        "Classical ballet training following the Royal Academy of Dance curriculum, building grace, technique, and artistry.",
      features: [
        "RAD Certified Curriculum",
        "International Standards",
        "Performance Opportunities",
        "Exam Preparation",
      ],
      ageRange: "3-18 years",
      duration: "60-90 minutes",
      image:
        "https://images.pexels.com/photos/8935214/pexels-photo-8935214.jpeg",
    },
    {
      id: "jazz",
      name: "Jazz CSTD",
      level: "Beginner to Advanced",
      description:
        "Contemporary jazz dance following CSTD methodology, emphasizing rhythm, style, and dynamic movement.",
      features: [
        "CSTD Certified Training",
        "Modern Techniques",
        "Musical Theatre Integration",
        "Competition Prep",
      ],
      ageRange: "6-18 years",
      duration: "60-75 minutes",
      image:
        "https://images.pexels.com/photos/11483436/pexels-photo-11483436.jpeg",
    },
    {
      id: "elite",
      name: "Elite Performance",
      level: "Advanced",
      description:
        "Intensive training for serious dancers preparing for professional opportunities and competitions.",
      features: [
        "Master Class Training",
        "Competition Teams",
        "Professional Mentorship",
        "Performance Showcase",
      ],
      ageRange: "12-18 years",
      duration: "90-120 minutes",
      image:
        "https://images.pexels.com/photos/1238980/pexels-photo-1238980.jpeg",
    },
    {
      id: "dsa",
      name: "DSA Preparation",
      level: "Intermediate to Advanced",
      description:
        "Specialized program preparing students for Direct School Admission through dance excellence.",
      features: [
        "DSA Focused Curriculum",
        "Portfolio Development",
        "Interview Preparation",
        "School Placement Support",
      ],
      ageRange: "10-16 years",
      duration: "90 minutes",
      image:
        "https://images.pexels.com/photos/7319717/pexels-photo-7319717.jpeg",
    },
  ];

  return (
    <div
      className="bg-background"
      style={{ fontFamily: "'Work Sans', sans-serif" }}
    >
      {/* Global Font Override */}
      <style>{`
        .font-heading { font-family: 'Lora', serif !important; }
        .font-body { font-family: 'Work Sans', sans-serif !important; }
        h1, h2, h3, h4, h5, h6 { font-family: 'Lora', serif !important; }
        body { font-family: 'Work Sans', sans-serif !important; }
        p, span, div:not([class*="font-heading"]) { font-family: 'Work Sans', sans-serif !important; }
      `}</style>

      {/* Hero Slider Section */}
      <HeroSlider />

      {/* Programs Section */}
      <section id="programs" className="py-20 bg-dance-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-2xl md:text-3xl font-bold text-dance-black mb-6"
              style={{ fontFamily: "'Lora', serif" }}
            >
              Discover Your Dance Journey
            </h2>
            <p className="text-xl font-body font-light text-dance-gray-800 max-w-3xl mx-auto leading-relaxed">
              From classical ballet to contemporary jazz, our comprehensive
              programs are designed to nurture talent at every level with
              internationally recognized curricula.
            </p>
          </div>

          {/* Program Selector */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {programs.map((program) => (
              <button
                key={program.id}
                onClick={() => setSelectedProgram(program.id)}
                className={`px-6 py-3 rounded-full font-button font-medium transition-all duration-300 ${
                  selectedProgram === program.id
                    ? "bg-dance-pink text-dance-white shadow-lg transform scale-105"
                    : "bg-dance-white text-dance-gray-800 hover:bg-dance-pink/10 hover:text-dance-pink border border-dance-gray-200"
                }`}
              >
                {program.name}
              </button>
            ))}
          </div>

          {/* Selected Program Details */}
          {programs.map((program) => (
            <div
              key={program.id}
              className={`transition-all duration-500 ${
                selectedProgram === program.id
                  ? "opacity-100"
                  : "opacity-0 hidden"
              }`}
            >
              <div className="bg-dance-white rounded-3xl shadow-xl p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <h3
                        className="text-3xl font-bold text-dance-pink"
                        style={{ fontFamily: "'Lora', serif" }}
                      >
                        {program.name}
                      </h3>
                      <span className="bg-dance-gray-100 text-dance-black px-3 py-1 rounded-full text-sm font-medium">
                        {program.level}
                      </span>
                    </div>
                    <p className="text-lg font-body font-light text-dance-gray-700 mb-8 leading-relaxed">
                      {program.description}
                    </p>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-dance-gray-600" />
                        <span className="font-body font-light text-dance-gray-700">
                          {program.ageRange}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-dance-gray-600" />
                        <span className="font-body font-light text-dance-gray-700">
                          {program.duration}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-8">
                      {program.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3"
                        >
                          <CheckCircle className="h-5 w-5 text-dance-gray-600 flex-shrink-0" />
                          <span className="font-body font-light text-dance-gray-700">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button className="bg-dance-pink text-dance-white px-8 py-3 rounded-full font-button font-medium hover:bg-dance-pink/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                      Learn more
                    </button>
                  </div>

                  <div className="relative">
                    <div className="aspect-square bg-gradient-to-br from-dance-pink/20 to-dance-purple/20 rounded-3xl flex items-center justify-center">
                      <img
                        src={program.image}
                        alt={`${program.name} program`}
                        className="w-full h-full object-cover rounded-3xl"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Faculty Slider Section */}
      <FacultySlider />

      {/* Testimonials Slider Section */}
      <TestimonialSlider />

      {/* Gallery Section */}
      <GallerySlider />

      {/* Trial Class CTA Section */}
      <section className="py-20 bg-gradient-to-br from-dance-gray-50 to-dance-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-2xl md:text-3xl font-bold text-dance-black mb-6"
              style={{ fontFamily: "'Lora', serif" }}
            >
              Begin Your Dance Journey Today
            </h2>
            <p className="text-xl font-body font-light text-dance-gray-700 leading-relaxed max-w-3xl mx-auto">
              Experience the Sissonne difference with a complimentary trial
              class. Connect with us and discover which program ignites your
              passion for dance.
            </p>
          </div>

          {/* Contact Form with Image and Form Layout */}
          <div className="max-w-7xl mx-auto">
            <div className="bg-dance-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Left Side - Image */}
                <div className="relative lg:h-auto min-h-[500px]">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2F2c61eb265eb24a048e03efd907356cec%2Fb803a3cb614d42e9bbce8e443068564a?format=webp&width=800"
                    alt="Young dancers in ballet attire"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-dance-pink/20 to-dance-purple/20"></div>
                </div>

                {/* Right Side - Form */}
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="mb-8">
                    <h3
                      className="text-3xl lg:text-4xl font-bold text-dance-black mb-4"
                      style={{ fontFamily: "'Lora', serif" }}
                    >
                      Book A Trial
                    </h3>
                    <p className="text-dance-gray-700 font-body font-light leading-relaxed">
                      If you would like to book a trial, we'd be more than happy
                      to help. Please fill out the form below and we will get
                      back to you as soon as possible.
                    </p>
                  </div>

                  <form className="space-y-6">
                    <div>
                      <input
                        type="text"
                        placeholder="Name"
                        className="w-full px-4 py-4 rounded-lg border border-dance-gray-200 focus:border-dance-pink focus:outline-none font-body transition-colors duration-300"
                      />
                    </div>

                    <div>
                      <input
                        type="email"
                        placeholder="Email"
                        className="w-full px-4 py-4 rounded-lg border border-dance-gray-200 focus:border-dance-pink focus:outline-none font-body transition-colors duration-300"
                      />
                    </div>

                    <div>
                      <select className="w-full px-4 py-4 rounded-lg border border-dance-gray-200 focus:border-dance-pink focus:outline-none font-body transition-colors duration-300 appearance-none bg-white">
                        <option value="">Class</option>
                        <option value="ballet-rad">Ballet</option>
                        <option value="jazz-cstd">Jazz CSTD</option>
                        <option value="elite">Elite Performance</option>
                        <option value="dsa">DSA Preparation</option>
                        <option value="adult">Adult Classes</option>
                      </select>
                    </div>

                    <div>
                      <input
                        type="date"
                        placeholder="Date of Birth"
                        className="w-full px-4 py-4 rounded-lg border border-dance-gray-200 focus:border-dance-pink focus:outline-none font-body transition-colors duration-300"
                      />
                    </div>

                    <div>
                      <textarea
                        placeholder="Any other information you would like us to know..."
                        rows={4}
                        className="w-full px-4 py-4 rounded-lg border border-dance-gray-200 focus:border-dance-pink focus:outline-none font-body transition-colors duration-300 resize-none"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-dance-black text-dance-white py-4 rounded-lg font-button font-medium text-lg hover:bg-dance-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      Submit
                    </button>
                  </form>

                  {/* Contact Information */}
                  <div className="mt-8 pt-8 border-t border-dance-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <a
                        href="tel:+6561234567"
                        className="flex items-center space-x-2 text-dance-gray-700 hover:text-dance-pink transition-colors duration-300"
                      >
                        <Phone className="h-4 w-4" />
                        <span>+65 6123 4567</span>
                      </a>
                      <a
                        href="https://wa.me/6561234567"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-dance-gray-700 hover:text-dance-pink transition-colors duration-300"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                        </svg>
                        <span>WhatsApp Us</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Follow Us Section */}
          <div className="text-center mt-16">
            <h3
              className="text-2xl font-bold text-dance-black mb-6"
              style={{ fontFamily: "'Lora', serif" }}
            >
              Follow Us
            </h3>
            <div className="flex justify-center space-x-6">
              <a
                href="#"
                className="bg-dance-pink text-dance-white p-4 rounded-full hover:bg-dance-purple transition-colors duration-300"
              >
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="#"
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-full hover:from-purple-600 hover:to-pink-600 transition-colors duration-300"
              >
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-0">
        <div className="w-full">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d255281.19034024935!2d103.67943073437499!3d1.352083!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da11238a8b9375%3A0x887869cf52abf5c4!2sSingapore!5e0!3m2!1sen!2ssg!4v1635000000000!5m2!1sen!2ssg"
            width="100%"
            height="500"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Sissonne Dance Academy Location"
          ></iframe>
        </div>
      </section>
    </div>
  );
}
