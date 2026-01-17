import { useEffect } from "react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";

export default function TermsOfServicePage() {
  useEffect(() => {
    document.title = "Terms of Service - Linea Jewelry";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-6">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <header className="mb-12 text-center">
            <h1 className="text-4xl font-light text-foreground mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: January 15, 2024</p>
          </header>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">Agreement to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using the Linea Jewelry Inc. website and services, you accept and
                agree to be bound by the terms and provision of this agreement. These Terms of Service
                govern your use of our website, products, and services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">Use License</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Permission is granted to temporarily download one copy of the materials on Linea
                Jewelry Inc.'s website for personal, non-commercial transitory viewing only.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on the website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">Product Information and Availability</h2>
              <p className="text-muted-foreground leading-relaxed">
                We strive to provide accurate product information, including descriptions, pricing,
                and availability. However, we do not warrant that product descriptions or other
                content is accurate, complete, reliable, or error-free.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">Orders and Payment</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-light text-foreground mb-2">Order Acceptance</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    All orders are subject to acceptance and availability. We reserve the right to
                    refuse or cancel any order for any reason.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-light text-foreground mb-2">Payment Terms</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Payment is due at the time of purchase. We accept major credit cards and other
                    payment methods as displayed during checkout.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">Shipping and Delivery</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We will make every effort to ship orders within the timeframes specified. However,
                delivery dates are estimates and we are not responsible for delays caused by shipping
                carriers or circumstances beyond our control.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Risk of loss and title for products pass to you upon delivery to the carrier.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">Returns and Exchanges</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We offer a 30-day return policy for unworn items in original condition.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Items must be in original condition and packaging</li>
                <li>Custom or personalized items are final sale</li>
                <li>Return shipping costs are the responsibility of the customer</li>
                <li>Refunds will be processed to the original payment method</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">Warranty and Care</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our jewelry comes with a limited warranty against manufacturing defects. This warranty
                does not cover damage from normal wear, improper care, or accidents.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All content on this website is the property of Linea Jewelry Inc. and is protected by
                copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                In no event shall Linea Jewelry Inc. be liable for any damages arising out of the use
                or inability to use the materials on our website or products.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your privacy is important to us. Please review our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These terms and conditions are governed by and construed in accordance with the laws
                of New York State.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to revise these Terms of Service at any time without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 text-muted-foreground">
                <p>Email: legal@lineajewelry.com</p>
                <p>Phone: +1 (212) 555-0123</p>
                <p>Address: 123 Madison Avenue, New York, NY 10016</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
