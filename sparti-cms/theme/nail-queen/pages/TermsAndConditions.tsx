import { Layout } from "../components/Layout";

export default function TermsAndConditions({
    basePath,
}: {
    basePath: string;
}) {
    const asset = (path: string) => `${basePath.replace(/\/+$/, "")}/assets/${path.replace(/^\/+/, "")}`;

  return (
    <Layout basePath={basePath}>
      {/* Header */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-6xl font-bold text-center text-nail-queen-brown mb-6">
            Terms & Conditions
          </h1>
          <p className="text-center text-gray-600 max-w-3xl mx-auto">
            Please read these terms and conditions carefully before using our services.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            
            {/* Appointment Policy */}
            <div>
              <h2 className="text-3xl font-bold text-nail-queen-brown mb-4">
                Appointment Policy
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Appointments are highly recommended to ensure we can provide you with our full attention 
                  and the best service possible. Walk-ins are welcome subject to availability.
                </p>
                <p>
                  If you need to reschedule or cancel your appointment, please provide at least 24 hours 
                  notice. Late cancellations or no-shows may be subject to a cancellation fee.
                </p>
                <p>
                  Please arrive 5-10 minutes early for your appointment. Arriving late may result in a 
                  shortened service time or rescheduling to accommodate other clients.
                </p>
              </div>
            </div>

            {/* Payment Terms */}
            <div>
              <h2 className="text-3xl font-bold text-nail-queen-brown mb-4">
                Payment Terms
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  All prices listed on our website and in-salon are inclusive of GST unless otherwise stated. 
                  We accept cash, credit cards, and major payment methods.
                </p>
                <p>
                  Payment is due at the time of service. We reserve the right to refuse service if payment 
                  cannot be provided.
                </p>
                <p>
                  Gratuities are always appreciated but never required. If you're satisfied with your service, 
                  tips can be given directly to your technician.
                </p>
              </div>
            </div>

            {/* Health & Safety */}
            <div>
              <h2 className="text-3xl font-bold text-nail-queen-brown mb-4">
                Health & Safety
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Your health and safety are our top priorities. We maintain the highest standards of 
                  cleanliness and sterilization for all tools and equipment.
                </p>
                <p>
                  Please inform your technician if you have any allergies, skin sensitivities, medical 
                  conditions, or are pregnant before receiving any service.
                </p>
                <p>
                  We reserve the right to refuse service if we believe it may compromise your health or 
                  the health of our staff. This includes visible signs of infection, fungus, or other 
                  contagious conditions.
                </p>
                <p>
                  Clients are required to inform staff immediately if they experience any discomfort, 
                  pain, or adverse reactions during their service.
                </p>
              </div>
            </div>

            {/* Service Guarantee */}
            <div>
              <h2 className="text-3xl font-bold text-nail-queen-brown mb-4">
                Service Guarantee
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  We stand behind the quality of our work. If you experience any issues with your gel 
                  manicure or pedicure within 3 days of service (such as lifting, chipping, or peeling), 
                  please contact us immediately for a complimentary fix.
                </p>
                <p>
                  This guarantee does not cover damage caused by wear and tear, improper care, exposure 
                  to harsh chemicals, or failure to follow aftercare instructions.
                </p>
                <p>
                  For nail art and extensions, any adjustments must be requested within 24 hours of your 
                  appointment.
                </p>
              </div>
            </div>

            {/* Client Conduct */}
            <div>
              <h2 className="text-3xl font-bold text-nail-queen-brown mb-4">
                Client Conduct
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  We strive to maintain a peaceful and comfortable environment for all clients and staff. 
                  We ask that you please silence mobile devices and keep conversation volumes respectful.
                </p>
                <p>
                  Children must be supervised at all times. For safety reasons, children under 12 should 
                  not receive certain services without parental consent.
                </p>
                <p>
                  We reserve the right to refuse service or ask clients to leave if they display 
                  inappropriate behavior, including but not limited to: harassment, intoxication, 
                  or disrespect toward staff or other clients.
                </p>
              </div>
            </div>

            {/* Liability */}
            <div>
              <h2 className="text-3xl font-bold text-nail-queen-brown mb-4">
                Liability
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  While we take every precaution to ensure your safety, Nail Queen is not liable for 
                  allergic reactions, infections, or other issues that arise from services, provided that 
                  proper sanitation and professional procedures were followed.
                </p>
                <p>
                  We are not responsible for personal belongings. Please keep your valuables secure during 
                  your visit.
                </p>
                <p>
                  By using our services, you acknowledge and accept the inherent risks associated with 
                  nail care services and agree to release Nail Queen from any claims arising from such risks.
                </p>
              </div>
            </div>

            {/* Changes to Terms */}
            <div>
              <h2 className="text-3xl font-bold text-nail-queen-brown mb-4">
                Changes to Terms
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Nail Queen reserves the right to modify these terms and conditions at any time. 
                  Changes will be effective immediately upon posting to our website or in-salon.
                </p>
                <p>
                  It is your responsibility to review these terms periodically. Continued use of our 
                  services constitutes acceptance of any changes.
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-nail-queen-brown mb-4">
                Contact Us
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  If you have any questions about these Terms & Conditions, please don't hesitate to 
                  contact us:
                </p>
                <div className="pl-6">
                  <p><strong>Nail Queen</strong></p>
                  <p>14 Scotts Road, Far East Plaza</p>
                  <p>#02-02, Singapore 228213</p>
                  <p className="mt-2">
                    Phone: <a href="tel:+6562355875" className="text-nail-queen-brown hover:underline">6235 5875</a>
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
