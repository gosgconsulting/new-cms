import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const withBase = (path: string) => {
  const base = (import.meta as any).env?.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : base + "/";
  if (path.startsWith("/")) return normalizedBase.replace(/\/$/, "") + path;
  return normalizedBase + path;
};

const categories = [
  {
    title: "Getting started",
    questions: [
      {
        question: "How fast can we launch?",
        answer:
          "Typically 5–10 business days once your content and assets are ready.",
      },
      {
        question: "Can I update the website myself?",
        answer:
          "Yes. The Master theme is designed to be CMS-driven so you can update sections and pages without a developer.",
      },
    ],
  },
  {
    title: "SEO & performance",
    questions: [
      {
        question: "Is the site SEO-friendly?",
        answer:
          "Yes—clean structure, fast pages, and room for content expansion (blog and landing pages).",
      },
      {
        question: "Will it be fast on mobile?",
        answer:
          "Yes. Astro outputs lean HTML and we keep assets optimized for performance.",
      },
    ],
  },
  {
    title: "Support",
    questions: [
      {
        question: "Do you offer ongoing support?",
        answer:
          "Yes. You can choose an ongoing package for updates, experiments, and improvements.",
      },
      {
        question: "Can you connect integrations (forms, email, etc.)?",
        answer:
          "Yes. We can connect common integrations depending on your setup and plan.",
      },
    ],
  },
];

export const FAQ = ({
  headerTag = "h2",
  className,
  className2,
}: {
  headerTag?: "h1" | "h2";
  className?: string;
  className2?: string;
}) => {
  return (
    <section id="faq" className={cn("py-24 lg:py-32", className)}>
      <div className="container max-w-5xl">
        <div className={cn("mx-auto grid gap-14 lg:grid-cols-2", className2)}>
          <div className="space-y-4">
            {headerTag === "h1" ? (
              <h1 className="text-2xl tracking-tight md:text-4xl lg:text-5xl">
                Frequently asked questions
              </h1>
            ) : (
              <h2 className="text-2xl tracking-tight md:text-4xl lg:text-5xl">
                Frequently asked questions
              </h2>
            )}
            <p className="text-muted-foreground max-w-md leading-snug lg:mx-auto">
              If you can't find what you're looking for,{" "}
              <a href={withBase("/contact")} className="underline underline-offset-4">
                get in touch
              </a>
              .
            </p>
          </div>

          <div className="grid gap-6 text-start">
            {categories.map((category, categoryIndex) => (
              <div key={category.title}>
                <h3 className="text-muted-foreground border-b py-4">
                  {category.title}
                </h3>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((item, i) => (
                    <AccordionItem key={i} value={`${categoryIndex}-${i}`}>
                      <AccordionTrigger>{item.question}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};