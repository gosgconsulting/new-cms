import { ThemeLink } from "../components/ThemeLink";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { useState } from "react";
import type { CarouselApi } from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import ProductImageGallery from "../components/product/ProductImageGallery";
import ProductInfo from "../components/product/ProductInfo";
import ProductDescription from "../components/product/ProductDescription";
import ProductCarousel from "../components/content/ProductCarousel";
import { products } from "../components/category/products";

export default function ProductDetailPage({ productId }: { productId: string }) {
  const product = products.find((p) => p.id.toString() === productId);
  const productName = product?.name || "Hovenia Dulcis Extract (헛개수)";
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-8">
        <section className="w-full px-6">
          {/* Breadcrumb - Show above image on smaller screens */}
          <div className="lg:hidden mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <ThemeLink to="/" className="font-body font-light text-foreground/70 hover:text-primary">Home</ThemeLink>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <ThemeLink to="/category/shop" className="font-body font-light text-foreground/70 hover:text-primary">Shop</ThemeLink>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-body font-light text-foreground">{productName}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <ProductImageGallery productId={productId} />

            <div className="lg:pl-12 mt-8 lg:mt-0 lg:sticky lg:top-6 lg:h-fit">
              <ProductInfo productId={productId} />
              <ProductDescription />
            </div>
          </div>
        </section>

        <section className="w-full mt-20 lg:mt-24">
          <div className="mb-6 px-6 flex items-center justify-between">
            <h2 className="text-lg font-heading font-medium text-foreground">You might also like</h2>
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="h-10 w-10 rounded-full border border-border/60 bg-background hover:bg-accent transition-colors flex items-center justify-center"
                aria-label="Previous"
                onClick={() => carouselApi?.scrollPrev()}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="h-10 w-10 rounded-full border border-border/60 bg-background hover:bg-accent transition-colors flex items-center justify-center"
                aria-label="Next"
                onClick={() => carouselApi?.scrollNext()}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          <ProductCarousel excludeProductId={productId} onApiChange={setCarouselApi} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
