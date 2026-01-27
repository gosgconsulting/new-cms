import { ThemeLink } from "../components/ThemeLink";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import ProductImageGallery from "../components/product/ProductImageGallery";
import ProductInfo from "../components/product/ProductInfo";
import ProductDescription from "../components/product/ProductDescription";
import ProductCarousel from "../components/content/ProductCarousel";

export default function ProductDetailPage({ productId }: { productId: string }) {
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
                    <ThemeLink to="/category/ingredients" className="font-body font-light text-foreground/70 hover:text-primary">Ingredients</ThemeLink>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-body font-light text-foreground">{productId || "Hovenia Dulcis Extract (헛개수)"}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <ProductImageGallery />

            <div className="lg:pl-12 mt-8 lg:mt-0 lg:sticky lg:top-6 lg:h-fit">
              <ProductInfo />
              <ProductDescription />
            </div>
          </div>
        </section>

        <section className="w-full mt-20 lg:mt-24">
          <div className="mb-6 px-6">
            <h2 className="text-lg font-heading font-medium text-foreground">You might also like</h2>
          </div>
          <ProductCarousel />
        </section>

        <section className="w-full mt-12">
          <div className="mb-6 px-6">
            <h2 className="text-lg font-heading font-medium text-foreground">More from this collection</h2>
          </div>
          <ProductCarousel />
        </section>
      </main>

      <Footer />
    </div>
  );
}
