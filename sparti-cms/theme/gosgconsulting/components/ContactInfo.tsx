import React from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { SchemaItem } from '../utils/schemaHelpers'; // type only
import { getTextByKey } from '../utils/schemaHelpers';

interface ContactInfoProps {
  items?: SchemaItem[];
  title?: string;
  subtitle?: string;
  address?: string;
  email?: string;
  phone?: string;
  hours?: string;
}

const ContactInfo: React.FC<ContactInfoProps> = ({
  items = [],
  title,
  subtitle,
  address,
  email,
  phone,
  hours
}) => {
  // Prefer editor-provided items if available
  const finalTitle = title || getTextByKey(items, 'title') || 'Get in touch';
  const finalSubtitle =
    subtitle ||
    getTextByKey(items, 'subtitle') ||
    'We\'d love to hear from you. Reach out using any of the methods below.';
  const finalAddress =
    address || getTextByKey(items, 'address') || '123 Example Street, Sample City, Country';
  const finalEmail = email || getTextByKey(items, 'email') || 'contact@example.com';
  const finalPhone = phone || getTextByKey(items, 'phone') || '+1 (555) 123-4567';
  const finalHours = hours || getTextByKey(items, 'hours') || 'Mon–Fri: 9:00 AM – 6:00 PM';

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold">{finalTitle}</h2>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            {finalSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 border rounded-lg bg-white flex items-start gap-3">
            <div className="p-2 rounded-md bg-secondary text-foreground">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Address</h3>
              <p className="text-xs text-muted-foreground mt-1">{finalAddress}</p>
            </div>
          </div>

          <div className="p-5 border rounded-lg bg-white flex items-start gap-3">
            <div className="p-2 rounded-md bg-secondary text-foreground">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Email</h3>
              <a
                href={`mailto:${finalEmail}`}
                className="text-xs text-muted-foreground mt-1 hover:underline"
              >
                {finalEmail}
              </a>
            </div>
          </div>

          <div className="p-5 border rounded-lg bg-white flex items-start gap-3">
            <div className="p-2 rounded-md bg-secondary text-foreground">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Phone</h3>
              <a
                href={`tel:${finalPhone.replace(/\D/g, '')}`}
                className="text-xs text-muted-foreground mt-1 hover:underline"
              >
                {finalPhone}
              </a>
            </div>
          </div>

          <div className="p-5 border rounded-lg bg-white flex items-start gap-3">
            <div className="p-2 rounded-md bg-secondary text-foreground">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Office Hours</h3>
              <p className="text-xs text-muted-foreground mt-1">{finalHours}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactInfo;