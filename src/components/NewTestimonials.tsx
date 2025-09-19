import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import { motion } from "framer-motion";

const testimonials = [
  {
    text: "Our organic traffic increased by 400% in just 4 months. We went from page 3 to ranking #1 for our main keywords and now get 50+ qualified leads monthly.",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    name: "Sarah Chen",
    role: "CEO, TechStart Solutions",
  },
  {
    text: "ROI of 300% within 6 months. GoSG's SEO strategy helped us capture high-intent traffic that converts 40% better than our paid ads.",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    name: "Marcus Tan",
    role: "Marketing Director, GreenTech",
  },
  {
    text: "From 500 to 15,000 monthly organic visitors. Our revenue from organic search grew by 250%. Best investment we've made for our business.",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    name: "Priya Sharma",
    role: "Founder, Local Services Pro",
  },
  {
    text: "We dominate our local market now. Ranking #1 for 25+ keywords and getting 80% of our customers from Google. Our competitors can't compete.",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    name: "David Lim",
    role: "Owner, Singapore Legal Firm",
  },
  {
    text: "Traffic increased 350% and conversion rate improved by 45%. The technical SEO audit alone was worth the entire investment.",
    image: "https://randomuser.me/api/portraits/women/5.jpg",
    name: "Jennifer Wong",
    role: "Operations Manager, E-commerce Store",
  },
  {
    text: "From invisible to industry leader. Now ranking above Fortune 500 companies for competitive keywords. Organic leads increased by 500%.",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
    name: "Michelle Ng",
    role: "VP Marketing, FinTech Startup",
  },
  {
    text: "12x return on investment in the first year. Our organic revenue went from $50K to $600K annually. GoSG's strategy transformed our business.",
    image: "https://randomuser.me/api/portraits/men/7.jpg",
    name: "Alex Kumar",
    role: "CEO, Manufacturing Company",
  },
  {
    text: "Competitor analysis and keyword strategy were game-changing. We outrank companies 10x our size and capture 70% market share online.",
    image: "https://randomuser.me/api/portraits/women/8.jpg",
    name: "Lisa Tan",
    role: "Director, Healthcare Clinic",
  },
  {
    text: "Page 1 rankings for 15 high-value keywords within 3 months. Our phone doesn't stop ringing with qualified prospects. Simply incredible results.",
    image: "https://randomuser.me/api/portraits/men/9.jpg",
    name: "Robert Lee",
    role: "Founder, Professional Services",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

const NewTestimonials = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Real SEO Results From Real Clients
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See the proven results our SEO strategies deliver for businesses like yours.
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