import { motion } from "framer-motion";
import { Search, FileText, Link2 } from "lucide-react";
import { Card } from "@/components/ui/card";

const WhatIsSEOCards = () => {
  const cards = [
    {
      icon: Search,
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      title: "Keywords Research",
      subtitle: "Target",
      gradientBar: "from-purple-500 via-brandPurple to-brandTeal",
    },
    {
      icon: FileText,
      iconBg: "bg-teal-100 dark:bg-teal-900/30",
      iconColor: "text-teal-600 dark:text-teal-400",
      title: "SEO Articles",
      subtitle: "Publish",
      gradientBar: "from-teal-500 via-brandTeal to-green-500",
    },
    {
      icon: Link2,
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-600 dark:text-amber-400",
      title: "Backlinks",
      subtitle: "Grow",
      gradientBar: "from-amber-500 via-coral to-orange-500",
    },
  ];

  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-6"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            <span className="text-foreground">SEO is </span>
            <span className="bg-gradient-to-r from-brandPurple via-purple-500 to-brandTeal bg-clip-text text-transparent">
              more important
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-teal-500 bg-clip-text text-transparent">
              than
            </span>{" "}
            <span className="bg-gradient-to-r from-teal-500 to-green-500 bg-clip-text text-transparent">
              ever
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground">
            If you're not ranking, you're invisible.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 text-center space-y-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                {/* Icon */}
                <div className="flex justify-center">
                  <div className={`w-20 h-20 rounded-2xl ${card.iconBg} flex items-center justify-center`}>
                    <card.icon className={`w-10 h-10 ${card.iconColor}`} strokeWidth={2} />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-foreground">
                  {card.title}
                </h3>

                {/* Subtitle */}
                <p className="text-muted-foreground text-lg">
                  {card.subtitle}
                </p>

                {/* Gradient Bar */}
                <div className="pt-4">
                  <div className={`h-1.5 w-24 mx-auto rounded-full bg-gradient-to-r ${card.gradientBar}`}></div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatIsSEOCards;
