import { FC, useState, useEffect } from 'react';
import { X, Star, MapPin, Clock, Phone, Globe, ExternalLink, Heart, Navigation, Bookmark, Map, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePlaceFeedback } from '@/hooks/useStubs';
import { useToast } from '@/hooks/use-toast';
import { getPlaceType, checkGoogleVerification } from '@/utils/placeTypes';
import { useResponsive } from '@/hooks/useResponsive';
import { cn } from '@/lib/utils';
import PlaceImage from './PlaceImage';

interface BusinessDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  place: {
    place_id: string;
    name: string;
    formatted_address: string;
    rating?: number;
    user_ratings_total?: number;
    photos?: Array<{
      photo_reference: string;
      height: number;
      width: number;
    }>;
    types: string[];
    primary_type_display_name?: string;
    price_level?: number;
    reviews?: Array<{
      author_name: string;
      rating: number;
      text: string;
      time: number;
      relative_time_description: string;
    }>;
    opening_hours?: {
      open_now: boolean;
      weekday_text?: string[];
    };
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    formatted_phone_number?: string;
    international_phone_number?: string;
    website?: string;
    // Enhanced business information fields
    editorial_summary?: {
      overview?: string;
    };
    current_opening_hours?: {
      weekday_text?: string[];
      open_now?: boolean;
    };
    business_status?: string;
    serves_dine_in?: boolean;
    serves_takeout?: boolean;
    serves_delivery?: boolean;
    reservable?: boolean;
    delivery?: boolean;
    takeout?: boolean;
    curbside_pickup?: boolean;
  } | null;
  userLocation?: { lat: number; lng: number } | null;
}

const BusinessDetailModal: FC<BusinessDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  place,
  userLocation 
}) => {
  const { submitFeedback, getFeedbackSummary, isSubmitting } = usePlaceFeedback();
  const { toast } = useToast();
  const { isMobile } = useResponsive();
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [feedbackSummary, setFeedbackSummary] = useState<{
    pet_friendly_count: number;
    not_pet_friendly_count: number;
    total_votes: number;
    pet_friendly_percentage: number;
  } | null>(null);

  useEffect(() => {
    if (isOpen && place?.place_id) {
      loadFeedbackSummary();
      // Debug: Log the place object to see what data is available
      console.log('Business Detail Modal - Place data:', place);
      console.log('Phone:', place.formatted_phone_number || place.international_phone_number);
      console.log('Website:', place.website);
      console.log('Services:', {
        dine_in: place.serves_dine_in,
        takeout: place.serves_takeout || place.takeout,
        delivery: place.serves_delivery || place.delivery,
        curbside: place.curbside_pickup,
        reservable: place.reservable
      });
    }
  }, [isOpen, place?.place_id]);

  // Reset review index when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentReviewIndex(0);
    }
  }, [isOpen]);

  const loadFeedbackSummary = async () => {
    if (!place?.place_id) return;
    const summary = await getFeedbackSummary(place.place_id);
    setFeedbackSummary(summary);
  };

  const handleFeedback = async (isPetFriendly: boolean) => {
    if (!place?.place_id) return;
    
    const result = await submitFeedback({
      place_id: place.place_id,
      place_name: place.name,
      is_pet_friendly: isPetFriendly,
    });

    if (result.success) {
      await loadFeedbackSummary();
      toast({
        title: "Thank you!",
        description: "Your feedback helps other pet owners.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to submit feedback.",
        variant: "destructive",
      });
    }
  };

  const handleGetDirections = () => {
    if (!place?.geometry?.location || !place?.place_id) return;
    
    const { lat, lng } = place.geometry.location;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${place.place_id}`;
    window.open(url, '_blank');
  };

  const handleViewOnGoogleMaps = () => {
    if (!place?.place_id) return;
    
    const url = `https://www.google.com/maps/place/?q=place_id:${place.place_id}`;
    window.open(url, '_blank');
  };

  const handleCallBusiness = () => {
    if (!place) return;
    
    if (place.formatted_phone_number || place.international_phone_number) {
      const phoneNumber = place.formatted_phone_number || place.international_phone_number;
      window.open(`tel:${phoneNumber}`, '_self');
    }
  };

  const handleCopyAddress = async () => {
    if (!place?.formatted_address) return;
    
    try {
      await navigator.clipboard.writeText(place.formatted_address);
      toast({
        title: "Address copied!",
        description: "Address has been copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy address to clipboard.",
        variant: "destructive",
      });
    }
  };

  const placeType = (place && place.types) ? getPlaceType(place.types, place.primary_type_display_name) : null;
  
  // Check if place is verified based on Google My Business data containing pet keywords
  const isGoogleVerified = place ? checkGoogleVerification(place) : false;

  const getCurrentStatus = () => {
    if (!place?.opening_hours) {
      return { status: "Hours unknown", color: "text-muted-foreground" };
    }

    if (place.opening_hours.open_now) {
      return { status: "Open now", color: "text-accent" };
    } else {
      return { status: "Closed", color: "text-destructive" };
    }
  };

  const getPetFriendlyStatus = () => {
    if (!feedbackSummary || feedbackSummary.total_votes === 0) {
      return { 
        percentage: 0, 
        text: "No pet ratings yet", 
        variant: "secondary" as const,
        votes: 0 
      };
    }

    const percentage = feedbackSummary.pet_friendly_percentage;
    const votes = feedbackSummary.total_votes;
    
    if (percentage >= 70) {
      return { 
        percentage, 
        text: `${percentage}% Pet-Friendly`, 
        variant: "pet-verified" as const,
        votes 
      };
    } else if (percentage >= 40) {
      return { 
        percentage, 
        text: `${percentage}% Pet-Friendly`, 
        variant: "pet-rating" as const,
        votes 
      };
    } else {
      return { 
        percentage, 
        text: `${percentage}% Pet-Friendly`, 
        variant: "destructive" as const,
        votes 
      };
    }
  };

  // Comprehensive pet keyword detection
  const petKeywords = [
    // Direct pet terms
    'dog', 'dogs', 'cat', 'cats', 'pet', 'pets', 'puppy', 'puppies', 'kitten', 'kittens',
    'doggy', 'doggie', 'pup', 'pups', 'canine', 'feline', 'animal', 'animals',
    
    // Experience phrases
    'bring my dog', 'brought my dog', 'with my dog', 'with my cat', 'with my pet', 'with pets',
    'took my dog', 'brought our dog', 'our dog came', 'dog was welcome', 'pet was allowed',
    'dogs welcome', 'pets welcome', 'pets allowed', 'dog allowed', 'cats allowed',
    
    // Activity terms
    'walked my dog', 'dog walk', 'pet outside', 'outdoor with dog', 'dog on patio',
    'dog friendly', 'pet friendly', 'pet-friendly', 'dog-friendly', 'cat-friendly',
    'pet accommodating', 'welcomes pets', 'welcomes dogs', 'love dogs', 'love pets',
    
    // Amenities and services
    'water bowl', 'dog bowl', 'pet treats', 'dog treats', 'leash', 'pet menu',
    'outdoor seating', 'patio', 'terrace', 'garden', 'dog park nearby', 'pet area',
    
    // Policy and experience terms
    'pet policy', 'dog policy', 'no pets', 'pets ok', 'dogs ok', 'pet restrictions',
    'bring your dog', 'bring your pet', 'dogs inside', 'pets inside', 'dog seating',
    
    // Service quality
    'staff loves dogs', 'pet-loving staff', 'dog-loving', 'accommodated our dog',
    'made our dog feel welcome', 'great with pets', 'understanding about pets'
  ];

  // Smart sentence extraction for pet content
  const extractPetContent = (text: string) => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const petSentences = [];
    
    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      const keywordMatches = petKeywords.filter(keyword => lowerSentence.includes(keyword.toLowerCase()));
      
      if (keywordMatches.length > 0) {
        petSentences.push({
          text: sentence.trim(),
          keywords: keywordMatches,
          relevanceScore: keywordMatches.length + (lowerSentence.split(' ').length > 15 ? 2 : 0) // Bonus for detailed sentences
        });
      }
    }
    
    return petSentences.sort((a, b) => b.relevanceScore - a.relevanceScore);
  };

  // Enhanced pet review filtering with relevance scoring
  const filterPetReviews = (reviews: typeof place.reviews) => {
    if (!reviews) return [];
    
    const petRelevantReviews = [];
    
    for (const review of reviews) {
      const petContent = extractPetContent(review.text);
      
      if (petContent.length > 0) {
        const totalKeywords = petContent.reduce((sum, content) => sum + content.keywords.length, 0);
        const avgSentenceScore = petContent.reduce((sum, content) => sum + content.relevanceScore, 0) / petContent.length;
        
        petRelevantReviews.push({
          ...review,
          petContent,
          petRelevanceScore: totalKeywords * 2 + avgSentenceScore + (review.rating >= 4 ? 3 : 0),
          petSentenceCount: petContent.length,
          topPetSentences: petContent.slice(0, 3) // Show up to 3 most relevant sentences
        });
      }
    }
    
    return petRelevantReviews.sort((a, b) => b.petRelevanceScore - a.petRelevanceScore);
  };

  // Enhanced keyword highlighting for extracted content
  const highlightPetKeywords = (text: string, extractedKeywords?: string[]) => {
    const keywordsToHighlight = extractedKeywords || petKeywords;
    
    let highlightedText = text;
    keywordsToHighlight.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<span class="font-bold text-accent bg-accent/10 px-1 rounded">$1</span>');
    });
    
    return highlightedText;
  };

  // Generate fallback content when no pet reviews found
  const generateFallbackContent = () => {
    if (!place || !place.types) return null;
    
    const placeType = getPlaceType(place.types, place.primary_type_display_name);
    const generalReviews = place.reviews?.filter(r => r.rating >= 4).slice(0, 2) || [];
    
    return {
      hasPetContent: false,
      message: "No specific pet experiences found in reviews yet.",
      suggestion: `Based on the ${placeType.label.toLowerCase()} type, this location may be suitable for pets. Be the first to share your pet experience!`,
      generalReviews: generalReviews.map(review => ({
        ...review,
        isGeneral: true
      }))
    };
  };

  const petReviews = place ? filterPetReviews(place.reviews) : [];
  const fallbackContent = petReviews.length === 0 ? generateFallbackContent() : null;

  const nextReview = () => {
    setCurrentReviewIndex((prev) => 
      prev === petReviews.length - 1 ? 0 : prev + 1
    );
  };

  const prevReview = () => {
    setCurrentReviewIndex((prev) => 
      prev === 0 ? petReviews.length - 1 : prev - 1
    );
  };

  const status = getCurrentStatus();
  const petStatus = getPetFriendlyStatus();

  // Early return if no place data
  if (!place) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          "max-w-[95vw] max-h-[95vh] w-full p-0",
          "md:max-w-4xl md:max-h-[90vh]",
          "bg-gradient-to-br from-[rgba(22,33,62,0.95)] to-[rgba(10,10,10,0.95)]",
          "border border-primary/20 backdrop-blur-xl",
          "rounded-[16px] md:rounded-[24px] shadow-2xl",
          "shadow-black/20 overflow-hidden animate-scale-in"
        )}
        style={{
          boxShadow: `
            0 0 0 1px rgba(0, 212, 255, 0.15),
            0 20px 40px -10px rgba(0, 0, 0, 0.4),
            0 0 100px rgba(139, 92, 246, 0.2)
          `
        }}
      >
        <div className="relative h-full max-h-[95vh] overflow-hidden">
          {/* Refined Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="
              absolute top-4 right-4 z-50 
              text-muted-foreground hover:text-foreground 
              transition-colors rounded-full w-10 h-10 
              backdrop-blur-md bg-background/30 hover:bg-background/50
              border border-white/10 hover:border-white/20
            "
          >
            <X className="h-5 w-5" />
          </Button>

          <div className="overflow-y-auto max-h-[95vh] scrollable-content">
            <style>{`
            .scrollable-content::-webkit-scrollbar { width: 8px; }
            .scrollable-content::-webkit-scrollbar-track { 
              background: hsl(var(--background)); 
              border-radius: 10px; 
            }
            .scrollable-content::-webkit-scrollbar-thumb { 
              background: linear-gradient(180deg, hsl(var(--primary)), hsl(var(--accent))); 
              border-radius: 10px; 
              border: 1px solid hsl(var(--primary) / 0.3); 
            }
          `}</style>

          {/* Hero Section */}
          <div className="relative h-64 md:h-80 overflow-hidden rounded-t-[24px]">
            <PlaceImage 
              photos={place.photos} 
              businessName={place.name} 
              businessTypes={place.types || []} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Place Type Badge */}
            {placeType && (
              <div className="absolute top-6 left-6">
                <Badge variant="place-type" className="gap-1.5">
                  <span>{placeType.icon}</span>
                  {placeType.label}
                </Badge>
              </div>
            )}

            {/* Business Info Overlay */}
            <div className="absolute bottom-6 left-6 right-16 text-foreground">
              <h1 className="font-orbitron font-bold text-3xl md:text-4xl mb-2 text-shadow-glow">
                {place.name}
              </h1>
              <p className="text-primary/80 font-medium text-lg">
                Community feedback and business details
              </p>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Business Information */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Reorganized Information Groups */}
              <div className="space-y-4">
                {/* Rating Group */}
                {place.rating && (
                  <div className="bg-background/20 backdrop-blur-md border border-primary/20 rounded-[16px] p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-full border border-primary/20">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="font-semibold text-primary text-lg">{place.rating.toFixed(1)}</span>
                      </div>
                      {place.user_ratings_total && (
                        <span className="text-muted-foreground text-sm">
                          ({place.user_ratings_total} reviews)
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Location Group - Compact Address + Operating Status */}
                <div className="bg-background/20 backdrop-blur-md border border-primary/20 rounded-[16px] p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-primary/80 uppercase tracking-wide">Location & Hours</h4>
                  
                  {/* Compact Address with Status */}
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground/90 leading-relaxed">
                        {place.formatted_address.split(',').slice(0, 2).join(', ')}
                        {place.formatted_address.split(',').length > 2 && (
                          <span className="text-muted-foreground">
                            , {place.formatted_address.split(',').slice(-1)[0].trim()}
                          </span>
                        )}
                      </span>
                    </div>
                    
                   {/* Operating Status and Google Maps */}
                   <div className="flex items-center justify-between ml-6">
                     <div className="flex items-center gap-2">
                       <Clock className="h-4 w-4 text-primary" />
                       <span className={`font-medium text-sm ${status.color}`}>
                         {status.status}
                       </span>
                     </div>
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={handleViewOnGoogleMaps}
                       className="h-8 px-3 text-xs border-primary/30 text-primary hover:bg-primary/10"
                     >
                       <Map className="h-3 w-3 mr-1" />
                       Google Maps
                     </Button>
                   </div>
                  </div>
                </div>

                {/* Enhanced Business Information Section */}
                <div className="bg-background/20 backdrop-blur-md border border-primary/20 rounded-[16px] p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-primary/80 uppercase tracking-wide">Business Information</h4>
                  
                  <div className="space-y-3">
                    {/* Business Category */}
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{placeType.icon}</span>
                      <span className="text-sm text-foreground/90 font-medium">{placeType.label}</span>
                    </div>

                    {/* Price Level */}
                    {place.price_level !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Price Level:</span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 4 }).map((_, index) => (
                            <span
                              key={index}
                              className={`text-sm ${
                                index < place.price_level! 
                                  ? 'text-accent font-bold' 
                                  : 'text-muted-foreground/30'
                              }`}
                            >
                              $
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Business Status */}
                    {place.business_status && place.business_status !== 'OPERATIONAL' && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge variant="destructive" className="text-xs">
                          {place.business_status.replace('_', ' ')}
                        </Badge>
                      </div>
                    )}

                    {/* Services Available */}
                    {(place.serves_dine_in || place.serves_takeout || place.serves_delivery || place.takeout || place.delivery) && (
                      <div className="space-y-2">
                        <span className="text-sm text-muted-foreground">Services:</span>
                        <div className="flex flex-wrap gap-1">
                          {place.serves_dine_in && (
                            <Badge variant="secondary" className="text-xs">🍽️ Dine-in</Badge>
                          )}
                          {(place.serves_takeout || place.takeout) && (
                            <Badge variant="secondary" className="text-xs">📦 Takeout</Badge>
                          )}
                          {(place.serves_delivery || place.delivery) && (
                            <Badge variant="secondary" className="text-xs">🚚 Delivery</Badge>
                          )}
                          {place.curbside_pickup && (
                            <Badge variant="secondary" className="text-xs">🚗 Curbside</Badge>
                          )}
                          {place.reservable && (
                            <Badge variant="secondary" className="text-xs">📅 Reservations</Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Editorial Summary */}
                    {place.editorial_summary?.overview && (
                      <div className="space-y-2">
                        <span className="text-sm text-muted-foreground">About:</span>
                        <p className="text-sm text-foreground/80 leading-relaxed italic">
                          {place.editorial_summary.overview}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Contact Section */}
                {((place.formatted_phone_number || place.international_phone_number) || place.website) && (
                  <div className="bg-background/20 backdrop-blur-md border border-primary/20 rounded-[16px] p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-primary/80 uppercase tracking-wide">Contact Information</h4>
                    
                    <div className="space-y-3">
                      {(place.formatted_phone_number || place.international_phone_number) && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-primary" />
                            <span className="text-sm text-foreground/90">
                              {place.formatted_phone_number || place.international_phone_number}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCallBusiness}
                            className="h-8 px-3 text-xs border-accent/30 text-accent hover:bg-accent/10"
                          >
                            Call
                          </Button>
                        </div>
                      )}
                      
                      {place.website && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-primary" />
                            <span className="text-sm text-foreground/90 truncate">
                              {new URL(place.website).hostname.replace('www.', '')}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-8 px-3 text-xs border-primary/30 text-primary hover:bg-primary/10"
                          >
                            <a 
                              href={place.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Visit
                            </a>
                          </Button>
                        </div>
                      )}

                      {/* Copy Address Action */}
                      <div className="flex items-center justify-between pt-2 border-t border-primary/10">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="text-sm text-foreground/90 truncate">
                            Copy address
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyAddress}
                          className="h-8 px-3 text-xs border-muted/30 text-muted-foreground hover:bg-muted/10"
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Pet Status */}
              <div className="space-y-6">
                <div className="
                  glass backdrop-blur-xl border border-primary/20 
                  rounded-[20px] p-8
                  shadow-[0_0_20px_rgba(0,212,255,0.1)]
                ">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <h3 className="font-orbitron font-bold text-2xl text-primary">
                      Pet-Friendly Status
                    </h3>
                    {isGoogleVerified && (
                      <Badge variant="pet-verified" className="gap-1.5">
                        <CheckCircle className="h-4 w-4" />
                        Google Verified
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-6">
                    {/* Status Display Container */}
                    <div className="
                      glass backdrop-blur-md border border-primary/20 
                      rounded-[15px] p-6 text-center space-y-3
                      shadow-[0_0_15px_rgba(0,212,255,0.2)]
                    ">
                      {petStatus.percentage > 0 ? (
                        <>
                          <div className="text-3xl font-bold bg-gradient-neon bg-clip-text text-transparent">
                            {petStatus.percentage}% Pet-Friendly
                          </div>
                          <p className="text-lg font-medium text-primary/80">
                            Based on {petStatus.votes} community vote{petStatus.votes !== 1 ? 's' : ''}
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="text-2xl font-bold bg-gradient-neon bg-clip-text text-transparent">
                            No pet ratings yet
                          </div>
                          <p className="text-lg font-medium text-muted-foreground">
                            Be the first to rate this place!
                          </p>
                        </>
                      )}
                    </div>

                    {/* Pet-Friendly Voting Section - Aligned with List View */}
                    <div className="space-y-4">
                      <p className="text-center font-medium text-foreground">
                        Help others by rating this place:
                      </p>
                      
                      <div className="flex gap-3">
                        {/* Pet Friendly Button - Exact List View Styling */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFeedback(true)}
                          disabled={isSubmitting}
                          className="
                            flex-1 glass border-accent/30 text-accent font-medium
                            backdrop-blur-md
                          "
                        >
                          <Heart className="h-4 w-4 mr-2" />
                          Pet Friendly
                        </Button>
                        
                        {/* Not Pet Friendly Button - Refined Styling */}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleFeedback(false)}
                          disabled={isSubmitting}
                          className="
                            flex-1 glass border-destructive/30 text-destructive font-medium
                            backdrop-blur-md
                          "
                        >
                          <X className="h-4 w-4 mr-2" />
                          Not Pet Friendly
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            {/* Operating Hours Detail */}
            {place.opening_hours?.weekday_text && (
              <div className="bg-background/20 backdrop-blur-md border border-primary/20 rounded-[20px] p-6">
                <h3 className="font-orbitron font-bold text-lg text-primary mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Operating Hours
                </h3>
                <div className="grid md:grid-cols-2 gap-2">
                  {place.opening_hours.weekday_text.map((day, index) => (
                    <div key={index} className="text-sm text-foreground">
                      {day}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pet Reviews Section */}
            <div className="bg-background/20 backdrop-blur-md border border-primary/20 rounded-[20px] p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-orbitron font-bold text-lg text-primary flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Pet Reviews {petReviews.length > 0 ? `(${petReviews.length} found)` : ''}
                </h3>
                
                {petReviews.length > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={prevReview}
                      className="text-primary hover:text-accent transition-colors hover:bg-primary/10 rounded-full w-8 h-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex gap-1">
                      {petReviews.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentReviewIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === currentReviewIndex 
                              ? 'bg-primary shadow-[0_0_8px_rgba(0,212,255,0.6)]' 
                              : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={nextReview}
                      className="text-primary hover:text-accent transition-colors hover:bg-primary/10 rounded-full w-8 h-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {petReviews.length > 0 ? (
                <div className="relative overflow-hidden">
                  <div 
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${currentReviewIndex * 100}%)` }}
                  >
                    {petReviews.map((review, index) => (
                      <div key={index} className="w-full flex-shrink-0 px-2">
                        <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 rounded-[15px] p-6">
                          {/* Review Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-background font-bold text-sm">
                                {review.author_name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">{review.author_name}</p>
                                <p className="text-xs text-muted-foreground">{review.relative_time_description}</p>
                              </div>
                              <Badge variant="pet-rating" className="text-xs ml-2">
                                Pet Experience
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, starIndex) => (
                                  <Star
                                    key={starIndex}
                                    className={`h-4 w-4 ${
                                      starIndex < review.rating
                                        ? 'fill-primary text-primary'
                                        : 'text-muted-foreground/30'
                                    }`}
                                  />
                                ))}
                                <span className="ml-1 text-sm font-medium text-primary">
                                  {review.rating}
                                </span>
                              </div>
                              {review.petSentenceCount > 1 && (
                                <Badge variant="secondary" className="text-xs">
                                  {review.petSentenceCount} pet mentions
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Enhanced Pet Content Display */}
                          {review.topPetSentences && review.topPetSentences.length > 0 ? (
                            <div className="space-y-3">
                              {review.topPetSentences.map((sentence: any, idx: number) => (
                                <div key={idx} className="border-l-2 border-accent/30 pl-4 py-1">
                                  <div 
                                    className="text-foreground leading-relaxed"
                                    dangerouslySetInnerHTML={{
                                      __html: highlightPetKeywords(sentence.text, sentence.keywords)
                                    }}
                                  />
                                  {idx < review.topPetSentences.length - 1 && (
                                    <div className="text-muted-foreground text-sm mt-1">⋯</div>
                                  )}
                                </div>
                              ))}
                              {review.petSentenceCount > review.topPetSentences.length && (
                                <div className="text-center mt-3">
                                  <span className="text-accent text-sm">
                                    +{review.petSentenceCount - review.topPetSentences.length} more pet mentions in full review
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div 
                              className="text-foreground leading-relaxed"
                              dangerouslySetInnerHTML={{
                                __html: highlightPetKeywords(review.text)
                              }}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : fallbackContent ? (
                <div className="space-y-6">
                  <div className="text-center py-6">
                    <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 rounded-[15px] p-8">
                      <Heart className="h-12 w-12 mx-auto mb-4 text-accent/50" />
                      <p className="text-muted-foreground mb-3 font-medium">{fallbackContent.message}</p>
                      <p className="text-sm text-accent/80 leading-relaxed">{fallbackContent.suggestion}</p>
                    </div>
                  </div>
                  
                  {fallbackContent.generalReviews.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="h-px bg-border flex-1" />
                        <span className="px-3 py-1 bg-background/50 rounded-full border">Recent positive reviews</span>
                        <div className="h-px bg-border flex-1" />
                      </div>
                      
                      <div className="grid gap-3">
                        {fallbackContent.generalReviews.map((generalReview: any, idx: number) => (
                          <div key={idx} className="bg-gradient-to-br from-background/50 to-background/30 border border-border/50 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-6 h-6 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full flex items-center justify-center text-xs font-bold">
                                {generalReview.author_name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">{generalReview.author_name}</span>
                                  <div className="flex items-center gap-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star key={i} className={`h-3 w-3 ${i < generalReview.rating ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`} />
                                    ))}
                                  </div>
                                </div>
                                <span className="text-xs text-muted-foreground">{generalReview.relative_time_description}</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {generalReview.text.length > 200 
                                ? `${generalReview.text.substring(0, 200)}...` 
                                : generalReview.text
                              }
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 rounded-[15px] p-8">
                    <Star className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground mb-2 font-medium">No reviews available yet</p>
                    <p className="text-sm text-accent">Be the first to share your experience!</p>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Tech Corner Accents */}
          <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-primary/60" />
          <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-accent/60" />
          <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-accent/60" />
          <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-primary/60" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessDetailModal;