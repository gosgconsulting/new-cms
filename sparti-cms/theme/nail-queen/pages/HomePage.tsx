import { useEffect } from "react";
import { Layout } from "../components/Layout";

export default function HomePage({ basePath }: { basePath: string }) {
  const asset = (path: string) => `${basePath.replace(/\/+$/, "")}/assets/${path.replace(/^\/+/, "")}`;
  
  // Adjustable gap between text and vertical line in "Our Services" section
  // Change these values to adjust spacing: mobile (default) and desktop (md breakpoint and up)
  const servicesTextToLineGap = {
    mobile: "0.5rem",   // 8px - adjust this value for mobile gap
    desktop: "0.75rem",  // 12px - adjust this value for desktop gap
  };

  useEffect(() => {
    // Check if Trustindex script is already loaded to prevent duplicates
    if (document.querySelector('script[src*="trustindex.io"]')) {
      console.log("[testing] Trustindex script already exists, skipping");
      return;
    }

    // Remove any existing Trustindex widgets to prevent duplicates
    const existingWidgets = document.querySelectorAll(
      ".ti-widget, .trustindex-widget, [class*=\"trustindex\"]"
    );
    existingWidgets.forEach((widget) => {
      if ((widget as HTMLElement).id !== "trustindex-container") {
        widget.remove();
        console.log("[testing] Removed existing Trustindex widget");
      }
    });

    // Create and inject the script dynamically (React-safe way)
    const script = document.createElement("script");
    script.src = "https://cdn.trustindex.io/loader.js?dbd7dae31651949463166c7ee70";
    script.defer = true;
    script.async = true;

    // Find the trustindex container and append script right after it
    const container = document.getElementById("trustindex-container");
    if (container && container.parentNode) {
      container.parentNode.insertBefore(script, container.nextSibling);
      console.log("[testing] Trustindex script added to DOM");
    }

    // Cleanup
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
        console.log("[testing] Trustindex script removed from DOM");
      }
    };
  }, []);

  // Hide the summary section (tabs and overall rating) after widget loads
  useEffect(() => {
    const hideSummarySection = () => {
      const container = document.getElementById("trustindex-container");
      if (!container) return;

      // Hide summary sections with various selectors
      const selectors = [
        ".ti-header",
        ".ti-header-content",
        ".ti-summary",
        ".ti-summary-container",
        ".ti-tabs",
        "[class*='tab']",
        "[class*='summary']",
        "[class*='header']",
        "[class*='write-review']",
        "[class*='excellent']",
      ];

      selectors.forEach((selector) => {
        const elements = container.querySelectorAll(selector);
        elements.forEach((el) => {
          (el as HTMLElement).style.display = "none";
        });
      });

      // Hide the first child container if it contains tabs or summary content
      const widgetContainer = container.querySelector(".ti-widget-container");
      if (widgetContainer) {
        const firstChild = widgetContainer.firstElementChild as HTMLElement;
        if (firstChild) {
          const hasTabs = firstChild.querySelector("[class*='tab'], .ti-tabs");
          const hasSummary = firstChild.querySelector("[class*='summary'], .ti-summary");
          const hasRating = firstChild.textContent?.includes("Excellent") || 
                           firstChild.textContent?.includes("reviews");
          
          if (hasTabs || hasSummary || hasRating) {
            firstChild.style.display = "none";
            console.log("[testing] Hidden summary section");
          }
        }
      }
    };

    // Try to hide immediately
    hideSummarySection();

    // Also watch for widget to load and hide summary
    const observer = new MutationObserver(() => {
      hideSummarySection();
    });

    const container = document.getElementById("trustindex-container");
    if (container) {
      observer.observe(container, {
        childList: true,
        subtree: true,
      });
    }

    // Also check periodically in case observer misses it
    const interval = setInterval(hideSummarySection, 500);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      observer.disconnect();
    }, 10000); // Stop after 10 seconds

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, []);

  return (
    <Layout basePath={basePath}>
      {/* Hero Section */}
      <section className="bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left mb-8">
            <h1 className="text-6xl md:text-8xl font-bold text-black mb-4">NAIL QUEEN</h1>
            <p className="text-xl md:text-2xl font-light text-black">By Michelle Tran</p>
          </div>
          <div className="w-full">
            <img
              src={asset("home-banner.jpg")}
              alt="Nail salon interior"
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Our History Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-4xl font-bold text-black mb-8 text-left">
                Our
                <br />
                History
              </h2>
              <div className="space-y-6">
                <p className="text-gray-600 leading-relaxed">
                  Nail Queen was founded a humble 300 sqft space on the 4th floor of Far East Plaza, with just 4 staff and a dream.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  With years of industry experience, Nail Queen is the go-to destination for all your beauty needs. We specialize in nail care, offering exceptional manicures and pedicures, as well as waxing services.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Our expert staff is committed to providing top-notch service and ensuring each client's unique style and individual needs are met.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  At Nail Queen, we aim to create a world of comfort, relaxation, and rejuvenation for our valued customers.
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative">
              <div className="absolute left-3 top-6 bottom-6 w-0.5 bg-orange-500"></div>

              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-orange-500 rounded-full mr-6 flex-shrink-0"></div>
                  <div>
                    <h3 className="text-xl font-bold text-black mb-2">2015 – Humble Beginnings</h3>
                    <p className="text-gray-600">
                      Started with a 300 sqft salon and 4 staff, facing financial struggles but staying true to quality service.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-6 h-6 bg-orange-500 rounded-full mr-6 flex-shrink-0"></div>
                  <div>
                    <h3 className="text-xl font-bold text-black mb-2">2016 – Building Trust</h3>
                    <p className="text-gray-600">
                      Introduced the philosophy "no package – no hard-sell", focusing on genuine customer care and word-of-mouth growth.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-6 h-6 bg-orange-500 rounded-full mr-6 flex-shrink-0"></div>
                  <div>
                    <h3 className="text-xl font-bold text-black mb-2">2018 – Expansion</h3>
                    <p className="text-gray-600">
                      Expanded space and team, while strengthening in-house training and professional yet friendly culture.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-6 h-6 bg-orange-500 rounded-full mr-6 flex-shrink-0"></div>
                  <div>
                    <h3 className="text-xl font-bold text-black mb-2">2020 – Resilience in Crisis</h3>
                    <p className="text-gray-600">
                      COVID-19 hit hard, but Nail Queen pivoted to Instagram & TikTok, keeping the brand alive and connected.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-6 h-6 bg-orange-500 rounded-full mr-6 flex-shrink-0"></div>
                  <div>
                    <h3 className="text-xl font-bold text-black mb-2">2022 – Brand Recognition</h3>
                    <p className="text-gray-600">
                      Recognized as one of Singapore's most talked-about nail salons, attracting a strong daily client base.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-6 h-6 bg-orange-500 rounded-full mr-6 flex-shrink-0"></div>
                  <div>
                    <h3 className="text-xl font-bold text-black mb-2">2025 – Ecosystem Growth</h3>
                    <p className="text-gray-600">
                      Launched Diora Spa by Michelle Tran, a sister brand offering head spa, waxing, and holistic beauty services—marking Nail Queen's step into a full beauty & wellness ecosystem.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <style>{`
            .services-text-wrapper {
              padding-right: ${servicesTextToLineGap.mobile};
            }
            @media (min-width: 768px) {
              .services-text-wrapper {
                padding-right: ${servicesTextToLineGap.desktop};
              }
            }
          `}</style>
          <div className="flex flex-col md:flex-row gap-20 items-start">
            <div className="relative w-90 md:w-1/5 md:-mr-10 services-text-wrapper">
              <h2 className="text-4xl font-bold text-black mb-8">
                Our
                <br />
                Services
              </h2>
              <p className="text-lg text-gray-600">
                From nails to lashes and brows,
                <br />
                we offer clean, skilled,
                <br />
                and personalised beauty services
                <br />
                all in one place.
              </p>
              <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-nail-queen-brown hidden md:block"></div>
            </div>

            <div className="w-full md:w-[42%] grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                <div className="aspect-[4/3] bg-gray-200">
                  <img
                    src={asset("pricing/manicure.jpg")}
                    alt="Manicures"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-lg font-bold text-black mb-2">Manicures</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Experience meticulous nail care and stunning nail art designs that reflect your unique style and personality, using top-quality products for long-lasting results.
                  </p>
                  <button className="text-nail-queen-brown text-sm font-medium hover:underline">Learn more</button>
                </div>
              </div>

              <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                <div className="aspect-[4/3] bg-gray-200">
                  <img
                    src={asset("pricing/pedicure.png")}
                    alt="Pedicures"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-lg font-bold text-black mb-2">Pedicures</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Pamper your feet with our luxurious pedicure treatments, including exfoliation, massage therapy, and expert nail care, leaving you with healthy, beautiful feet.
                  </p>
                  <button className="text-nail-queen-brown text-sm font-medium hover:underline">Learn more</button>
                </div>
              </div>

              <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                <div className="aspect-[4/3] bg-gray-200">
                  <img
                    src={asset("pricing/spa.png")}
                    alt="Spa"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-lg font-bold text-black mb-2">Spa</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    A Four-Senses Ritual crafted from delicate techniques, soft aromas, and layers of nourishing care that unfold slowly on the skin.
                  </p>
                  <button className="text-nail-queen-brown text-sm font-medium hover:underline">Learn more</button>
                </div>
              </div>

              <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                <div className="aspect-[4/3] bg-gray-200">
                  <img
                    src="https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                    alt="Eyebrows"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-lg font-bold text-black mb-2">Eyebrows</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Clean up stray hairs and define your features with our quick shave, brow shaping, and precise threading services for a neat, polished look.
                  </p>
                  <button className="text-nail-queen-brown text-sm font-medium hover:underline">Learn more</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-8">Why Choose Us</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center flex flex-col">
              <div className="aspect-video bg-gray-200 rounded-lg mb-6 overflow-hidden">
                <img
                  src={asset("wcu-1.jpg")}
                  alt="No Package Difference"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-black mb-4">The "No Package" Difference</h3>
              <p className="text-gray-600 text-sm mb-6 flex-grow min-h-[120px]">
                No hidden agendas, just beautiful nails. Unlike package pushing salons, we believe in clear pricing and personalized recommendations. Choose any service you desire, knowing exactly what you're paying for.
              </p>
              <div className="flex justify-center">
                <button
                  className="text-nail-queen-brown text-sm font-medium border border-nail-queen-brown px-6 py-2 rounded-full hover:bg-nail-queen-brown hover:text-white transition-colors mt-auto"
                  onClick={() => {
                    const ev = new CustomEvent("nailqueen:open-contact");
                    window.dispatchEvent(ev);
                  }}
                >
                  Learn more
                </button>
              </div>
            </div>

            <div className="text-center flex flex-col">
              <div className="aspect-video bg-gray-200 rounded-lg mb-6 overflow-hidden">
                <img
                  src={asset("wcu-2.jpg")}
                  alt="First Class Service"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-black mb-4">First-Class Service</h3>
              <p className="text-gray-600 text-sm mb-6 flex-grow min-h-[120px]">
                Our dedicated staff go the extra mile to ensure your comfort and satisfaction, providing a first-class service that leaves you feeling pampered and rejuvenated.
              </p>
              <div className="flex justify-center">
                <button
                  className="text-nail-queen-brown text-sm font-medium border border-nail-queen-brown px-6 py-2 rounded-full hover:bg-nail-queen-brown hover:text-white transition-colors mt-auto"
                  onClick={() => {
                    const ev = new CustomEvent("nailqueen:open-contact");
                    window.dispatchEvent(ev);
                  }}
                >
                  Learn more
                </button>
              </div>
            </div>

            <div className="text-center flex flex-col">
              <div className="aspect-video bg-gray-200 rounded-lg mb-6 overflow-hidden">
                <img
                  src={asset("wcu-3.jpg")}
                  alt="Value for Money"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Value for Money</h3>
              <p className="text-gray-600 text-sm mb-6 flex-grow min-h-[120px]">
                Our dedicated staff go the extra mile to ensure your comfort and satisfaction, providing a first-class service that leaves you feeling pampered and rejuvenated.
              </p>
              <div className="flex justify-center">
                <button
                  className="text-nail-queen-brown text-sm font-medium border border-nail-queen-brown px-6 py-2 rounded-full hover:bg-nail-queen-brown hover:text-white transition-colors mt-auto"
                  onClick={() => {
                    const ev = new CustomEvent("nailqueen:open-contact");
                    window.dispatchEvent(ev);
                  }}
                >
                  Learn more
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 relative">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${asset("review-section.jpg")}')` }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-8">Customer Reviews</h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              See what our customers are saying about their experience at Nail Queen
            </p>
          </div>

          <div id="trustindex-container">
            <style
              dangerouslySetInnerHTML={{
                __html: `
                /* Hide duplicate review sections - keep only the first one */
                #trustindex-container .ti-widget:nth-child(n+2) {
                  display: none !important;
                }

                /* Hide the summary section with tabs and overall rating - target common Trustindex structures */
                #trustindex-container .ti-widget .ti-header,
                #trustindex-container .ti-widget .ti-header-content,
                #trustindex-container .ti-widget .ti-widget-container .ti-header,
                #trustindex-container .ti-widget .ti-summary,
                #trustindex-container .ti-widget .ti-summary-container,
                #trustindex-container .ti-widget .ti-widget-container > div:first-child:not([class*="review"]):not([class*="list"]):not([class*="carousel"]),
                #trustindex-container .ti-widget [class*="summary"],
                #trustindex-container .ti-widget [class*="header"],
                #trustindex-container .ti-widget .ti-tabs,
                #trustindex-container .ti-widget [class*="tab"],
                #trustindex-container .ti-widget .ti-widget-container > .ti-header-container,
                #trustindex-container .ti-widget .ti-widget-container > .ti-summary-container,
                /* Hide white summary card - common structure */
                #trustindex-container .ti-widget .ti-widget-container > div:has([class*="tab"]),
                #trustindex-container .ti-widget .ti-widget-container > div:has([class*="rating"]):not([class*="review"]),
                #trustindex-container .ti-widget [class*="write-review"],
                #trustindex-container .ti-widget [class*="excellent"],
                /* Hide any section before the review list */
                #trustindex-container .ti-widget .ti-widget-container > div:first-of-type:not(.ti-reviews-container):not([class*="review-list"]):not([class*="carousel"]) {
                  display: none !important;
                }

                /* Keep only the review carousel/list */
                #trustindex-container .ti-widget {
                  background: transparent !important;
                  border: none !important;
                }

                #trustindex-container .ti-widget * {
                  color: white !important;
                }

                /* Hide TripAdvisor section specifically */
                #trustindex-container [data-layout-category="tripadvisor"],
                #trustindex-container .tripadvisor-section,
                #trustindex-container .ti-widget:last-child {
                  display: none !important;
                }
              `,
              }}
            />
          </div>
        </div>
      </section>
    </Layout>
  );
}