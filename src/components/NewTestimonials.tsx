import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import { motion } from "motion/react";

const testimonials = [
  {
    text: "GoSG transformed our digital marketing strategy. Their SEO expertise boosted our rankings significantly within just 3 months.",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    name: "Sarah Chen",
    role: "Marketing Director",
  },
  {
    text: "The website design team created exactly what we envisioned. Professional, modern, and perfectly represents our brand.",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    name: "Marcus Tan",
    role: "Business Owner",
  },
  {
    text: "Their social media management doubled our engagement. The content strategy is spot-on for our target audience.",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    name: "Priya Sharma",
    role: "E-commerce Manager",
  },
  {
    text: "GoSG's paid advertising campaigns delivered exceptional ROI. Our lead generation increased by 300% in 6 months.",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    name: "David Lim",
    role: "CEO",
  },
  {
    text: "Outstanding support and transparent reporting. They truly understand the Singapore market and deliver results.",
    image: "https://randomuser.me/api/portraits/women/5.jpg",
    name: "Jennifer Wong",
    role: "Operations Manager",
  },
  {
    text: "The comprehensive digital strategy exceeded our expectations. Professional team with deep industry knowledge.",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
    name: "Michelle Ng",
    role: "Brand Manager",
  },
  {
    text: "Their data-driven approach to digital marketing helped us understand our customers better and improve conversions.",
    image: "https://randomuser.me/api/portraits/men/7.jpg",
    name: "Alex Kumar",
    role: "Growth Manager",
  },
  {
    text: "GoSG delivered a complete digital transformation. From website to social media, everything works seamlessly together.",
    image: "https://randomuser.me/api/portraits/women/8.jpg",
    name: "Lisa Tan",
    role: "Marketing Manager",
  },
  {
    text: "Reliable, results-driven, and always available. GoSG has become an essential partner for our business growth.",
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
    <section className="bg-background my-20 relative">
      <div className="container z-10 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
        >
          <div className="flex justify-center">
            <div className="border py-1 px-4 rounded-lg">Testimonials</div>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-5">
            What our clients say
          </h2>
          <p className="text-center mt-5 opacity-75">
            See what our customers have to say about our digital marketing services.
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  );
};

export default NewTestimonials;