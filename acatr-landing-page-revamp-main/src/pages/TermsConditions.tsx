import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
const TermsConditions = () => {
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
            <h1 className="text-4xl font-bold text-foreground">Terms & Conditions</h1>
            
          </div>

          {/* Content Sections */}
          <div className="prose prose-lg max-w-none space-y-12">
            
            {/* 1. Introduction and Acceptance */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                1. Introduction and Acceptance
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Welcome to ACATR, a professional corporate services provider operating in Singapore. 
                  These Terms and Conditions ("Terms") govern your use of our services, including but not 
                  limited to company incorporation, accounting services, and corporate secretarial support.
                </p>
                <p>
                  By engaging our services, submitting an application, or using our website, you acknowledge 
                  that you have read, understood, and agree to be bound by these Terms. If you do not agree 
                  to these Terms, please do not use our services.
                </p>
                <p>
                  These Terms are effective as of January 1, 2024, and will remain in effect until updated. 
                  We reserve the right to modify these Terms at any time, with changes becoming effective 
                  upon posting on our website.
                </p>
              </div>
            </section>

            {/* 2. Service Descriptions */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                2. Service Descriptions
              </h2>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">Company Incorporation Services</h3>
                  <ul className="space-y-2 text-muted-foreground pl-6">
                    <li>• Online company registration with the Accounting and Corporate Regulatory Authority (ACRA)</li>
                    <li>• Business bank account setup assistance and liaison with financial institutions</li>
                    <li>• Provision of registered address services for your business</li>
                    <li>• Preparation and filing of all required incorporation documentation</li>
                    <li>• Company name registration and approval process management</li>
                    <li>• Issuance of incorporation certificates and statutory documents</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">Accounting Services</h3>
                  <ul className="space-y-2 text-muted-foreground pl-6">
                    <li>• Monthly bookkeeping and financial record maintenance</li>
                    <li>• Corporate tax filing and compliance with IRAS requirements</li>
                    <li>• Financial statement preparation and management reporting</li>
                    <li>• GST registration and periodic filing services</li>
                    <li>• Payroll processing and CPF compliance management</li>
                    <li>• Regulatory compliance monitoring and advisory services</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">Corporate Secretarial Services</h3>
                  <ul className="space-y-2 text-muted-foreground pl-6">
                    <li>• Annual return preparation and filing with ACRA</li>
                    <li>• Board meeting coordination and minute-taking services</li>
                    <li>• Statutory document filing and compliance management</li>
                    <li>• Maintenance of statutory registers and company records</li>
                    <li>• Compliance deadline management and reminder services</li>
                    <li>• Corporate governance support and advisory</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 3. Client Obligations */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                3. Client Obligations
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>As our client, you agree to:</p>
                <ul className="space-y-2 pl-6">
                  <li>• Provide accurate, complete, and up-to-date information required for service delivery</li>
                  <li>• Submit all required documentation within the specified timeframes</li>
                  <li>• Comply with all applicable Singapore regulatory requirements and laws</li>
                  <li>• Pay all fees according to the agreed schedule and payment terms</li>
                  <li>• Maintain the confidentiality of any login credentials provided</li>
                  <li>• Notify us immediately of any changes to your business circumstances</li>
                  <li>• Respond promptly to requests for additional information or documentation</li>
                </ul>
              </div>
            </section>

            {/* 4. Fees and Payment Terms */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                4. Fees and Payment Terms
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Our fee structure is transparent and will be clearly communicated during the initial 
                  consultation. Standard billing cycles are monthly for ongoing services, with 
                  incorporation services typically billed upon completion.
                </p>
                <p>
                  We accept payment via bank transfer, cheque, or approved digital payment methods. 
                  Payment terms are typically 14 days from invoice date unless otherwise agreed in writing.
                </p>
                <p>
                  Late payments may incur penalty charges of 1.5% per month on outstanding amounts. 
                  Services may be suspended for accounts more than 30 days overdue.
                </p>
                <p>
                  Refunds are considered on a case-by-case basis, particularly for services not yet 
                  commenced. Additional charges apply for expedited services or urgent requests 
                  requiring after-hours work.
                </p>
              </div>
            </section>

            {/* 5. Limitation of Liability */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                5. Limitation of Liability
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  While we strive to provide professional and accurate services, our liability is 
                  limited to the scope of services explicitly agreed upon in our engagement letter.
                </p>
                <p>
                  We are not liable for decisions made by regulatory authorities (ACRA, IRAS, MAS) 
                  or third-party service providers such as banks. Our responsibility is limited to 
                  proper submission and representation on your behalf.
                </p>
                <p>
                  Client-provided information is assumed to be accurate and complete. We are not 
                  responsible for consequences arising from inaccurate or incomplete information 
                  provided by clients.
                </p>
                <p>
                  Our total liability for any claim shall not exceed the total fees paid by the 
                  client for the specific service giving rise to the claim.
                </p>
              </div>
            </section>

            {/* 6. Confidentiality and Data Protection */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                6. Confidentiality and Data Protection
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  We are committed to maintaining the confidentiality of all client information 
                  in accordance with professional standards and Singapore's Personal Data Protection Act (PDPA).
                </p>
                <p>
                  Client information will only be shared with authorized regulatory authorities, 
                  banks, or other third parties as required for service delivery or legal compliance.
                </p>
                <p>
                  We implement appropriate technical and organizational measures to protect your 
                  personal data against unauthorized access, alteration, disclosure, or destruction.
                </p>
                <p>
                  For detailed information about our data protection practices, please refer to 
                  our Privacy Policy.
                </p>
              </div>
            </section>

            {/* 7. Termination Clauses */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                7. Termination Clauses
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Either party may terminate services with 30 days written notice. Immediate 
                  termination may occur in cases of breach of these Terms or non-payment of fees.
                </p>
                <p>
                  Upon termination, clients remain responsible for all outstanding fees and 
                  charges incurred up to the termination date.
                </p>
                <p>
                  We will facilitate the orderly transfer of client documents and records to 
                  designated parties, subject to payment of all outstanding amounts.
                </p>
                <p>
                  Certain statutory obligations may continue beyond termination, particularly 
                  for corporate secretarial services where we serve as company secretary.
                </p>
              </div>
            </section>

            {/* 8. Governing Law */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                8. Governing Law
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  These Terms are governed by and construed in accordance with the laws of Singapore. 
                  Any disputes arising from these Terms or our services shall be subject to the 
                  exclusive jurisdiction of Singapore courts.
                </p>
                <p>
                  We encourage resolution of disputes through direct communication and negotiation. 
                  If necessary, disputes may be referred to mediation before pursuing legal action.
                </p>
                <p>
                  All services are provided in compliance with applicable Singapore regulatory 
                  requirements and professional standards.
                </p>
              </div>
            </section>

            {/* 9. Contact Information */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                9. Contact Information
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  For questions regarding these Terms or legal notices, please contact us at:
                </p>
                <div className="bg-muted/30 rounded-lg p-6 space-y-2">
                  <p><strong>ACATR Corporate Services</strong></p>
                  <p>Business Registration Number: [Registration Number]</p>
                  <p>Address: [Business Address], Singapore [Postal Code]</p>
                  <p>Email: legal@acatr.com</p>
                  <p>Phone: +65 [Phone Number]</p>
                  <p>Customer Service: info@acatr.com</p>
                </div>
                <p>
                  We aim to respond to all legal inquiries within 3 business days.
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
                <Link to="/privacy-policy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
                <span>•</span>
                <a href="mailto:legal@acatr.com" className="hover:text-foreground transition-colors">
                  Contact Legal
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>;
};
export default TermsConditions;