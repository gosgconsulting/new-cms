import React from 'react';
import UnifiedBusinessTable, { UnifiedBusinessLead } from '@/components/base/UnifiedBusinessTable';

// Real business lead interface based on the Lobstr API response
interface BusinessLead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  category?: string;
  rating?: number;
  reviews_count?: number;
  social_media?: {
    website?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  latitude?: number;
  longitude?: number;
  place_id?: string;
  google_id?: string;
  processing_status?: string;
  scraped_at?: string;
}

interface RealBusinessLeadsTableProps {
  leads: BusinessLead[];
  isLoading?: boolean;
  className?: string;
  creditsUsed?: number;
}

const RealBusinessLeadsTable: React.FC<RealBusinessLeadsTableProps> = ({
  leads,
  isLoading = false,
  className,
  creditsUsed = 0
}) => {
  // Convert BusinessLead to UnifiedBusinessLead format
  const unifiedLeads: UnifiedBusinessLead[] = leads.map(lead => ({
    ...lead,
    // Ensure all properties are properly mapped
    phone: lead.phone || null,
    email: lead.email || null,
    website: lead.website || null,
    address: lead.address || null,
    category: lead.category || null,
    rating: lead.rating || null,
    reviews_count: lead.reviews_count || null,
    social_media: lead.social_media || null,
    latitude: lead.latitude || null,
    longitude: lead.longitude || null,
    place_id: lead.place_id || null,
    google_id: lead.google_id || null,
    processing_status: lead.processing_status || null,
    scraped_at: lead.scraped_at || null
  }));

  if (isLoading) {
    return (
      <UnifiedBusinessTable
        leads={[]}
        isLoading={true}
        className={className}
        title="Loading business leads..."
        subtitle="Please wait while we fetch your data"
        showLiveDataBadge={true}
        creditsUsed={creditsUsed}
      />
    );
  }

  return (
    <UnifiedBusinessTable
      leads={unifiedLeads}
      className={className}
      title={`${leads.length} business lead${leads.length !== 1 ? 's' : ''} found`}
      subtitle="Real contact information from business directories"
      showLiveDataBadge={true}
      creditsUsed={creditsUsed}
    />
  );
};

export default RealBusinessLeadsTable;