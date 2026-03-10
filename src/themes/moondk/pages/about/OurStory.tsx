import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";

export default function OurStoryPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-8 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-heading font-medium text-foreground mb-6">Our Story</h1>
          <p className="text-foreground/70 font-body font-light leading-relaxed mb-6">
            MOONDK brings Korean home dining to your kitchen through chef-led curation of premium ingredients and curated products.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
