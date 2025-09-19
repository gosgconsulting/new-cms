import { motion } from "framer-motion";
import { TrendingUp, Eye, MousePointer, BarChart3 } from "lucide-react";

const seoResults = [
  {
    id: 1,
    industry: "LEADING HEALTHCARE PROVIDER",
    growth: "+382% increase in clicks within 12 months",
    hasScreenshot: true,
    screenshotUrl: "/assets/seo-results-1.png",
    metrics: [
      { label: "Total clicks", value: "3.73M", icon: MousePointer, gradient: true },
      { label: "Total impressions", value: "68.4M", icon: Eye, gradient: true },
      { label: "Average CTR", value: "5.4%", icon: BarChart3 },
      { label: "Average position", value: "10.2", icon: TrendingUp }
    ]
  },
  {
    id: 2,
    industry: "E-COMMERCE RETAILER",
    growth: "+215% increase in organic traffic within 8 months", 
    metrics: [
      { label: "Total clicks", value: "2.1M", icon: MousePointer, gradient: true },
      { label: "Total impressions", value: "45.8M", icon: Eye, gradient: true },
      { label: "Average CTR", value: "4.6%", icon: BarChart3 },
      { label: "Average position", value: "8.7", icon: TrendingUp }
    ]
  },
  {
    id: 3,
    industry: "TECH STARTUP",
    growth: "+540% increase in leads within 6 months",
    metrics: [
      { label: "Total clicks", value: "1.2M", icon: MousePointer, gradient: true },
      { label: "Total impressions", value: "28.5M", icon: Eye, gradient: true },
      { label: "Average CTR", value: "4.2%", icon: BarChart3 },
      { label: "Average position", value: "12.4", icon: TrendingUp }
    ]
  }
];

const SEOResultsSlider = () => {
  // Show only the first slide for now
  const currentResult = seoResults[0];

  return (
    <div className="relative w-full h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          We Implement Traffic-Increasing SEO Techniques
        </h3>
        <p className="text-gray-600">
          Our methods increase traffic, conversions and sales.
        </p>
      </div>

      {/* Content */}
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Industry & Growth */}
          <div className="mb-6">
            <div className="text-sm font-semibold text-teal-600 mb-2">
              {currentResult.industry}
            </div>
            <div className="text-lg font-bold text-gray-900">
              {currentResult.growth}
            </div>
          </div>

          {/* Screenshot or Metrics */}
          {currentResult.hasScreenshot ? (
            <div className="mb-6">
              <img 
                src={currentResult.screenshotUrl}
                alt={`SEO results for ${currentResult.industry}`}
                className="w-full rounded-lg border border-gray-200 shadow-sm"
              />
            </div>
          ) : (
            <>
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {currentResult.metrics.map((metric, index) => {
                  const Icon = metric.icon;
                  return (
                    <motion.div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        metric.gradient
                          ? "bg-gradient-to-r from-brandPurple to-purple-600 text-white border-purple-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {metric.label}
                        </span>
                      </div>
                      <div className="text-2xl font-bold">
                        {metric.value}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Growth Chart Visualization */}
              <div className="relative h-32 bg-gray-50 rounded-lg p-4">
                <div className="flex items-end justify-between h-full">
                  <div className="text-xs text-gray-500">
                    <div>Clicks</div>
                    <div className="mt-4">7.5K</div>
                  </div>
                  
                  {/* Chart Lines */}
                  <div className="flex-1 mx-4 relative h-full">
                    <svg className="w-full h-full" viewBox="0 0 300 80">
                      <motion.path
                        d="M0,60 Q50,50 100,40 T200,20 T300,10"
                        fill="none"
                        stroke="hsl(var(--brand-purple))"
                        strokeWidth="3"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, delay: 0.5 }}
                      />
                      <motion.path
                        d="M0,70 Q50,65 100,55 T200,35 T300,25"
                        fill="none"
                        stroke="hsl(var(--coral))"
                        strokeWidth="2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, delay: 1 }}
                      />
                    </svg>
                  </div>

                  <div className="text-xs text-gray-500">
                    <div>Impressions</div>
                    <div className="mt-4">450K</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SEOResultsSlider;