import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Loader2, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ScrapedLead, ProgressCallback } from '@/services/lobstrService';
import { COUNTRIES_WITH_POPULAR_FIRST } from '@/data/countries-languages';
import AnimatedBusinessSearchLoader from '@/components/AnimatedBusinessSearchLoader';
import { supabase } from '@/integrations/supabase/client';

interface LeadsScrapingFormProps {
  onComplete: (leads: ScrapedLead[], runId: string, query: string, location: string) => void;
  onBack: () => void;
  sourceType?: 'business' | 'hotels';
}

interface StepStatus {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  message?: string;
  errorMessage?: string;
}

export const LeadsScrapingForm = ({ onComplete, onBack, sourceType = 'business' }: LeadsScrapingFormProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [steps, setSteps] = useState<StepStatus[]>([]);
  const [progress, setProgress] = useState(0);

  // Form states
  const [activity, setActivity] = useState('');
  const [country, setCountry] = useState('Thailand');
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const [maxResults, setMaxResults] = useState(50);

  const businessActivityOptions = [
    { value: 'restaurants', label: 'Restaurants' },
    { value: 'hotels', label: 'Hotels' },
    { value: 'gyms', label: 'Gyms & Fitness' },
    { value: 'cafes', label: 'Cafes & Coffee' },
    { value: 'beauty salons', label: 'Beauty Salons' },
    { value: 'retail stores', label: 'Retail Stores' },
    { value: 'auto repair', label: 'Auto Repair' },
    { value: 'medical clinics', label: 'Medical Clinics' },
    { value: 'dental clinics', label: 'Dental Clinics' },
    { value: 'real estate', label: 'Real Estate' },
  ];

  const hotelActivityOptions = [
    { value: 'luxury hotels', label: 'Luxury Hotels' },
    { value: 'boutique hotels', label: 'Boutique Hotels' },
    { value: 'business hotels', label: 'Business Hotels' },
    { value: 'resort hotels', label: 'Resort Hotels' },
    { value: 'budget hotels', label: 'Budget Hotels' },
    { value: 'hostels', label: 'Hostels' },
    { value: 'serviced apartments', label: 'Serviced Apartments' },
    { value: 'vacation rentals', label: 'Vacation Rentals' },
    { value: 'bed and breakfast', label: 'Bed & Breakfast' },
    { value: 'motels', label: 'Motels' },
  ];

  const activityOptions = sourceType === 'hotels' ? hotelActivityOptions : businessActivityOptions;

  // Popular regions/states for common countries
  const regionOptions = [
    { value: '', label: 'Any Region' },
    { value: 'Bangkok', label: 'Bangkok' },
    { value: 'Chiang Mai', label: 'Chiang Mai' },
    { value: 'Phuket', label: 'Phuket' },
    { value: 'California', label: 'California' },
    { value: 'New York', label: 'New York' },
    { value: 'Texas', label: 'Texas' },
    { value: 'Florida', label: 'Florida' },
    { value: 'London', label: 'London' },
    { value: 'Manchester', label: 'Manchester' },
  ];

  // Popular cities that work across countries
  const cityOptions = [
    { value: '', label: 'Any City' },
    { value: 'Bangkok', label: 'Bangkok' },
    { value: 'Chiang Mai', label: 'Chiang Mai' },
    { value: 'Pattaya', label: 'Pattaya' },
    { value: 'Phuket', label: 'Phuket City' },
    { value: 'Los Angeles', label: 'Los Angeles' },
    { value: 'New York', label: 'New York' },
    { value: 'Chicago', label: 'Chicago' },
    { value: 'London', label: 'London' },
    { value: 'Manchester', label: 'Manchester' },
  ];

  const abortLimitOptions = [
    { value: 50, label: '50 Results' },
    { value: 100, label: '100 Results' },
    { value: 200, label: '200 Results' },
    { value: 400, label: '400 Results' },
    { value: 600, label: '600 Results' },
    { value: 800, label: '800 Results' },
    { value: 1000, label: '1000 Results' },
  ];

  const countryOptions = COUNTRIES_WITH_POPULAR_FIRST;

  const initializeSteps = (query: string, location: string) => {
    return [
      {
        id: 1,
        title: 'Search Google Maps',
        description: `Searching for "${query}" in ${location}`,
        status: 'pending' as const,
      },
      {
        id: 2,
        title: 'Process Results',
        description: 'Transforming and validating business data',
        status: 'pending' as const,
      },
      {
        id: 3,
        title: 'Save to Database',
        description: 'Saving leads to your database',
        status: 'pending' as const,
      },
    ];
  };

  const updateStepStatus: ProgressCallback = (stepId, title, description, status, errorMessage) => {
    const mappedStatus = status === 'active' ? 'running' : status;

    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId
          ? { ...step, title, description, status: mappedStatus, errorMessage }
          : step
      )
    );

    const baseProgress = (stepId - 1) * 33.33;
    const stepProgress = mappedStatus === 'completed' ? 33.33 : mappedStatus === 'running' ? 16.66 : 0;
    setProgress(baseProgress + stepProgress);
  };

  const handleSearch = async () => {
    if (!user) {
      toast.error('Please log in to search for business leads');
      return;
    }

    if (!activity.trim()) {
      toast.error('Please select an activity to search');
      return;
    }

    // At least country is required
    if (!country.trim()) {
      toast.error('Please select a country to search');
      return;
    }

    setIsLoading(true);
    setProgress(0);

    const query = activity;
    const locationParts = [];
    // Build location string from most specific to least specific
    if (city.trim()) locationParts.push(city.trim());
    if (region.trim()) locationParts.push(region.trim());
    locationParts.push(country.trim()); // Country is always included
    const location = locationParts.join(', ');

    setSteps(initializeSteps(query, location));

    try {
      // Call appropriate API based on source type
      updateStepStatus(1, 'Initializing Search', `Preparing ${sourceType === 'hotels' ? 'hotel' : 'business'} search...`, 'active');
      
      const functionName = sourceType === 'hotels' ? 'apify-hotels' : 'apify-places';
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: sourceType === 'hotels' ? {
          searchQuery: `${activity} ${location}`,
          maxResults,
          checkInDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          checkOutDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        } : {
          query,
          location,
          leadQuantity: maxResults,
          country,
          includeOpeningHours: true,
          includeAdditionalInfo: true,
          includeCompanyContacts: true,
          includeBusinessLeads: true,
          includeReviewCount: true,
          includeContactDetails: true
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      updateStepStatus(1, 'Search Complete', `${sourceType === 'hotels' ? 'Hotel' : 'Business'} search completed successfully`, 'completed');
      
      // Transform results to our lead format
      updateStepStatus(2, 'Processing Results', 'Transforming data...', 'active');
      
      const results = sourceType === 'hotels' ? data?.hotels : data?.places;
      const transformedLeads: ScrapedLead[] = (results || []).map((item: any) => {
        if (sourceType === 'hotels') {
          return {
            id: item.placeId || crypto.randomUUID(),
            name: item.hotelName || 'Unknown Hotel',
            address: item.address || '',
            phone: item.phone,
            email: item.email,
            website: item.website,
            rating: item.rating,
            category: item.propertyType || 'hotel',
            isBusinessLead: true,
            leadScore: item.rating ? (item.rating * 2) : 5,
            source: 'apify-hotels',
            scrapedAt: new Date().toISOString(),
            contactInfo: { phone: item.phone, email: item.email, website: item.website },
            businessDetails: {
              description: item.description || '',
              openingHours: item.checkInTime,
              verified: true,
              reviewsCount: item.reviewsCount || 0,
              status: item.businessStatus || 'OPERATIONAL',
              hotelData: {
                starRating: item.starRating,
                pricePerNight: item.pricePerNight,
                amenities: item.amenities,
                rooms: item.rooms,
                bookingLinks: item.bookingLinks
              }
            }
          };
        } else {
          return {
            id: item.placeId || crypto.randomUUID(),
            name: item.title || 'Unknown Business',
            address: item.address || '',
            phone: item.phone,
            email: item.email,
            website: item.website,
            rating: item.rating,
            category: item.categories?.[0] || activity,
            isBusinessLead: true,
            leadScore: item.reviewsCount ? Math.min(item.reviewsCount / 10, 10) : 5,
            source: 'apify',
            scrapedAt: new Date().toISOString(),
            contactInfo: { phone: item.phone, email: item.email, website: item.website },
            businessDetails: {
              description: item.description || '',
              openingHours: item.openingHours,
              verified: item.verified,
              reviewsCount: item.reviewsCount || 0,
              status: item.temporarilyClosed ? 'CLOSED_TEMPORARILY' : (item.permanentlyClosed ? 'CLOSED_PERMANENTLY' : 'OPERATIONAL'),
              websiteEmails: item.websiteEmails || [],
              socialMedia: item.socialMedia || {},
              websiteTechnology: item.websiteTechnology || [],
              adPixels: item.digitalPresence?.adPixels || [],
              bookingLinks: item.bookingLinks || {},
              orderLinks: item.orderLinks || [],
              menuLink: item.menuLink,
              priceLevel: item.priceRange,
              additionalInfo: item.additionalInfo || {},
              popularTimes: item.popularTimes || [],
              temporarilyClosed: item.temporarilyClosed || false,
              permanentlyClosed: item.permanentlyClosed || false,
              images: item.images || [],
              peopleAlsoSearch: item.peopleAlsoSearch || []
            }
          };
        }
      });

      updateStepStatus(2, 'Processing Complete', `Processed ${transformedLeads.length} leads`, 'completed');
      
      // Save to database
      updateStepStatus(3, 'Saving to Database', 'Saving leads to database...', 'active');
      
      // Create campaign record
      const { data: campaignRecord, error: campaignError } = await supabase
        .from('scraping_runs')
        .insert({
          user_id: user.id,
          query,
          location,
          max_results: maxResults,
          results_count: transformedLeads.length,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Save leads to appropriate table
      if (sourceType === 'hotels') {
        const hotelsToSave = transformedLeads.map(lead => ({
          user_id: user.id,
          campaign_id: campaignRecord.id,
          hotel_name: lead.name,
          address: lead.address,
          phone: lead.phone,
          email: lead.email,
          website: lead.website,
          rating: lead.rating,
          reviews_count: lead.businessDetails?.reviewsCount || 0,
          place_id: lead.id,
          business_status: lead.businessDetails?.status || 'OPERATIONAL',
          star_rating: lead.businessDetails?.hotelData?.starRating,
          price_per_night: lead.businessDetails?.hotelData?.pricePerNight,
          amenities: lead.businessDetails?.hotelData?.amenities || [],
          rooms: lead.businessDetails?.hotelData?.rooms || [],
          booking_links: lead.businessDetails?.hotelData?.bookingLinks || {},
          description: lead.businessDetails?.description,
          images: lead.businessDetails?.images || [],
          raw_data: lead
        }));

        const { error: hotelsError } = await supabase
          .from('google_hotels_leads')
          .insert(hotelsToSave);

        if (hotelsError) throw hotelsError;
      } else {
        // Save business leads with enhanced data
        const leadsToSave = transformedLeads.map(lead => ({
          run_id: campaignRecord.id,
          user_id: user.id,
          business_name: lead.name,
          address: lead.address,
          phone: lead.phone,
          email: lead.email,
          website: lead.website,
          rating: lead.rating,
          reviews_count: lead.businessDetails?.reviewsCount || 0,
          category: lead.category,
          place_id: lead.id,
          business_status: lead.businessDetails?.status || 'OPERATIONAL',
          opening_hours: lead.businessDetails?.openingHours ? { hours: lead.businessDetails.openingHours } : null,
          // Enhanced fields from Apify
          website_emails: lead.businessDetails?.websiteEmails || [],
          social_media_links: lead.businessDetails?.socialMedia || {},
          website_technologies: lead.businessDetails?.websiteTechnology || [],
          ad_pixels: lead.businessDetails?.adPixels || [],
          booking_links: lead.businessDetails?.bookingLinks || {},
          order_links: lead.businessDetails?.orderLinks || [],
          menu_link: lead.businessDetails?.menuLink,
          price_level: lead.businessDetails?.priceLevel,
          additional_info: lead.businessDetails?.additionalInfo || {},
          popular_times: lead.businessDetails?.popularTimes || [],
          temporarily_closed: lead.businessDetails?.temporarilyClosed || false,
          permanently_closed: lead.businessDetails?.permanentlyClosed || false,
          images: lead.businessDetails?.images || [],
          people_also_search: lead.businessDetails?.peopleAlsoSearch || [],
          raw_data: lead
        }));

        const { error: leadsError } = await supabase
          .from('google_maps_leads')
          .insert(leadsToSave);

        if (leadsError) throw leadsError;
      }

      updateStepStatus(3, 'Save Complete', `Saved ${transformedLeads.length} leads`, 'completed');
      
      setProgress(100);
      onComplete(transformedLeads, campaignRecord.id, query, location);
      
    } catch (error) {
      console.error('Business search failed:', error);

      setSteps((prevSteps) =>
        prevSteps.map((step) =>
          step.status === 'running'
            ? {
                ...step,
                status: 'error' as const,
                errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
              }
            : step
        )
      );

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!isLoading ? (
        <>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  {/* Activity Dropdown */}
                  <div className="col-span-1">
                    <SearchableSelect
                      options={activityOptions}
                      value={activity}
                      onValueChange={setActivity}
                      placeholder="Activity"
                      searchPlaceholder="Search activities..."
                      allowCustomEntry={true}
                      className="h-12 bg-card border-border"
                    />
                  </div>

                  {/* Country Dropdown */}
                  <div className="col-span-1">
                    <SearchableSelect
                      options={countryOptions}
                      value={country}
                      onValueChange={setCountry}
                      placeholder="Country"
                      searchPlaceholder="Search countries..."
                      allowCustomEntry={true}
                      className="h-12 bg-card border-border"
                    />
                  </div>

                  {/* Region Dropdown */}
                  <div className="col-span-1">
                    <SearchableSelect
                      options={regionOptions}
                      value={region}
                      onValueChange={setRegion}
                      placeholder="Region/State"
                      searchPlaceholder="Search regions..."
                      allowCustomEntry={true}
                      className="h-12 bg-card border-border"
                    />
                  </div>

                  {/* City Dropdown */}
                  <div className="col-span-1">
                    <SearchableSelect
                      options={cityOptions}
                      value={city}
                      onValueChange={setCity}
                      placeholder="City/Location"
                      searchPlaceholder="Search cities..."
                      allowCustomEntry={true}
                      className="h-12 bg-card border-border"
                    />
                  </div>
                </div>

                {/* Search Button and Max Results */}
                <div className="flex gap-4">
                  <Button
                    onClick={handleSearch}
                    disabled={!activity.trim() || !country.trim()}
                    className="flex-[0.7] h-12"
                    size="lg"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Search
                  </Button>

                  <div className="flex-[0.3]">
                    <SearchableSelect
                      options={abortLimitOptions.map((option) => ({
                        value: option.value.toString(),
                        label: option.label,
                      }))}
                      value={maxResults.toString()}
                      onValueChange={(value) => setMaxResults(Number(value))}
                      placeholder="Max Results"
                      className="h-12 bg-card border-border"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-start">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
          </div>
        </>
      ) : (
        <AnimatedBusinessSearchLoader
          steps={steps}
          progress={progress}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};
