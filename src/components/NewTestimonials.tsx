import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import { motion } from "framer-motion";

const testimonials = [
  {
    text: "GoSG's SEO strategies boosted our organic traffic by 400% in just 3 months. Our website now ranks #1 for our main keywords.",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    name: "Sarah Chen",
    role: "Marketing Director",
  },
  {
    text: "Their technical SEO audit revealed critical issues we didn't know existed. After fixes, our search rankings improved dramatically.",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    name: "Marcus Tan",
    role: "Business Owner",
  },
  {
    text: "GoSG's local SEO expertise helped us dominate Singapore search results. We're now the top choice in our area.",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    name: "Priya Sharma",
    role: "E-commerce Manager",
  },
  {
    text: "From page 5 to page 1 in Google in just 4 months. GoSG's SEO approach delivered exactly what they promised.",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    name: "David Lim",
    role: "CEO",
  },
  {
    text: "Their SEO content strategy doubled our organic leads. Every blog post now ranks and brings qualified traffic.",
    image: "https://randomuser.me/api/portraits/women/5.jpg",
    name: "Jennifer Wong",
    role: "Operations Manager",
  },
  {
    text: "GoSG's link building campaign increased our domain authority by 25 points. Our search visibility is now unmatched.",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
    name: "Michelle Ng",
    role: "Brand Manager",
  },
  {
    text: "Their keyword research uncovered high-value terms we missed. Now we rank for searches that actually convert customers.",
    image: "https://randomuser.me/api/portraits/men/7.jpg",
    name: "Alex Kumar",
    role: "Growth Manager",
  },
  {
    text: "GoSG's on-page SEO optimization made our site lightning fast and search-engine friendly. Rankings improved across the board.",
    image: "https://randomuser.me/api/portraits/women/8.jpg",
    name: "Lisa Tan",
    role: "Marketing Manager",
  },
  {
    text: "Their monthly SEO reports show clear progress. We've gone from zero organic traffic to 50,000 monthly visitors.",
    image: "https://randomuser.me/api/portraits/men/9.jpg",
    name: "Robert Lee",
    role: "Founder",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

const NewTestimonials = () => {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What our clients say
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See what our customers have to say about our SEO services and results.
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  );
};

export default NewTestimonials;