import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-8 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-heading font-medium text-foreground mb-8">Checkout</h1>
          <p className="text-foreground/70 font-body font-light">Checkout page - to be implemented</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
