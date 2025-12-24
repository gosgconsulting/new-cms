import { Gallery4, Gallery4Props } from "@/components/ui/gallery4";

const demoData: Gallery4Props = {
  title: "Success Stories",
  description:
    "Discover how we've helped businesses achieve remarkable growth through our comprehensive digital marketing strategies. These case studies showcase real results and measurable success.",
  items: [
    {
      id: "seo-success",
      title: "E-commerce SEO: 300% Traffic Growth",
      description:
        "Discover how we helped an online retailer achieve a 300% increase in organic traffic through comprehensive SEO strategy, technical optimization, and content marketing.",
      href: "#",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2NDI3NzN8MHwxfGFsbHwxMjN8fHx8fHwyfHwxNzIzODA2OTM5fA&ixlib=rb-4.0.3&q=80&w=1080",
    },
    {
      id: "website-redesign",
      title: "Restaurant Website: 250% More Bookings",
      description:
        "Learn how a complete website redesign and user experience optimization led to a 250% increase in online reservations for a local restaurant chain.",
      href: "#",
      image:
        "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2NDI3NzN8MHwxfGFsbHwxMjR8fHx8fHwyfHwxNzIzODA2OTM5fA&ixlib=rb-4.0.3&q=80&w=1080",
    },
    {
      id: "social-ads",
      title: "Social Media Campaign: 400% ROI",
      description:
        "Explore how targeted social media advertising across Facebook and Instagram generated a 400% return on investment for a fashion startup.",
      href: "#",
      image:
        "https://images.unsplash.com/photo-1611224923853-80b023f02d71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2NDI3NzN8MHwxfGFsbHwxNzd8fHx8fHwyfHwxNzIzNjM0NDc0fA&ixlib=rb-4.0.3&q=80&w=1080",
    },
    {
      id: "brand-identity",
      title: "Complete Brand Transformation",
      description:
        "See how a complete brand identity redesign and digital marketing strategy helped a B2B company increase lead generation by 180%.",
      href: "#",
      image:
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2NDI3NzN8MHwxfGFsbHwxMzF8fHx8fHwyfHwxNzIzNDM1MzA1fA&ixlib=rb-4.0.3&q=80&w=1080",
    },
    {
      id: "sem-campaign",
      title: "SEM Strategy: 500% Lead Increase",
      description:
        "Discover how strategic search engine marketing and landing page optimization resulted in a 500% increase in qualified leads for a SaaS company.",
      href: "#",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2NDI3NzN8MHwxfGFsbHwxMjV8fHx8fHwyfHwxNzIzNDM1Mjk4fA&ixlib=rb-4.0.3&q=80&w=1080",
    },
  ],
};

function Gallery4Demo() {
  return <Gallery4 {...demoData} />;
}

export { Gallery4Demo };