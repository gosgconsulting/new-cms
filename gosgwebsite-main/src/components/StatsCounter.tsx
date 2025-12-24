
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, TrendingUp, Award } from "lucide-react";

const StatsCounter = () => {
  const stats = [
    {
      value: "90%",
      label: "of clients report positive results within the first month",
      color: "bg-pink-500",
      icon: <TrendingUp className="h-6 w-6 text-white" />
    },
    {
      value: "8x",
      label: "average ROI on marketing campaigns",
      color: "bg-yellow-400",
      icon: <BarChart3 className="h-6 w-6 text-white" />
    },
    {
      value: "24/7",
      label: "client support and campaign monitoring",
      color: "bg-teal-500",
      icon: <Award className="h-6 w-6 text-white" />
    }
  ];

  return (
    <section className="py-20 px-4 bg-white dark:bg-slate-900 relative">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column: Text content */}
          <motion.div
            className="max-w-xl"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="px-3 py-1 bg-coral/20 text-coral text-xs font-medium rounded-full">
                SUCCESS STORIES
              </div>
              <div className="px-3 py-1 bg-coral/20 text-coral text-xs font-medium rounded-full">
                REAL METRICS
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-white">
              Our Results Speak Volumes
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              At GO SG, we deliver measurable outcomes through strategic digital marketing. 
              Our clients consistently see significant improvements in key performance metrics, 
              driving sustainable business growth and online success.
            </p>

            <div className="divider"></div>

            <p className="text-gray-600 dark:text-gray-300">
              From increased organic traffic to higher conversion rates, 
              our data-driven approach ensures that every campaign delivers 
              a meaningful return on investment. We don't just promise results—we deliver them.
            </p>
          </motion.div>

          {/* Right column: Stats cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-secondary/50 border-0 overflow-visible p-6 rounded-xl">
              <CardContent className="p-0 space-y-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.15 }}
                    className={`${stat.color} text-white rounded-lg p-6 flex items-center shadow-lg`}
                  >
                    <div className="bg-black/20 p-3 rounded-lg mr-4">
                      {stat.icon}
                    </div>
                    <div>
                      <div className="text-3xl md:text-4xl font-bold flex items-baseline">
                        <span>{stat.value.split('x')[0]}</span>
                        {stat.value.includes('x') && <span className="text-2xl">x</span>}
                      </div>
                      <p className="font-medium text-white/90">{stat.label}</p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default StatsCounter;
