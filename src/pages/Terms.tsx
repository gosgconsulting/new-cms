import React from "react";

const Terms: React.FC = () => {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Terms & Conditions</h1>
        <p className="text-slate-600 mb-6">
          By accessing and using this website, you agree to the terms outlined below.
        </p>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Use of the Service</h2>
          <p className="text-slate-700">
            You agree to use our services only for lawful purposes and in a way that does not infringe upon the rights of others.
          </p>
        </section>

        <section className="space-y-4 mt-6">
          <h2 className="text-xl font-semibold">Liability</h2>
          <p className="text-slate-700">
            We make no warranties regarding the accuracy or completeness of content and disclaim liability to the fullest extent permitted by law.
          </p>
        </section>

        <section className="space-y-4 mt-6">
          <h2 className="text-xl font-semibold">Changes</h2>
          <p className="text-slate-700">
            We may update these Terms & Conditions from time to time. Continued use of the site constitutes acceptance of the updated terms.
          </p>
        </section>
      </div>
    </main>
  );
};

export default Terms;