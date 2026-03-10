import React from "react";
import { Plus } from "lucide-react";

type FAQItem = {
  question: string;
  answer: string;
};

interface FAQSectionProps {
  /**
   * Schema-driven items.
   * Expected format: [{ question: string, answer: string }, ...]
   */
  items?: FAQItem[];
}

const DEFAULT_FAQS: FAQItem[] = [
  {
    question: "What does 'full‑stack growth' mean?",
    answer:
      "We handle the full funnel end-to-end: positioning, website conversion, SEO, paid ads, creatives, and tracking—so every channel works together to drive revenue.",
  },
  {
    question: "How fast will I see results?",
    answer:
      "Paid ads can generate leads quickly, while SEO compounds over time. We'll align the plan to your goals and share clear performance reporting month-to-month.",
  },
  {
    question: "Do you work with my existing website?",
    answer:
      "Yes. We can optimize your current site for conversions and SEO, or rebuild key pages where needed—without disrupting your brand.",
  },
  {
    question: "Is this a good fit for small businesses?",
    answer:
      "Yes. We tailor scopes to your stage—whether you need a consistent lead pipeline, better conversion rates, or a complete growth system.",
  },
];

const FAQSection: React.FC<FAQSectionProps> = ({ items }) => {
  const faqs = Array.isArray(items) && items.length > 0 ? items : DEFAULT_FAQS;

  return (
    <section className="py-16 md:py-20 px-4 gosg-gradient-bg">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-10 md:mb-12">
          <p className="text-sm uppercase tracking-wider text-gray-500 mb-3">FAQ</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Questions? <span className="text-gradient-purple-cyan">We've got answers.</span>
          </h2>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Here are the most common questions we get before starting.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {faqs.map((faq, idx) => (
            <details
              key={`${faq.question}-${idx}`}
              className="group rounded-2xl border border-slate-200/70 bg-white/80 backdrop-blur shadow-sm hover:shadow-md transition-shadow"
            >
              <summary className="cursor-pointer list-none select-none p-5 md:p-6 flex items-center justify-between gap-4">
                <span className="text-base md:text-lg font-semibold text-slate-900">
                  {faq.question}
                </span>
                <span className="shrink-0 rounded-full border border-slate-200 bg-white p-2 text-slate-700 transition-transform duration-200 group-open:rotate-45">
                  <Plus className="h-5 w-5" />
                </span>
              </summary>
              <div className="px-5 pb-5 md:px-6 md:pb-6">
                <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;