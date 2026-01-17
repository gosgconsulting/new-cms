import React from "react";

const Privacy: React.FC = () => {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-slate-600 mb-6">
          We respect your privacy. This page explains what data we collect and how we use it.
        </p>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Information We Collect</h2>
          <p className="text-slate-700">
            We may collect personal information such as your name, email, and any details you submit through forms on our site.
          </p>
        </section>

        <section className="space-y-4 mt-6">
          <h2 className="text-xl font-semibold">How We Use Your Information</h2>
          <p className="text-slate-700">
            We use your information to provide and improve our services, respond to inquiries, and communicate important updates.
          </p>
        </section>

        <section className="space-y-4 mt-6">
          <h2 className="text-xl font-semibold">Contact</h2>
          <p className="text-slate-700">
            If you have questions about this policy, please contact us via our website.
          </p>
        </section>
      </div>
    </main>
  );
};

export default Privacy;