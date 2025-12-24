import React from 'react';
import { ExternalLink, Phone, Mail, Globe, Facebook, Instagram, Twitter, Youtube, Settings } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BusinessLead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  website?: string;
  url?: string;
  contactInfo?: {
    phone: string;
    email: string;
    website: string;
  };
  social_media?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
}

interface BusinessLeadsTableProps {
  leads: BusinessLead[];
  isLoading?: boolean;
}

const BusinessLeadsTable: React.FC<BusinessLeadsTableProps> = ({ leads, isLoading }) => {
  const getSocialMediaLinks = (lead: BusinessLead) => {
    const social = lead.social_media || {};
    return {
      website: lead.contactInfo?.website || lead.website || lead.url || null,
      facebook: social.facebook || null,
      instagram: social.instagram || null,
      twitter: social.twitter || null,
      youtube: social.youtube || null,
    };
  };

  const formatContactInfo = (value: string | undefined) => {
    if (!value || value === 'N/A' || value === '') return 'N/A';
    return value;
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-4 bg-muted rounded flex-1"></div>
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-4 bg-muted rounded w-32"></div>
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-4 bg-muted rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Business Name</TableHead>
            <TableHead className="font-semibold">Phone</TableHead>
            <TableHead className="font-semibold">Email</TableHead>
            <TableHead className="font-semibold">Social Media</TableHead>
            <TableHead className="font-semibold text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead, index) => {
            const socialLinks = getSocialMediaLinks(lead);
            const phone = formatContactInfo(lead.contactInfo?.phone || lead.phone);
            const email = formatContactInfo(lead.contactInfo?.email || lead.email);

            return (
              <TableRow key={lead.id || index} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {socialLinks.website && socialLinks.website !== 'N/A' ? (
                      <a
                        href={socialLinks.website.startsWith('http') ? socialLinks.website : `https://${socialLinks.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                      >
                        {lead.name}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span>{lead.name}</span>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2">
                    {phone !== 'N/A' ? (
                      <a
                        href={`tel:${phone}`}
                        className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                      >
                        <Phone className="h-3 w-3" />
                        {phone}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2">
                    {email !== 'N/A' ? (
                      <a
                        href={`mailto:${email}`}
                        className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                      >
                        <Mail className="h-3 w-3" />
                        {email}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2">
                    {socialLinks.website && socialLinks.website !== 'N/A' && (
                      <a
                        href={socialLinks.website.startsWith('http') ? socialLinks.website : `https://${socialLinks.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="Website"
                      >
                        <Globe className="h-4 w-4" />
                      </a>
                    )}
                    {socialLinks.facebook && (
                      <a
                        href={socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="Facebook"
                      >
                        <Facebook className="h-4 w-4" />
                      </a>
                    )}
                    {socialLinks.instagram && (
                      <a
                        href={socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-pink-600 transition-colors"
                        title="Instagram"
                      >
                        <Instagram className="h-4 w-4" />
                      </a>
                    )}
                    {socialLinks.twitter && (
                      <a
                        href={socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-accent transition-colors"
                        title="Twitter"
                      >
                        <Twitter className="h-4 w-4" />
                      </a>
                    )}
                    {socialLinks.youtube && (
                      <a
                        href={socialLinks.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-red-600 transition-colors"
                        title="YouTube"
                      >
                        <Youtube className="h-4 w-4" />
                      </a>
                    )}
                    {!socialLinks.website && !socialLinks.facebook && !socialLinks.instagram && !socialLinks.twitter && !socialLinks.youtube && (
                      <span className="text-muted-foreground text-sm">N/A</span>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center justify-center">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default BusinessLeadsTable;