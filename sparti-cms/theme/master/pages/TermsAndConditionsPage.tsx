import React from "react";

interface TermsAndConditionsPageProps {
  tenantName?: string;
}

const TermsAndConditionsPage: React.FC<TermsAndConditionsPageProps> = ({
  tenantName = "Master Template",
}) => {
  return (
    <section className="py-20 px-4 bg-(--brand-background)">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Terms & Conditions
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
              Acceptance of Terms
            </h2>
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              By accessing or using this website, you agree to be bound by these
              Terms & Conditions. If you do not agree, please do not use the
              website.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Use of the Website
            </h2>
            <ul className="list-disc pl-5 text-base text-gray-700 dark:text-gray-300 space-y-2">
              <li>You may use the website for lawful purposes only.</li>
              <li>
                You agree not to misuse the website, interfere with its
                operation, or attempt unauthorized access.
              </li>
              <li>
                Content on this site is provided for general information and may
                be updated at any time.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Intellectual Property
            </h2>
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              Unless otherwise stated, all content, trademarks, logos, and
              materials on this website are owned by {tenantName} or used with
              permission. You may not reproduce or distribute any content
              without prior written consent.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Third-Party Links
            </h2>
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              This website may contain links to third-party websites. We are not
              responsible for the content, policies, or practices of those
              websites.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Disclaimer
            </h2>
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              The website and its content are provided “as is” without
              warranties of any kind. We do not guarantee that the website will
              be uninterrupted or error-free.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Limitation of Liability
            </h2>
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              To the maximum extent permitted by law, {tenantName} will not be
              liable for any indirect, incidental, special, or consequential
              damages arising from your use of the website.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Changes to These Terms
            </h2>
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              We may update these Terms & Conditions from time to time. Continued
              use of the website after changes means you accept the updated
              terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Contact
            </h2>
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              If you have questions about these Terms, please contact us using
              the contact form on this website.
            </p>
          </section>
        </div>
      </div>
    </section>
  );
};

export default TermsAndConditionsPage;
