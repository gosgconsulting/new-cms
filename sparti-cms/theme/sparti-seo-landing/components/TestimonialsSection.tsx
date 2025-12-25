import React from 'react';

interface Testimonial {
  text: string;
  image: string;
  name: string;
  role: string;
}

interface TestimonialsColumnProps {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}

const TestimonialsColumn: React.FC<TestimonialsColumnProps> = ({
  className = '',
  testimonials,
  duration = 10
}) => {
  return (
    <div className={className}>
      <div 
        className="flex flex-col gap-6 pb-6 bg-background animate-slide-up"
        style={{
          animation: `slide-up ${duration}s linear infinite`
        }}
      >
        {[...Array(2)].map((_, index) => (
          <React.Fragment key={index}>
            {testimonials.map(({ text, image, name, role }, i) => (
              <div 
                className="p-10 rounded-3xl border shadow-lg shadow-primary/10 max-w-xs w-full glass bg-card/80 hover:bg-card/90 transition-all duration-300" 
                key={`${index}-${i}`}
              >
                <div className="text-foreground/90 leading-relaxed">{text}</div>
                <div className="flex items-center gap-2 mt-5">
                  <img
                    width={40}
                    height={40}
                    src={image}
                    alt={name}
                    className="h-10 w-10 rounded-full border-2 border-primary/20"
                  />
                  <div className="flex flex-col">
                    <div className="font-medium tracking-tight leading-5">{name}</div>
                    <div className="leading-5 opacity-60 tracking-tight text-sm">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const testimonials: Testimonial[] = [
  {
    text: "Sparti transformed our SEO strategy completely. Our organic traffic increased by 300% in just 3 months with their AI-powered content automation.",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    name: "Sarah Chen",
    role: "Marketing Director",
  },
  {
    text: "The automated article generation is incredible. We went from publishing 2 articles per week to 2 per day, and our search rankings skyrocketed.",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    name: "Marcus Rodriguez",
    role: "SEO Manager",
  },
  {
    text: "Best investment we made for our content strategy. The AI creates SEO-optimized articles that actually rank on page 1 of Google.",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    name: "Emily Johnson",
    role: "Content Strategist",
  },
  {
    text: "From zero to hero in search results. Sparti's automation helped us dominate our niche with consistent, high-quality SEO content.",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    name: "David Park",
    role: "Founder & CEO",
  },
  {
    text: "The keyword research and topic suggestions are spot-on. We're now ranking for keywords we never thought possible.",
    image: "https://randomuser.me/api/portraits/women/5.jpg",
    name: "Lisa Thompson",
    role: "Digital Marketing Lead",
  },
  {
    text: "Sparti made SEO accessible for our small team. We're competing with enterprise companies and winning in search results.",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
    name: "Rachel Davis",
    role: "Growth Manager",
  },
  {
    text: "The automated backlink generation is a game-changer. Our domain authority increased significantly within months.",
    image: "https://randomuser.me/api/portraits/men/7.jpg",
    name: "James Wilson",
    role: "SEO Consultant",
  },
  {
    text: "Finally, an SEO tool that actually delivers results. Our clients are seeing massive improvements in their search visibility.",
    image: "https://randomuser.me/api/portraits/women/8.jpg",
    name: "Amanda Foster",
    role: "Agency Owner",
  },
  {
    text: "The AI understands our brand voice perfectly. Every article feels like it was written by our team, but with perfect SEO optimization.",
    image: "https://randomuser.me/api/portraits/men/9.jpg",
    name: "Michael Chang",
    role: "Brand Manager",
  },
];

const TestimonialsSection: React.FC = () => {
  const firstColumn = testimonials.slice(0, 3);
  const secondColumn = testimonials.slice(3, 6);
  const thirdColumn = testimonials.slice(6, 9);

  return (
    <section className="bg-gradient-to-b from-background to-card/20 py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-gradient-to-r from-primary/10 to-transparent rounded-full blur-3xl animate-pulse animation-delay-1000" />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-gradient-to-l from-accent/10 to-transparent rounded-full blur-3xl animate-pulse animation-delay-2000" />
      </div>

      <div className="container z-10 mx-auto px-6">
        <div className="flex flex-col items-center justify-center max-w-[540px] mx-auto animate-fade-in">
          <div className="flex justify-center">
            <div className="border border-primary/20 py-2 px-6 rounded-full bg-primary/5 glass">
              <span className="text-primary font-medium">Testimonials</span>
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mt-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent text-center">
            What our users say
          </h2>
          <p className="text-center mt-6 opacity-75 text-lg text-muted-foreground max-w-lg">
            Join thousands of businesses growing their organic traffic with AI-powered SEO automation.
          </p>
        </div>

        <div className="flex justify-center gap-6 mt-16 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden animate-slide-up">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

