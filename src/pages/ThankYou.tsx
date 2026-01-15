import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ThankYou: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="pt-24 md:pt-20 pb-16 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Thank you for reaching out
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl">
              Our team will review your message and get back to you shortly.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ThankYou;