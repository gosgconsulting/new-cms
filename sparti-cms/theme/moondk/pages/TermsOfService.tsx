import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-8">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <header className="mb-12 text-center">
            <h1 className="text-4xl font-heading font-medium text-foreground mb-4">Terms of Service</h1>
            <p className="text-foreground/70 font-body font-light">Last updated: January 15, 2024</p>
          </header>
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-heading font-medium text-foreground mb-4">Agreement to Terms</h2>
              <p className="text-foreground/70 font-body font-light leading-relaxed">
                By accessing and using the MOONDK website and services, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
