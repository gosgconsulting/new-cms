import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

// Import images
import keywordResearch1 from "@/assets/seo/keyword-research-1.png";
import keywordResearch2 from "@/assets/seo/keyword-research-2.png";
import contentStrategy1 from "@/assets/seo/content-strategy-1.png";
import contentStrategy2 from "@/assets/seo/content-strategy-2.png";
import linkBuilding1 from "@/assets/seo/link-building-1.png";
import linkBuilding2 from "@/assets/seo/link-building-2.png";

interface SEOServicesShowcaseProps {
  onContactClick?: () => void;
  items?: any[];
}

const SEOServicesShowcase = ({ onContactClick, items }: SEOServicesShowcaseProps) => {
  // Debug what items are being passed to the component
  console.log('[testing] SEOServicesShowcase items:', JSON.stringify(items, null, 2));
  
  // Use items from props if available, otherwise use default hardcoded data
  // More detailed debugging of items structure
  if (items?.length) {
    console.log('[testing] SEOServicesShowcase first item:', JSON.stringify(items[0], null, 2));
    
    // Find Services item
    const servicesItem = items.find((item: any) => 
      item.key?.toLowerCase() === 'services'
    );
    
    if (servicesItem) {
      console.log('[testing] Services item found:', JSON.stringify(servicesItem, null, 2));
      
      if (servicesItem.items?.length) {
        console.log('[testing] First service section:', JSON.stringify(servicesItem.items[0], null, 2));
        
        // Check if this service section has items
        if (servicesItem.items[0]?.items?.length) {
          console.log('[testing] First service section items:', 
            servicesItem.items[0].items.map((item: any) => ({
              key: item.key,
              type: item.type,
              content: item.content
            }))
          );
        }
      }
    }
  }
  
  const sections = items?.length ? 
    // Try to extract services data from items
    (() => {
      // Look for a "Services" key in the items array (exact match)
      const servicesItem = items.find((item: any) => 
        item.key === 'Services'
      );
      
      console.log('[testing] Found services item:', servicesItem);
      
      // If we found a services item with items, use those
      if (servicesItem?.items?.length) {
        return servicesItem.items.map((service: any, index: number) => {
          console.log('[testing] Processing service:', service);
          
          // Try to find service data in different structures
          let title = '';
          let highlight = '';
          let description = '';
          let buttonText = '';
          
          // If service has items, extract data from them
          if (service.items?.length) {
            console.log('[testing] Processing service items:', service.items.map((item: any) => ({
              key: item.key,
              type: item.type,
              content: item.content
            })));
            
            // Find the carousel item which contains all the data
            const carouselItem = service.items.find((item: any) => 
              item.type === 'carousel'
            );
            
            // Also look for individual items
            const titleItem = service.items.find((item: any) => 
              item.key === 'title'
            );
            
            const descriptionItem = service.items.find((item: any) => 
              item.key === 'description'
            );
            
            const buttonItem = service.items.find((item: any) => 
              item.key === 'button'
            );
            
            console.log('[testing] Found carousel item:', carouselItem);
            
            console.log('[testing] Service items found (exact match):', {
              titleItem: titleItem?.content,
              carouselTitle: carouselItem?.title,
              carouselHighlight: carouselItem?.highlight,
              descriptionItem: descriptionItem?.content,
              buttonItem: buttonItem?.content
            });
            
            // IMPORTANT: Handle title and highlight correctly
            
            // Find the highlight item specifically (should be separate from title)
            const highlightItem = service.items.find((item: any) => 
              item.key === 'highlight'
            );
            
            console.log('[testing] Found highlight item:', highlightItem?.content);
            
            // First check if we have separate title and highlight items
            if (titleItem && highlightItem) {
              // Use them directly - this is the ideal case
              title = titleItem.content || '';
              highlight = highlightItem.content || '';
              console.log('[testing] Using separate title and highlight items');
            } 
            // If we have a title that contains both title and highlight (with "with")
            else if (titleItem?.content && titleItem.content.includes(' with ')) {
              // Extract title and highlight from the combined string
              const parts = titleItem.content.split(' with ');
              title = parts[0] + ' with';
              highlight = parts.length > 1 ? parts[1] : '';
              console.log('[testing] Extracted title and highlight from combined string');
            }
            // Otherwise use carousel or fallbacks
            else {
              title = carouselItem?.title || service.title || '';
              highlight = carouselItem?.highlight || service.highlight || '';
              console.log('[testing] Using carousel or fallback title/highlight');
            }
            
            // For description, use the description item content first, then carousel description
            description = descriptionItem?.content || carouselItem?.description || service.description || '';
            
            // For button text, use the button item content first, then carousel buttonText
            buttonText = buttonItem?.content || carouselItem?.buttonText || service.buttonText || 'Learn More';
          } else {
            // Try to get data directly from the service object
            title = service.title || '';
            highlight = service.highlight || '';
            description = service.description || '';
            buttonText = service.buttonText || 'Learn More';
          }
          
          // Get images from carousel if available
          let images = [];
          
          // Find the carousel item which contains image URLs
          const carouselItem = service.items?.find((item: any) => 
            item.type === 'carousel'
          );
          
          if (carouselItem?.images && Array.isArray(carouselItem.images)) {
            // Use images from the carousel
            console.log('[testing] Using images from carousel:', carouselItem.images);
            
            // Check if images are relative URLs or full URLs
            images = carouselItem.images.map((img: string) => {
              // If it starts with http or https, it's already a full URL
              if (img.startsWith('http')) {
                return img;
              }
              
              // If it starts with a slash, it's a root-relative URL
              if (img.startsWith('/')) {
                return img;
              }
              
              // Otherwise, it's a relative URL, prepend with /
              return `/${img}`;
            });
          } else {
            // Fallback to default images based on index
            console.log('[testing] Using default images for section', index);
            if (index === 0) images = [keywordResearch1, keywordResearch2];
            else if (index === 1) images = [contentStrategy1, contentStrategy2];
            else if (index === 2) images = [linkBuilding1, linkBuilding2];
          }
          
          console.log('[testing] Final data for section', index, ':', {
            key: service.key,
            title,
            highlight,
            description: description.substring(0, 50) + '...',
            buttonText,
            imageCount: images.length
          });
          
          return {
            id: service.key || `service-${index}`,
            title: title || "Service Title",
            highlight: highlight || "highlight",
            description: description || "Service description",
            buttonText: buttonText || "Learn More",
            images: images,
            reversed: index % 2 === 1, // Alternate reversed layout
          };
        });
      }
      
      // If we couldn't find a services item, try to use the items directly
      if (items.length >= 3) {
        return items.slice(0, 3).map((item: any, index: number) => {
          // Default images based on index
          let defaultImages = [keywordResearch1, keywordResearch2];
          if (index === 1) defaultImages = [contentStrategy1, contentStrategy2];
          if (index === 2) defaultImages = [linkBuilding1, linkBuilding2];
          
          return {
            id: item.key || `service-${index}`,
            title: item.title || "Service Title",
            highlight: item.highlight || "highlight",
            description: item.description || "Service description",
            buttonText: item.buttonText || "Learn More",
            images: defaultImages,
            reversed: index % 2 === 1,
          };
        });
      }
      
      // If all else fails, return an empty array
      return [];
    })() || [] 
    : 
    // Fallback to hardcoded data if no items are provided
    [
      {
        id: "keywords-research",
        title: "Rank on keywords with",
        highlight: "search volume",
        description: "Discover high-volume keywords with precise search data and user intent analysis. Find the perfect keywords to target for maximum organic traffic growth.",
        buttonText: "Learn More",
        images: [keywordResearch1, keywordResearch2],
        reversed: false,
      },
      {
        id: "content-strategy",
        title: "Find topics based on",
        highlight: "real google search results",
        description: "Discover content opportunities by analyzing actual Google search results and user behavior. Get real insights from search data to create content that ranks and converts.",
        buttonText: "View Analytics",
        images: [contentStrategy1, contentStrategy2],
        reversed: true,
      },
      {
        id: "link-building",
        title: "Build authority with",
        highlight: "high-quality backlinks",
        description: "Strengthen your website's authority through strategic link building campaigns. Acquire high-quality backlinks from reputable sources to boost your domain authority and rankings.",
        buttonText: "Try Link Builder",
        images: [linkBuilding1, linkBuilding2],
        reversed: false,
      },
    ];

  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto space-y-32">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
              section.reversed ? "lg:grid-flow-dense" : ""
            }`}
          >
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: section.reversed ? 30 : -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className={`space-y-6 ${section.reversed ? "lg:col-start-2" : ""}`}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                {section.title && (
                  <span className="text-foreground">{section.title}{" "}</span>
                )}
                {section.highlight && (
                  <span className="bg-gradient-to-r from-brandPurple via-brandTeal to-coral bg-clip-text text-transparent">
                    {section.highlight}
                  </span>
                )}
              </h2>

              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                {section.description}
              </p>

              <div className="pt-4">
                <Button
                  onClick={onContactClick}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 text-white font-medium px-8 py-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {section.buttonText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>

            {/* Image Carousel */}
            <motion.div
              initial={{ opacity: 0, x: section.reversed ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className={`relative ${section.reversed ? "lg:col-start-1 lg:row-start-1" : ""}`}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border">
                <Carousel
                  opts={{
                    align: "start",
                    loop: true,
                  }}
                  className="w-full"
                >
                  <CarouselContent>
                    {section.images.map((image, imgIndex) => (
                      <CarouselItem key={imgIndex}>
                        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                          <img
                            src={image}
                            alt={`${section.title} - Screenshot ${imgIndex + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-4" />
                  <CarouselNext className="right-4" />
                </Carousel>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-brandPurple/10 rounded-full blur-3xl -z-10"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-brandTeal/10 rounded-full blur-3xl -z-10"></div>
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SEOServicesShowcase;
