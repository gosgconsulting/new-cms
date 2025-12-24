import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <img src="/lovable-uploads/1d669404-72a7-41cf-b076-dbe1c3fe97ef.png" alt="ACATR" className="h-8 w-auto" />
            </Link>
            <Link to="/">
              <Button variant="outline" className="flex items-center space-x-2 hover:bg-[#8A54E0] hover:text-white hover:border-[#8A54E0] transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Website</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="space-y-8">
          {/* Title */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Privacy Policy</h1>
            </div>
            
          </div>

          {/* Content Sections */}
          <div className="prose prose-lg max-w-none space-y-12">
            
            {/* 1. Introduction */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                1. Introduction
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  At ACATR, we are committed to protecting your personal data and respecting your privacy. 
                  This Privacy Policy explains how we collect, use, process, and protect your personal 
                  information when you use our corporate services.
                </p>
                <p>
                  We comply with Singapore's Personal Data Protection Act (PDPA) and other applicable 
                  data protection laws. This policy applies to all personal data we collect through 
                  our services, website, and business interactions.
                </p>
                <p>
                  By using our services, you consent to the collection and use of your personal data 
                  as outlined in this Privacy Policy.
                </p>
              </div>
            </section>

            {/* 2. Data Collection */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                2. Data Collection
              </h2>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">Types of Personal Data Collected</h3>
                  <ul className="space-y-2 text-muted-foreground pl-6">
                    <li>• <strong>Business incorporation data:</strong> Director details, shareholder information, company addresses</li>
                    <li>• <strong>Contact information:</strong> Names, addresses, phone numbers, email addresses</li>
                    <li>• <strong>Financial information:</strong> Bank account details, financial statements for accounting services</li>
                    <li>• <strong>Identification documents:</strong> NRIC, passport numbers, employment pass details</li>
                    <li>• <strong>Business operational data:</strong> Revenue, expenses, transaction records</li>
                    <li>• <strong>Professional qualifications:</strong> Educational certificates, professional memberships</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">Collection Methods</h3>
                  <ul className="space-y-2 text-muted-foreground pl-6">
                    <li>• Direct collection through service application forms and consultations</li>
                    <li>• Website contact forms and online inquiries</li>
                    <li>• Client meetings, phone calls, and email communications</li>
                    <li>• Third-party sources including regulatory authorities and banks</li>
                    <li>• Document submission for compliance and regulatory purposes</li>
                    <li>• Automated collection through website analytics and cookies</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 3. Purpose of Data Collection */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                3. Purpose of Data Collection
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>We collect and process your personal data for the following purposes:</p>
                <ul className="space-y-2 pl-6">
                  <li>• <strong>Service delivery:</strong> Company incorporation, accounting, and corporate secretarial services</li>
                  <li>• <strong>Regulatory compliance:</strong> Meeting ACRA, IRAS, and other statutory requirements</li>
                  <li>• <strong>Client communication:</strong> Service updates, compliance reminders, and business correspondence</li>
                  <li>• <strong>Legal obligations:</strong> Anti-money laundering checks, due diligence procedures</li>
                  <li>• <strong>Business relationship management:</strong> Account management and service improvements</li>
                  <li>• <strong>Financial management:</strong> Invoicing, payment processing, and accounting</li>
                  <li>• <strong>Quality assurance:</strong> Service monitoring and improvement initiatives</li>
                </ul>
              </div>
            </section>

            {/* 4. Data Sharing and Disclosure */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                4. Data Sharing and Disclosure
              </h2>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">Authorized Sharing</h3>
                  <p className="text-muted-foreground">We may share your personal data with:</p>
                  <ul className="space-y-2 text-muted-foreground pl-6">
                    <li>• <strong>Regulatory authorities:</strong> ACRA, IRAS, MAS, and other government agencies as required by law</li>
                    <li>• <strong>Financial institutions:</strong> Banks for account opening and ongoing banking services</li>
                    <li>• <strong>Professional advisors:</strong> Auditors, legal counsel, and other professional service providers</li>
                    <li>• <strong>Law enforcement:</strong> When legally required or to protect our legitimate interests</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">Third-Party Service Providers</h3>
                  <ul className="space-y-2 text-muted-foreground pl-6">
                    <li>• Cloud storage and IT infrastructure providers</li>
                    <li>• Communication platforms and email service providers</li>
                    <li>• Document management and digital signature platforms</li>
                    <li>• Payment processing and banking services</li>
                  </ul>
                  <p className="text-muted-foreground">
                    All third-party providers are contractually bound to protect your data and use it only for specified purposes.
                  </p>
                </div>
              </div>
            </section>

            {/* 5. Data Retention */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                5. Data Retention
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  We retain personal data in accordance with Singapore regulatory requirements and 
                  business needs:
                </p>
                <ul className="space-y-2 pl-6">
                  <li>• <strong>Company records:</strong> Minimum 5 years post-incorporation or as required by ACRA</li>
                  <li>• <strong>Accounting records:</strong> 5 years from the end of the financial year as per Companies Act</li>
                  <li>• <strong>Tax records:</strong> 5 years as required by IRAS</li>
                  <li>• <strong>Client communications:</strong> 7 years for professional liability purposes</li>
                  <li>• <strong>Website data:</strong> 2 years for analytics and service improvement</li>
                </ul>
                <p>
                  Data is securely disposed of when no longer required, using appropriate deletion 
                  and destruction methods to ensure data cannot be recovered.
                </p>
              </div>
            </section>

            {/* 6. Data Security */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                6. Data Security
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  We implement comprehensive technical and organizational measures to protect your personal data:
                </p>
                <ul className="space-y-2 pl-6">
                  <li>• <strong>Encryption:</strong> Data encrypted in transit and at rest using industry-standard protocols</li>
                  <li>• <strong>Access controls:</strong> Role-based access with multi-factor authentication</li>
                  <li>• <strong>Regular assessments:</strong> Security audits and vulnerability testing</li>
                  <li>• <strong>Staff training:</strong> Regular privacy and security training for all employees</li>
                  <li>• <strong>Incident response:</strong> Procedures for detecting and responding to data breaches</li>
                  <li>• <strong>Physical security:</strong> Secure facilities with controlled access</li>
                </ul>
              </div>
            </section>

            {/* 7. Individual Rights */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                7. Individual Rights (PDPA Compliance)
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>Under Singapore's PDPA, you have the following rights:</p>
                <ul className="space-y-2 pl-6">
                  <li>• <strong>Access:</strong> Request access to your personal data in our possession</li>
                  <li>• <strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
                  <li>• <strong>Withdrawal of consent:</strong> Withdraw consent for processing where applicable</li>
                  <li>• <strong>Data portability:</strong> Request transfer of your data in a structured format</li>
                  <li>• <strong>Complaints:</strong> Lodge complaints about our data handling practices</li>
                </ul>
                <p>
                  To exercise these rights, please contact our Data Protection Officer at 
                  <a href="mailto:privacy@acatr.com" className="text-primary hover:underline"> privacy@acatr.com</a>. 
                  We will respond within 30 days of receiving your request.
                </p>
              </div>
            </section>

            {/* 8. Cookies and Website Data */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                8. Cookies and Website Data
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>Our website uses cookies and similar technologies for:</p>
                <ul className="space-y-2 pl-6">
                  <li>• <strong>Essential functions:</strong> Website functionality and user authentication</li>
                  <li>• <strong>Analytics:</strong> Understanding website usage patterns and improving user experience</li>
                  <li>• <strong>Communication:</strong> Live chat functionality and customer support</li>
                  <li>• <strong>Security:</strong> Preventing fraud and ensuring website security</li>
                </ul>
                <p>
                  You can control cookie settings through your browser preferences. However, 
                  disabling certain cookies may affect website functionality.
                </p>
              </div>
            </section>

            {/* 9. International Data Transfers */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                9. International Data Transfers
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  For our international clients, we may transfer personal data outside Singapore 
                  to facilitate service delivery. Such transfers are conducted with appropriate safeguards:
                </p>
                <ul className="space-y-2 pl-6">
                  <li>• Adequate protection standards equivalent to Singapore's PDPA</li>
                  <li>• Contractual protections with data processors and recipients</li>
                  <li>• Client consent for necessary international transfers</li>
                  <li>• Compliance with destination country data protection laws</li>
                </ul>
              </div>
            </section>

            {/* 10. Policy Updates */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                10. Policy Updates
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  We may update this Privacy Policy periodically to reflect changes in our practices 
                  or legal requirements. Significant changes will be notified through:
                </p>
                <ul className="space-y-2 pl-6">
                  <li>• Email notification to existing clients</li>
                  <li>• Website announcement and updated policy posting</li>
                  <li>• Direct communication for material changes affecting your rights</li>
                </ul>
                <p>
                  Continued use of our services after policy updates constitutes acceptance of the revised terms.
                </p>
              </div>
            </section>

            {/* 11. Contact Information */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                11. Contact Information
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  For privacy-related inquiries, requests, or concerns, please contact our Data Protection Officer:
                </p>
                <div className="bg-muted/30 rounded-lg p-6 space-y-2">
                  <p><strong>Data Protection Officer</strong></p>
                  <p><strong>ACATR Corporate Services</strong></p>
                  <p>Email: privacy@acatr.com</p>
                  <p>Address: [Business Address], Singapore [Postal Code]</p>
                  <p>Phone: +65 [Phone Number]</p>
                  <p>Response timeframe: Within 30 days of request</p>
                </div>
                <p>
                  You may also contact the Personal Data Protection Commission (PDPC) Singapore 
                  if you have concerns about our data handling practices that we cannot resolve.
                </p>
              </div>
            </section>

          </div>

          {/* Footer Navigation */}
          <div className="pt-12 border-t border-border">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <Link to="/">
                <Button variant="outline" className="flex items-center space-x-2 hover:bg-[#8A54E0] hover:text-white hover:border-[#8A54E0] transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Website</span>
                </Button>
              </Link>
              <div className="flex space-x-4 text-sm text-muted-foreground">
                <Link to="/terms-conditions" className="hover:text-foreground transition-colors">
                  Terms & Conditions
                </Link>
                <span>•</span>
                <a href="mailto:privacy@acatr.com" className="hover:text-foreground transition-colors">
                  Privacy Inquiries
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>;
};
export default PrivacyPolicy;