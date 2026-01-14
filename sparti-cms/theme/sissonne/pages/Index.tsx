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

export default function Index() {
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

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Parent of Emma, 8 years",
      content:
        "Emma has blossomed at Sissonne. The teachers are incredibly nurturing while maintaining high standards. Her confidence has soared.",
      rating: 5,
    },
    {
      name: "Marcus Wong",
      role: "Student, Elite Program",
      content:
        "The Elite program challenged me beyond what I thought possible. I've grown as both a dancer and a person through this journey.",
      rating: 5,
    },
    {
      name: "Lisa Tan",
      role: "Parent of Rachel, 12 years",
      content:
        "Outstanding faculty and beautiful facilities. Rachel successfully gained DSA placement through their excellent preparation program.",
      rating: 5,
    },
  ];

  const faculty = [
    {
      name: "Elena Mikhailova",
      title: "Principal & Artistic Director",
      credentials: "Former Principal Dancer, Mariinsky Theatre",
      specialty: "Classical Ballet, RAD",
      image: "/theme/sissonne/assets/placeholder.svg",
    },
    {
      name: "James Richardson",
      title: "Contemporary Jazz Director",
      credentials: "CSTD Fellow, West End Performer",
      specialty: "Jazz, Musical Theatre",
      image: "/theme/sissonne/assets/placeholder.svg",
    },
    {
      name: "Mei Lin Zhang",
      title: "Performance Coordinator",
      credentials: "Singapore Dance Theatre Principal",
      specialty: "Elite Training, Competition",
      image: "/theme/sissonne/assets/placeholder.svg",
    },
  ];

  return (
    <div className="bg-background">
      {/* Hero Slider Section */}
      <HeroSlider />

      {/* Programs Section */}
      <section id="programs" className="py-20 bg-dance-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-dance-black mb-6">
              Discover Your{" "}
              <span className="text-dance-pink">Dance Journey</span>
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
                      <h3 className="text-3xl font-heading font-bold text-dance-pink">
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

                  <div className="relative group">
                    <div className="aspect-square bg-gradient-to-br from-dance-pink/20 to-dance-purple/20 rounded-3xl flex items-center justify-center">
                      <img
                        src={program.image}
                        alt={`${program.name} program`}
                        className="w-full h-full object-cover rounded-3xl"
                      />
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center px-6 text-center rounded-3xl">
                        <div>
                          <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                            {program.name}
                          </h3>
                          <p className="text-gray-200 text-sm md:text-base">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Integer nec odio. Praesent libero.
                          </p>
                        </div>
                      </div>
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
      <section id="book-trial" className="py-16 bg-white">
        <div className="px-8 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Left Side - Image */}
            <div className="w-full">
              <img
                src="https://static.wixstatic.com/media/6710cb_2ecd453ed2864a1f9c6b6ad9edad216a~mv2.jpg/v1/fill/w_1111,h_960,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/6710cb_2ecd453ed2864a1f9c6b6ad9edad216a~mv2.jpg"
                alt="Young ballet dancers at the barre"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right Side - Form */}
            <div className="w-full flex flex-col justify-center p-40">
              <div className="mb-8">
                <h3
                  className="text-2xl font-heading font-normal mb-6 text-dance-pink"
                >
                  BOOK A TRIAL
                </h3>
                <p className="text-gray-600 font-body text-sm leading-relaxed mb-6">
                  If you would like to book a trial, we'll be more than happy to
                  help. Please fill out the form below and we will get back to
                  you as soon as possible.
                </p>
              </div>

              <form className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Name"
                    className="w-full px-3 py-3 border border-gray-300 focus:border-gray-400 focus:outline-none font-body text-sm"
                  />
                </div>

                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full px-3 py-3 border border-gray-300 focus:border-gray-400 focus:outline-none font-body text-sm"
                  />
                </div>

                <div>
                  <select className="w-full px-3 py-3 border border-gray-300 focus:border-gray-400 focus:outline-none font-body text-sm appearance-none bg-white">
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
                    className="w-full px-3 py-3 border border-gray-300 focus:border-gray-400 focus:outline-none font-body text-sm"
                  />
                </div>

                <div>
                  <textarea
                    placeholder="Any other information you would like us to know..."
                    rows={4}
                    className="w-full px-3 py-3 border border-gray-300 focus:border-gray-400 focus:outline-none font-body text-sm resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-black text-white py-3 font-body font-medium text-sm hover:bg-gray-800 transition-colors duration-200"
                >
                  Submit
                </button>
              </form>
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
