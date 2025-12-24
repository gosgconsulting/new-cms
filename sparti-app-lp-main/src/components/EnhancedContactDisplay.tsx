import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Phone, Mail, Globe, ExternalLink, Copy, Plus } from 'lucide-react';
import { BusinessLead } from '@/types/leadGeneration';
import { toast } from 'sonner';

interface EnhancedContactDisplayProps {
  lead: BusinessLead;
  className?: string;
}

const EnhancedContactDisplay: React.FC<EnhancedContactDisplayProps> = ({ 
  lead, 
  className = "" 
}) => {
  const [showAllContacts, setShowAllContacts] = useState(false);

  // Collect all contact methods
  const contacts = {
    phones: [
      lead.phone,
      lead.contactInfo?.phone,
    ].filter(Boolean).filter((phone, index, arr) => arr.indexOf(phone) === index),
    
    emails: [
      lead.email,
      lead.contactInfo?.email,
    ].filter(Boolean).filter((email, index, arr) => arr.indexOf(email) === index),
    
    websites: [
      lead.website,
      lead.contactInfo?.website,
      lead.social_media?.website,
    ].filter(Boolean).filter((site, index, arr) => arr.indexOf(site) === index)
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard`);
  };

  const formatPhoneNumber = (phone: string) => {
    // Basic phone formatting - could be enhanced based on country
    return phone.replace(/[\s()-]/g, '');
  };

  const formatWebsiteUrl = (url: string) => {
    if (!url.startsWith('http')) {
      return `https://${url}`;
    }
    return url;
  };

  const renderContactItem = (contact: string, type: 'phone' | 'email' | 'website', index: number) => {
    const icons = {
      phone: Phone,
      email: Mail,
      website: Globe
    };
    
    const Icon = icons[type];
    const displayText = type === 'website' ? 
      contact.replace(/^https?:\/\//, '').replace(/\/$/, '') : 
      contact;

    return (
      <div key={`${type}-${index}`} className="flex items-center gap-2 p-2 rounded border border-border/50 bg-card/50">
        <Icon className="h-4 w-4 text-contact-blue" />
        <span className="flex-1 text-sm truncate">{displayText}</span>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => copyToClipboard(contact, type)}
          >
            <Copy className="h-3 w-3" />
          </Button>
          {type === 'phone' && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => window.open(`tel:${formatPhoneNumber(contact)}`, '_blank')}
            >
              <Phone className="h-3 w-3" />
            </Button>
          )}
          {type === 'email' && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => window.open(`mailto:${contact}`, '_blank')}
            >
              <Mail className="h-3 w-3" />
            </Button>
          )}
          {type === 'website' && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => window.open(formatWebsiteUrl(contact), '_blank')}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  const totalContacts = contacts.phones.length + contacts.emails.length + contacts.websites.length;

  if (totalContacts === 0) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <div className="text-muted-foreground text-sm">No contact information available</div>
        <Badge variant="outline" className="mt-1 bg-red-500/20 text-red-400 border-red-500/30">
          Contact Research Needed
        </Badge>
      </div>
    );
  }

  // Show primary contacts inline
  const primaryPhone = contacts.phones[0];
  const primaryEmail = contacts.emails[0];
  const primaryWebsite = contacts.websites[0];
  const additionalCount = totalContacts - (primaryPhone ? 1 : 0) - (primaryEmail ? 1 : 0) - (primaryWebsite ? 1 : 0);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Primary Contacts - Always Visible */}
      <div className="space-y-1">
        {primaryPhone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-contact-blue" />
            <a 
              href={`tel:${formatPhoneNumber(primaryPhone)}`}
              className="text-sm text-contact-blue hover:underline flex-1 truncate"
            >
              {primaryPhone}
            </a>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => copyToClipboard(primaryPhone, 'Phone')}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        )}

        {primaryEmail && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-contact-blue" />
            <a 
              href={`mailto:${primaryEmail}`}
              className="text-sm text-contact-blue hover:underline flex-1 truncate"
            >
              {primaryEmail}
            </a>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => copyToClipboard(primaryEmail, 'Email')}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        )}

        {primaryWebsite && (
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-contact-blue" />
            <a 
              href={formatWebsiteUrl(primaryWebsite)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-contact-blue hover:underline flex-1 truncate"
            >
              {primaryWebsite.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </a>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => window.open(formatWebsiteUrl(primaryWebsite), '_blank')}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Additional Contacts - Expandable */}
      {additionalCount > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              +{additionalCount} more contact{additionalCount > 1 ? 's' : ''}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-3">
              <div className="font-medium text-sm">All Contact Information</div>
              
              {contacts.phones.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Phone Numbers</div>
                  {contacts.phones.map((phone, index) => 
                    renderContactItem(phone, 'phone', index)
                  )}
                </div>
              )}

              {contacts.emails.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Email Addresses</div>
                  {contacts.emails.map((email, index) => 
                    renderContactItem(email, 'email', index)
                  )}
                </div>
              )}

              {contacts.websites.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Websites</div>
                  {contacts.websites.map((website, index) => 
                    renderContactItem(website, 'website', index)
                  )}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Contact Quality Indicator */}
      <Badge 
        variant="outline" 
        className={`text-xs ${
          totalContacts >= 3 ? 'bg-opportunity-green/20 text-opportunity-green border-opportunity-green/30' :
          totalContacts >= 2 ? 'bg-primary/20 text-primary border-primary/30' :
          'bg-lead-orange/20 text-lead-orange border-lead-orange/30'
        }`}
      >
        {totalContacts} Contact Method{totalContacts > 1 ? 's' : ''}
      </Badge>
    </div>
  );
};

export default EnhancedContactDisplay;