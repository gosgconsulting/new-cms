import { Layout } from "../components/Layout.tsx";

export default function PrivacyPolicy({
    basePath,
}: {
    basePath: string;
}) {

    return (
      <Layout basePath={basePath}>
        {/* Header */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-6xl font-bold text-center text-nail-queen-brown mb-6">
            Privacy Policy
          </h1>
          <p className="text-center text-gray-600 max-w-3xl mx-auto">
            Your privacy is important to us. This policy outlines how we collect, use, and protect your personal information.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            
            {/* Introduction */}
            <div>
              <h2 className="text-3xl font-bold text-nail-queen-brown mb-4">
                Introduction
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  At Nail Queen, we are committed to protecting your privacy and ensuring the security 
                  of your personal information. This Privacy Policy explains how we collect, use, disclose, 
                  and safeguard your information when you visit our salon or use our services.
                </p>
                <p>
                  By using our services, you consent to the data practices described in this policy. 
                  If you do not agree with our policies and practices, please do not use our services.
                </p>
              </div>
            </div>

            {/* Information We Collect */}
            <div>
              <h2 className="text-3xl font-bold text-nail-queen-brown mb-4">
                Information We Collect
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  We may collect personal information from you in various ways, including when you:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Make an appointment or book our services</li>
                  <li>Visit our salon and fill out forms</li>
                  <li>Subscribe to our newsletter or promotional materials</li>
                  <li>Participate in surveys, contests, or promotions</li>
                  <li>Contact us with inquiries or feedback</li>
                  <li>Use our website or online booking system</li>
                </ul>
                <p className="pt-4">
                  The types of personal information we may collect include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Contact Information:</strong> Name, email address, phone number, mailing address</li>
                  <li><strong>Appointment Details:</strong> Service preferences, appointment history, treatment notes</li>
                  <li><strong>Payment Information:</strong> Credit card details, billing address (processed securely through payment processors)</li>
                  <li><strong>Health Information:</strong> Allergies, medical conditions, skin sensitivities relevant to our services</li>
                  <li><strong>Technical Data:</strong> IP address, browser type, device information when using our website</li>
                </ul>
              </div>
            </div>

            {/* How We Use Your Information */}
            <div>
              <h2 className="text-3xl font-bold text-nail-queen-brown mb-4">
                How We Use Your Information
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  We use the information we collect for various purposes, including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Service Delivery:</strong> To provide, maintain, and improve our nail care services</li>
                  <li><strong>Appointment Management:</strong> To schedule, confirm, and send reminders about your appointments</li>
                  <li><strong>Customer Care:</strong> To respond to your inquiries, provide customer support, and address concerns</li>
                  <li><strong>Safety & Health:</strong> To ensure safe service delivery based on your health information and preferences</li>
                  <li><strong>Payment Processing:</strong> To process transactions and send receipts</li>
                  <li><strong>Marketing:</strong> To send promotional materials, special offers, and updates (with your consent)</li>
                  <li><strong>Legal Compliance:</strong> To comply with legal obligations and protect our rights</li>
                  <li><strong>Business Operations:</strong> To analyze usage patterns and improve our services</li>
                </ul>
              </div>
            </div>

            {/* How We Share Your Information */}
            <div>
              <h2 className="text-3xl font-bold text-nail-queen-brown mb-4">
                How We Share Your Information
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  We do not sell, trade, or rent your personal information to third parties. We may share 
                  your information only in the following circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Service Providers:</strong> With trusted third-party vendors who assist in operating our business (e.g., payment processors, appointment booking systems, email service providers)</li>
                  <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of business assets</li>
                  <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
                </ul>
                <p className="pt-4">
                  All third-party service providers are required to maintain the confidentiality and security 
                  of your information and are prohibited from using it for any purpose other than providing 
                  services to us.
                </p>
              </div>
            </div>

            {/* Data Security */}
            <div>
              <h2 className="text-3xl font-bold text-nail-queen-brown mb-4">
                Data Security
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  We implement appropriate technical and organizational security measures to protect your 
                  personal information from unauthorized access, disclosure, alteration, or destruction.
                </p>
                <p>
                  These measures include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Secure storage systems with restricted access</li>
                  <li>Encryption of sensitive data during transmission</li>
                  <li>Regular security assessments and updates</li>
                  <li>Staff training on data protection and confidentiality</li>
                  <li>Secure payment processing through PCI-compliant providers</li>
                </ul>
                <p className="pt-4">
                  However, please note that no method of transmission over the internet or electronic storage 
                  is 100% secure. While we strive to use commercially acceptable means to protect your 
                  information, we cannot guarantee absolute security.
                </p>
              </div>
            </div>

            {/* Data Retention */}
            <div>
              <h2 className="text-3xl font-bold text-nail-queen-brown mb-4">
                Data Retention
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  We retain your personal information only for as long as necessary to fulfill the purposes 
                  outlined in this Privacy Policy, unless a longer retention period is required or permitted 
                  by law.
                </p>
                <p>
                  Appointment and treatment records may be retained for several years to maintain service 
                  history and for legal compliance purposes. Marketing communications data will be retained 
                  until you opt out or request deletion.
                </p>
              </div>
            </div>

            {/* Your Rights */}
            <div>
              <h2 className="text-3xl font-bold text-nail-queen-brown mb-4">
                Your Rights
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  You have the following rights regarding your personal information:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Access:</strong> Request access to the personal information we hold about you</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal obligations)</li>
                  <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications at any time</li>
                  <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
                  <li><strong>Portability:</strong> Request a copy of your information in a structured, machine-readable format</li>
                </ul>
                <p className="pt-4">
                  To exercise any of these rights, please contact us using the information provided below. 
                  We will respond to your request within a reasonable timeframe and in accordance with 
                  applicable laws.
                </p>
              </div>
            </div>

            {/* Cookies and Tracking */}
            <div>
              <h2 className="text-3xl font-bold text-nail-queen-brown mb-4">
                Cookies and Tracking Technologies
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Our website may use cookies and similar tracking technologies to enhance your browsing 
                  experience and analyze site usage. Cookies are small data files stored on your device.
                </p>
                <p>
                  We use cookies for:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Maintaining your session and preferences</li>
                  <li>Understanding how visitors use our website</li>
                  <li>Improving site functionality and user experience</li>
                  <li>Delivering relevant content and advertisements</li>
                </ul>
                <p className="pt-4">
                  You can control cookie settings through your browser preferences. However, disabling 
                  cookies may limit your ability to use certain features of our website.
                </p>
              </div>
            </div>

            {/* Third-Party Links */}
            <div>
              <h2 className="text-3xl font-bold text-nail-queen-brown mb-4">
                Third-Party Links
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Our website may contain links to third-party websites, social media platforms, or services 
                  that are not operated by us. We are not responsible for the privacy practices of these 
                  third parties.
                </p>
                <p>
                  We encourage you to review the privacy policies of any third-party sites you visit. 
                  This Privacy Policy applies only to information collected by Nail Queen.
                </p>
              </div>
            </div>

            {/* Children's Privacy */}
            <div>
              <h2 className="text-3xl font-bold text-nail-queen-brown mb-4">
                Children's Privacy
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Our services are not directed to children under the age of 13. We do not knowingly collect 
                  personal information from children under 13. If you are a parent or guardian and believe 
                  your child has provided us with personal information, please contact us immediately.
                </p>
                <p>
                  For minors aged 13-18, we require parental or guardian consent for certain services.
                </p>
              </div>
            </div>

            {/* Changes to This Policy */}
            <div>
              <h2 className="text-3xl font-bold text-nail-queen-brown mb-4">
                Changes to This Privacy Policy
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our practices, 
                  technology, legal requirements, or other factors. Any changes will be posted on this page 
                  with an updated "Last Updated" date.
                </p>
                <p>
                  We encourage you to review this Privacy Policy periodically. Your continued use of our 
                  services after any changes constitutes acceptance of the updated policy.
                </p>
              </div>
            </div>

            {/* Contact Us */}
            <div>
              <h2 className="text-3xl font-bold text-nail-queen-brown mb-4">
                Contact Us
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  If you have any questions, concerns, or requests regarding this Privacy Policy or our 
                  data practices, please contact us:
                </p>
                <div className="pl-6">
                  <p><strong>Nail Queen</strong></p>
                  <p>14 Scotts Road, Far East Plaza</p>
                  <p>#02-02, Singapore 228213</p>
                  <p className="mt-2">
                    Phone: <a href="tel:+6562355875" className="text-nail-queen-brown hover:underline">6235 5875</a>
                  </p>
                  <p className="mt-2">
                    For privacy-related inquiries, please mention "Privacy Policy" in your communication.
                  </p>
                </div>
              </div>
            </div>

            {/* Last Updated */}
            <div className="pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                Last Updated: February 2026
              </p>
            </div>

          </div>
        </div>
      </section>
    </Layout>
  );
}
