
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const AwardsBadges = () => {
  const awards = [
    { title: "GROWING BUSINESSES ONLINE", category: "Google" },
    { title: "BEST E-COMMERCE CAMPAIGN", category: "Marketing Excellence" },
    { title: "BEST OVERALL SEO INITIATIVE", category: "SEO Awards" },
    { title: "DIGITAL MARKETING", category: "Marketing Excellence" }
  ];

  return (
    <section className="py-16 px-4 bg-deepBlue">
      <div className="container mx-auto">
        <motion.div 
          className="flex flex-wrap justify-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {awards.map((award, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card/30 backdrop-blur-sm border border-white/10 rounded-lg p-4 w-64"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center p-2 bg-coral/20 rounded-full mb-3">
                  <CheckCircle className="h-5 w-5 text-coral" />
                </div>
                <div className="uppercase text-xs tracking-wider text-gray-400 mb-1">{award.category}</div>
                <div className="font-bold text-sm">{award.title}</div>
                <div className="uppercase text-xs mt-2 text-coral">WINNER</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AwardsBadges;
