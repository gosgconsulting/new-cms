import {
  Award,
  Heart,
  Target,
  Users,
  Star,
  Trophy,
  CheckCircle,
} from "lucide-react";

export default function About() {
  const affiliations = [
    {
      name: "Royal Academy of Dance",
      logo: "https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg",
      description: "International dance education",
    },
    {
      name: "Commonwealth Society of Teachers of Dancing",
      logo: "https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg",
      description: "Professional dance standards",
    },
    {
      name: "Singapore Dance Teachers Association",
      logo: "https://images.pexels.com/photos/1181673/pexels-photo-1181673.jpeg",
      description: "Local dance community",
    },
    {
      name: "International Dance Organization",
      logo: "https://images.pexels.com/photos/267371/pexels-photo-267371.jpeg",
      description: "Global dance excellence",
    },
  ];

  const specialties = [
    {
      icon: <Award className="h-8 w-8" />,
      title: "International Curriculum",
      description:
        "We follow globally recognized syllabi including RAD Ballet and CSTD Jazz, ensuring our students receive world-class training that opens doors internationally.",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Expert Teachers",
      description:
        "Our instructors are professionally trained dancers and certified teachers with extensive performance and teaching experience from renowned institutions worldwide.",
    },
    {
      icon: <Trophy className="h-8 w-8" />,
      title: "Proven Success",
      description:
        "With a 98% DSA success rate and numerous competition wins, our students consistently achieve excellence in both artistic development and academic opportunities.",
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Nurturing Environment",
      description:
        "We create a supportive community where students of all levels can grow, building confidence, discipline, and lifelong friendships through the art of dance.",
    },
  ];

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-dance-black via-stage-drama to-dance-black py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-dance-white mb-6">
              About Sissonne
            </h1>
            <p className="text-xl font-body font-light text-dance-gray-200 max-w-3xl mx-auto leading-relaxed">
              Discover the story behind Singapore's premier dance academy and
              our unwavering commitment to nurturing artistic excellence and
              personal growth.
            </p>
          </div>
        </div>
      </section>

      {/* Brief History */}
      <section className="py-20 bg-dance-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-dance-black mb-6">
                Our Journey
              </h2>
              <div className="space-y-6 text-lg font-body font-light text-dance-gray-700 leading-relaxed">
                <p>
                  Founded in 2009, Sissonne Dance Academy began as a small
                  studio with a big dream: to provide Singapore's young dancers
                  with access to world-class training that rivals the finest
                  international institutions.
                </p>
                <p>
                  Named after the classical ballet jump that embodies grace,
                  power, and precision, Sissonne has grown from serving 20
                  students to becoming Singapore's most respected dance academy,
                  nurturing over 500 graduates who have gone on to achieve
                  remarkable success in dance and beyond.
                </p>
                <p>
                  Our journey has been marked by continuous growth,
                  international recognition, and most importantly, the countless
                  moments of joy, achievement, and transformation we've
                  witnessed in our students' lives.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-dance-gray-600 mb-2">
                    15+
                  </div>
                  <div className="text-sm font-body font-light text-dance-gray-600">
                    Years of excellence
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-dance-gray-600 mb-2">
                    500+
                  </div>
                  <div className="text-sm font-body font-light text-dance-gray-600">
                    Students graduated
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-dance-gray-600 mb-2">
                    50+
                  </div>
                  <div className="text-sm font-body font-light text-dance-gray-600">
                    Awards won
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-linear-to-br from-dance-pink/20 to-dance-purple/20 rounded-3xl overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/8923183/pexels-photo-8923183.jpeg"
                  alt="Sissonne Dance Academy History"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-dance-pink text-dance-white p-6 rounded-2xl shadow-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold">2009</div>
                  <div className="text-sm">Founded</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20 bg-dance-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-dance-black mb-6">
              Meet Our Founder
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-dance-white rounded-3xl shadow-xl p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="relative">
                  <div className="aspect-square bg-gradient-to-br from-dance-pink/20 to-dance-purple/20 rounded-2xl overflow-hidden">
                    <img
                      src="https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg"
                      alt="Elena Mikhailova - Founder"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute top-4 left-4 bg-dance-pink text-dance-white px-3 py-1 rounded-full text-sm font-medium">
                    Founder & Artistic Director
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl md:text-3xl font-heading font-bold text-dance-black mb-4">
                    Elena Mikhailova
                  </h3>
                  <p className="font-body font-light text-dance-gray-600 mb-6">
                    Former Principal Dancer, Mariinsky Theatre
                  </p>

                  <div className="space-y-4 font-body font-light text-dance-gray-700 leading-relaxed">
                    <p>
                      Elena brings over 20 years of professional dance
                      experience and a passion for nurturing young talent. As a
                      former principal dancer with the prestigious Mariinsky
                      Theatre in St. Petersburg, she has performed on the
                      world's most renowned stages.
                    </p>
                    <p>
                      Her vision for Sissonne was born from a desire to share
                      the transformative power of dance with Singapore's youth,
                      combining rigorous technical training with artistic
                      expression and personal development.
                    </p>
                    <p>
                      Under her leadership, Sissonne has become synonymous with
                      excellence, compassion, and the belief that every student
                      has the potential to achieve greatness through dedication
                      and proper guidance.
                    </p>
                  </div>

                  <div className="mt-6 flex items-center space-x-4">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-5 w-5 text-dance-gray-600 fill-current"
                        />
                      ))}
                    </div>
                    <span className="font-body font-light text-dance-gray-600 text-sm">
                      Excellence in Teaching
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-dance-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Mission */}
            <div className="text-center lg:text-left">
              <div className="bg-dance-gray-100 rounded-full p-4 w-16 h-16 mx-auto lg:mx-0 mb-6">
                <Target className="h-8 w-8 text-dance-gray-600" />
              </div>
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-dance-black mb-6">
                Our Mission
              </h2>
              <p className="text-lg font-body font-light text-dance-gray-700 leading-relaxed mb-8">
                To inspire and nurture the next generation of dancers through
                exceptional instruction, international standards, and a
                supportive community that celebrates both artistic achievement
                and personal growth.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 justify-center lg:justify-start">
                  <CheckCircle className="h-5 w-5 text-dance-gray-600 shrink-0" />
                  <span className="text-dance-gray-700">
                    Excellence in dance education
                  </span>
                </div>
                <div className="flex items-center space-x-3 justify-center lg:justify-start">
                  <CheckCircle className="h-5 w-5 text-dance-gray-600 shrink-0" />
                  <span className="text-dance-gray-700">
                    Character development through dance
                  </span>
                </div>
                <div className="flex items-center space-x-3 justify-center lg:justify-start">
                  <CheckCircle className="h-5 w-5 text-dance-gray-600 shrink-0" />
                  <span className="text-dance-gray-700">
                    Inclusive and supportive environment
                  </span>
                </div>
              </div>
            </div>

            {/* Vision */}
            <div className="text-center lg:text-left">
              <div className="bg-dance-gray-100 rounded-full p-4 w-16 h-16 mx-auto lg:mx-0 mb-6">
                <Star className="h-8 w-8 text-dance-gray-600" />
              </div>
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-dance-black mb-6">
                Our Vision
              </h2>
              <p className="text-lg font-body font-light text-dance-gray-700 leading-relaxed mb-8">
                To be Singapore's leading dance academy, recognized
                internationally for our commitment to artistic excellence,
                innovation in dance education, and the remarkable achievements
                of our students and graduates.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 justify-center lg:justify-start">
                  <CheckCircle className="h-5 w-5 text-dance-gray-600 shrink-0" />
                  <span className="text-dance-gray-700">
                    Regional leader in dance education
                  </span>
                </div>
                <div className="flex items-center space-x-3 justify-center lg:justify-start">
                  <CheckCircle className="h-5 w-5 text-dance-gray-600 shrink-0" />
                  <span className="text-dance-gray-700">
                    International recognition and partnerships
                  </span>
                </div>
                <div className="flex items-center space-x-3 justify-center lg:justify-start">
                  <CheckCircle className="h-5 w-5 text-dance-gray-600 shrink-0" />
                  <span className="text-dance-gray-700">
                    Alumni success in dance and life
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Are Special */}
      <section className="py-20 bg-dance-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-dance-black mb-6">
              Why Choose Sissonne?
            </h2>
            <p className="text-xl font-body font-light text-dance-gray-700 max-w-3xl mx-auto leading-relaxed">
              Discover what sets us apart as Singapore's premier dance academy
              and why families trust us with their children's artistic journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {specialties.map((specialty, index) => (
              <div
                key={index}
                className="bg-dance-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="bg-dance-gray-100 rounded-full p-4 w-16 h-16 mb-6">
                  <div className="text-dance-gray-600">{specialty.icon}</div>
                </div>
                <h3 className="text-xl font-heading font-bold text-dance-black mb-4">
                  {specialty.title}
                </h3>
                <p className="font-body font-light text-dance-gray-700 leading-relaxed">
                  {specialty.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Affiliated Organizations */}
      <section className="py-20 bg-dance-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-dance-black mb-6">
              Our Affiliations
            </h2>
            <p className="text-xl font-body font-light text-dance-gray-700 max-w-3xl mx-auto leading-relaxed">
              We are proud to be affiliated with internationally recognized
              dance organizations that uphold the highest standards in dance
              education.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {affiliations.map((org, index) => (
              <div key={index} className="text-center group">
                <div className="bg-dance-gray-50 rounded-2xl p-8 mb-4 group-hover:bg-dance-pink/5 transition-colors duration-300">
                  <img
                    src={org.logo}
                    alt={org.name}
                    className="w-20 h-20 mx-auto object-contain mb-4"
                  />
                  <h3 className="font-heading font-bold text-dance-black mb-2 group-hover:text-dance-gray-600 transition-colors duration-300">
                    {org.name}
                  </h3>
                  <p className="text-sm text-dance-gray-600">
                    {org.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="bg-dance-gray-100 rounded-2xl p-8">
              <h3 className="text-2xl font-heading font-bold text-dance-black mb-4">
                Certified Excellence
              </h3>
              <p className="text-dance-gray-700 leading-relaxed max-w-2xl mx-auto">
                Our affiliations with these prestigious organizations ensure
                that our curriculum, teaching standards, and examination
                processes meet international benchmarks, giving our students
                globally recognized qualifications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-linear-to-br from-dance-pink via-dance-rose to-dance-purple">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-handwriting font-medium text-dance-black mb-6">
            Join The Sissonne Family
          </h2>
          <p className="text-xl font-body font-light text-dance-black/80 mb-8 leading-relaxed">
            Experience the difference that expert instruction, international
            standards, and a nurturing community can make in your dance journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-dance-pink text-dance-white px-8 py-4 rounded-full font-button font-medium text-lg hover:bg-dance-pink/90 transition-all duration-300 transform hover:scale-105 shadow-xl">
              Book your trial class
            </button>
            <button className="bg-dance-black text-dance-white px-8 py-4 rounded-full font-button font-medium text-lg hover:bg-dance-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg">
              Schedule a tour
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
