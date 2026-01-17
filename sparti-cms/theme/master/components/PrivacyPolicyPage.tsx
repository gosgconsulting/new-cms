import React from "react";

interface PrivacyPolicyPageProps {
  tenantName?: string;
}

const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({
  tenantName = "Master Template",
}) => {
  return (
    <section className="py-20 px-4 bg-(--brand-background)">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          Last updated: {new Date().toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        <div className="mt-10 space-y-8">
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Overview
            </h2>
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              This Privacy Policy explains how {tenantName} collects, uses, and
              protects your information when you visit our website or contact us.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Information We Collect
            </h2>
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              We may collect information you provide directly, such as your name,
              email address, phone number, and any message you submit through our
              forms.
            </p>
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              We may also collect basic usage data (e.g., pages visited, device
              type, approximate location, and referral source) to improve site
              performance and user experience.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              How We Use Your Information
            </h2>
            <ul className="list-disc pl-5 text-base text-gray-700 dark:text-gray-300 space-y-2">
              <li>To respond to inquiries and provide requested services</li>
              <li>To improve our website, products, and customer experience</li>
              <li>To communicate updates related to your request</li>
              <li>To comply with legal obligations when applicable</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Cookies
            </h2>
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              We may use cookies or similar technologies to remember preferences
              and understand how the site is used. You can control cookies
              through your browser settings.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Data Retention
            </h2>
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              We keep personal information only as long as necessary to fulfill
              the purposes described in this policy, or as required by law.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Your Rights
            </h2>
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              Depending on your location, you may have rights to access,
              correct, or delete your personal information. To make a request,
              please contact us.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Contact
            </h2>
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              If you have questions about this Privacy Policy, please reach out
              using the contact form on this website.
            </p>
          </section>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicyPage;
