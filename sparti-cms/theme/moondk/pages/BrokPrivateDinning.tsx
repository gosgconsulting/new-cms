import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import { ThemeLink } from "../components/ThemeLink";
import { ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import steakHero from "../assets/steak_hero.jpeg";
import aboutBrokImage from "../assets/IMG_20240523_135412_907.jpg";
import reserveImage from "../assets/IMG_20240521_161614_496_1.jpg";
import riceImage from "../assets/rice.jpg";

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
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  {/* Main Heading */}
                  <h1 className="font-body text-5xl md:text-6xl leading-[0.95] tracking-tight mb-6">
                    <span className="whitespace-nowrap"><span className="text-white/70">Intimate</span> <span className="font-heading italic font-normal text-white">Private</span></span>
                    <span className="block text-white/70">Dining</span>
                  </h1>

                  {/* Description */}
                  <p className="text-base md:text-lg font-body text-white/80 mb-8 max-w-xl mx-auto leading-relaxed">
                    Experience the essence of culinary artistry in our exclusive private dining service. Each experience is a blend of exceptional cuisine and personalized service, perfect for elevating your special occasions.
                  </p>

                  {/* Buttons */}
                  <div className="flex items-center justify-center gap-4 flex-wrap">
                    <a 
                      href="#menu"
                      className="px-8 py-3 rounded-full bg-transparent border border-white/30 !text-white font-normal text-sm transition-all duration-300 hover:bg-white/20 hover:border-white/70 hover:scale-105 hover:shadow-lg cursor-pointer inline-flex items-center"
                      onClick={(e) => {
                        e.preventDefault();
                        const menuSection = document.getElementById('menu');
                        if (menuSection) {
                          menuSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                    >
                      View Menu
                    </a>
                    <ThemeLink 
                      to="/about/customer-care"
                      className="px-8 py-3 rounded-full bg-white text-black font-normal text-sm transition-all duration-300 hover:bg-white/90 hover:scale-105 hover:shadow-lg cursor-pointer inline-flex items-center gap-2 group"
                    >
                      Book Now
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </ThemeLink>
                  </div>
                </motion.div>
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
            <motion.div 
              className="order-1 md:order-1"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="rounded-[1.5rem] overflow-hidden bg-white shadow-md">
                <img
                  src={aboutBrokImage}
                  alt="Private dining experience at Bēok"
                  className="w-full h-auto object-cover aspect-[4/3]"
                />
              </div>
            </motion.div>

            {/* Right: Text Content */}
            <motion.div 
              className="order-2 md:order-2"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            >
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
            </motion.div>
          </div>
        </div>
      </section>

      {/* Reserve Section */}
      <section className="relative w-full min-h-[400px] overflow-hidden px-8 md:px-16 lg:px-24 bg-background">
        <img
          src={reserveImage}
          alt="Reserve Your Seat"
          className="absolute inset-x-8 md:inset-x-16 lg:inset-x-24 inset-y-0 w-[calc(100%-4rem)] md:w-[calc(100%-8rem)] lg:w-[calc(100%-12rem)] h-full object-cover rounded-lg"
        />
        {/* Overlay for text readability */}
        <div className="absolute inset-x-8 md:inset-x-16 lg:inset-x-24 inset-y-0 bg-black/40 rounded-lg" />
        
        {/* Content */}
        <div className="relative z-20 flex items-center justify-center min-h-[400px]">
          <div className="w-full px-2">
            <div className="mx-auto max-w-6xl flex justify-center">
              <motion.div 
                className="max-w-2xl text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <h2 className="text-3xl md:text-4xl font-body !text-white mb-8 tracking-tight">
                  Book your seat at BEOK
                </h2>
                <div>
                  <ThemeLink 
                    to="/about/customer-care"
                    className="px-8 py-3 rounded-full bg-white text-black font-normal text-sm transition-all duration-300 hover:bg-white/90 hover:scale-105 hover:shadow-lg cursor-pointer inline-flex items-center gap-2 group"
                  >
                    Reserve Now
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </ThemeLink>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-2 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
            {/* Left: Text Content */}
            <motion.div 
              className="order-2 md:order-1"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="mb-2">
                <span className="text-sm font-body text-foreground/60 underline">FAQ</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-body text-primary mb-8 tracking-tight">
                QUICK QUESTION
              </h2>
              <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                <AccordionItem value="item-1" className="border-b border-border">
                  <AccordionTrigger className="text-left font-body text-base md:text-lg text-foreground hover:no-underline py-4">
                    WHAT KIND OF CUISINE DO YOU SERVE?
                  </AccordionTrigger>
                  <AccordionContent className="text-base md:text-lg font-body text-foreground/70 leading-relaxed">
                    We serve Korean contemporary cuisine focused on natural flavour. Expect seasonal ingredients, clean seasoning, and modern techniques that keep the spirit of Korean food intact.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2" className="border-b border-border">
                  <AccordionTrigger className="text-left font-body text-base md:text-lg text-foreground hover:no-underline py-4">
                    WHAT ARE THE HOUSE RULES?
                  </AccordionTrigger>
                  <AccordionContent className="text-base md:text-lg font-body text-foreground/70 leading-relaxed">
                  Dinner Commence from 7PM and ends no later than 10.30PM.

                  We regret that we are currently unable to host children under 12 years of age.

                  Noise level are to be kept to a reasonable level at all times.

                  The menu is subject to change at any given moment. This depends on the availability and freshness of ingredients.

                  We are unable to cater to special dietary requirements, unless prior arrangements have been made.

                  We have a BYO policy with no additional corkage charge. We provide a few options for drinks at additional charges.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3" className="border-b border-border">
                  <AccordionTrigger className="text-left font-body text-base md:text-lg text-foreground hover:no-underline py-4">
                    WHERE ARE YOU LOCATED AND WHAT ARE YOUR OPENING HOURS?
                  </AccordionTrigger>
                  <AccordionContent className="text-base md:text-lg font-body text-foreground/70 leading-relaxed">
                  We are located in Farrer Road, and detailed address will be sent upon confirming the reservation.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4" className="border-b border-border">
                  <AccordionTrigger className="text-left font-body text-base md:text-lg text-foreground hover:no-underline py-4">
                    WHAT IS YOUR PRICE RANGE?
                  </AccordionTrigger>
                  <AccordionContent className="text-base md:text-lg font-body text-foreground/70 leading-relaxed">
                  Price is SGD $155/pax with number of guests of 6-8 guests. 

A deposit of $70/pax is mandatory.

Reservations are confirmed upon payment of deposit within 12 hours. Otherwise, the date shall be available for reservations again.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>

            {/* Right: Image */}
            <motion.div 
              className="order-1 md:order-2"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            >
              <div className="rounded-[1.5rem] overflow-hidden bg-white shadow-md">
                <img
                  src={riceImage}
                  alt="Korean BBQ grilling experience"
                  className="w-full h-auto object-cover aspect-[4/3]"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="px-2 py-16">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading tracking-tight mb-2">Beok</h2>
              <p className="text-lg font-body text-foreground/70">Winter Menu</p>
            </div>

            <div className="space-y-8">
              {/* Menu Item 1 */}
              <div className="border-b border-border pb-6">
                <h3 className="text-xl md:text-2xl font-heading mb-2">막걸리빵 / 호박범벅 / 닭보김치</h3>
                <p className="text-base md:text-lg font-body text-foreground/80 mb-2">Makgeolli Bread / Hobak Beombeok / Chicken Bo Kimchi</p>
                <p className="text-sm md:text-base font-body text-foreground/60">Burdock Butter / Red Bean & Mung Bean / Mustard Pearl</p>
              </div>

              {/* Menu Item 2 */}
              <div className="border-b border-border pb-6">
                <h3 className="text-xl md:text-2xl font-heading mb-2">참깨두부</h3>
                <p className="text-base md:text-lg font-body text-foreground/80 mb-2">Sesame Dubu</p>
                <p className="text-sm md:text-base font-body text-foreground/60">Tot Seaweed, Celeriac, Kale, Soy Sauce Foam</p>
              </div>

              {/* Menu Item 3 */}
              <div className="border-b border-border pb-6">
                <h3 className="text-xl md:text-2xl font-heading mb-2">잔치 국수</h3>
                <p className="text-base md:text-lg font-body text-foreground/80 mb-2">Janchi Guksu</p>
                <p className="text-sm md:text-base font-body text-foreground/60">Korean Noodle, Jeju Golden Flounder, Korean Zucchini</p>
              </div>

              {/* Menu Item 4 */}
              <div className="border-b border-border pb-6">
                <h3 className="text-xl md:text-2xl font-heading mb-2">오징어순대</h3>
                <p className="text-base md:text-lg font-body text-foreground/80 mb-2">Squid Sundae</p>
                <p className="text-sm md:text-base font-body text-foreground/60">Jeyuk Pork, Kimchi Caper Beurre Blanc, Sunchoke Crumble</p>
              </div>

              {/* Menu Item 5 */}
              <div className="border-b border-border pb-6">
                <h3 className="text-xl md:text-2xl font-heading mb-2">돼지보쌈</h3>
                <p className="text-base md:text-lg font-body text-foreground/80 mb-2">Pork Bossam</p>
                <p className="text-sm md:text-base font-body text-foreground/60">Iberico Pork Collar, Anchovy Chili Jang, Nuruk Salt Paste</p>
              </div>

              {/* Menu Item 6 */}
              <div className="border-b border-border pb-6">
                <h3 className="text-xl md:text-2xl font-heading mb-2">갈비찜반상</h3>
                <p className="text-base md:text-lg font-body text-foreground/80 mb-2">Galbij-Jim Bansang</p>
                <p className="text-sm md:text-base font-body text-foreground/60">USA Prime Beef Short Rib, Raisin, Red Wine, Wild Mountain Vegetable Rice & Maesaengi Seaweed Soup</p>
              </div>

              {/* Menu Item 7 - Dessert */}
              <div className="pb-6">
                <h3 className="text-xl md:text-2xl font-heading mb-2">인절미파이</h3>
                <p className="text-base md:text-lg font-body text-foreground/80 mb-2">Injeolmi Pie</p>
                <p className="text-sm md:text-base font-body text-foreground/60">Injeolmi Ice Cream, Strawberry, Italian Meringue, Overproof Rum</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
