import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import { ThemeLink } from "../components/ThemeLink";
import { ArrowRight } from "lucide-react";
import steakHero from "../assets/steak_hero.jpeg";

export default function BrokPrivateDinningPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section with Image Background */}
      <section className="relative w-full min-h-[650px] overflow-hidden">
        <img
          src={steakHero}
          alt="Private Dining Experience"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Content */}
        <div className="relative z-20 flex items-center justify-center min-h-[650px]">
          <div className="w-full px-2">
            <div className="mx-auto max-w-6xl flex justify-center">
              <main className="max-w-2xl">
                <div className="text-center">
                  {/* Main Heading */}
                  <h1 className="font-body text-5xl md:text-6xl leading-[0.95] tracking-tight text-white mb-6">
                    <span className="whitespace-nowrap">Intimate <span className="font-heading italic font-normal text-white">Private</span></span>
                    <span className="block">Dining</span>
                  </h1>

                  {/* Description */}
                  <p className="text-base md:text-lg font-body text-white/80 mb-8 max-w-xl mx-auto leading-relaxed">
                    Experience the essence of culinary artistry in our exclusive private dining service. Each experience is a blend of exceptional cuisine and personalized service, perfect for elevating your special occasions.
                  </p>

                  {/* Buttons */}
                  <div className="flex items-center justify-center gap-4 flex-wrap">
                    <ThemeLink 
                      to="/category/shop"
                      className="px-8 py-3 rounded-full bg-transparent border border-white/30 text-white font-normal text-sm transition-all duration-200 hover:bg-white/10 hover:border-white/50 cursor-pointer inline-flex items-center"
                    >
                      View Menu
                    </ThemeLink>
                    <ThemeLink 
                      to="/about/customer-care"
                      className="px-8 py-3 rounded-full bg-white text-black font-normal text-sm transition-all duration-200 hover:bg-white/90 cursor-pointer inline-flex items-center gap-2"
                    >
                      Book Now
                      <ArrowRight className="w-4 h-4" />
                    </ThemeLink>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      </section>

      {/* About Brok Section */}
      <section className="px-2 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left: Image */}
            <div className="order-1 md:order-1">
              <div className="rounded-[1.5rem] overflow-hidden bg-white shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop&q=80"
                  alt="Private dining experience at Bēok"
                  className="w-full h-auto object-cover aspect-[4/3]"
                />
              </div>
            </div>

            {/* Right: Text Content */}
            <div className="order-2 md:order-2">
              <h2 className="text-3xl md:text-4xl font-heading tracking-tight mb-6">
                Experience our private dining
              </h2>
              <div className="space-y-4">
                <p className="text-base md:text-lg font-body text-foreground/70 leading-relaxed">
                  Bēok brings natural flavour to the forefront through Korean contemporary cuisine.
                </p>
                <p className="text-base md:text-lg font-body text-foreground/70 leading-relaxed">
                  Seasonal ingredients, clean seasoning, and thoughtful technique come together in dishes that feel familiar yet unexpectedly new. Here, Korean taste is not shouted, it is revealed, slowly, beautifully, and meant to be shared in Singapore.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="px-2 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="prose prose-lg max-w-none">
            <p className="text-foreground/70 font-body font-light leading-relaxed mb-6">
              Discover the art of private dining with Brok. Our curated experiences bring 
              exceptional cuisine and personalized service to your special occasions.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
