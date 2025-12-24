import { FC, useState } from 'react';
import { X, Star, Upload, MapPin, Clock, Phone, Globe } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { usePlaceFeedback } from '@/hooks/useStubs';
import { getPlaceType } from '@/utils/placeTypes';
import PlaceImage from './PlaceImage';

interface ContributionModalProps {
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
    website?: string;
  };
}

const ContributionModal: FC<ContributionModalProps> = ({ 
  isOpen, 
  onClose, 
  place
}) => {
  const { submitFeedback, isSubmitting } = usePlaceFeedback();
  const { toast } = useToast();
  const [rating, setRating] = useState<number>(0);
  const [experience, setExperience] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please rate how pet-friendly this place is.",
        variant: "destructive",
      });
      return;
    }

    if (experience.trim().length < 10) {
      toast({
        title: "Experience Required",
        description: "Please share your experience (at least 10 characters).",
        variant: "destructive",
      });
      return;
    }

    // Convert 1-5 star rating to pet-friendly boolean (3+ stars = pet-friendly)
    const isPetFriendly = rating >= 3;

    const result = await submitFeedback({
      place_id: place.place_id,
      place_name: place.name,
      is_pet_friendly: isPetFriendly,
    });

    if (result.success) {
      setIsSubmitted(true);
      toast({
        title: "Thank you for contributing!",
        description: "Your experience helps other pet owners find pet-friendly places.",
      });
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
        setRating(0);
        setExperience('');
      }, 2000);
    } else {
      toast({
        title: "Submission Failed",
        description: result.error || "Failed to submit your contribution.",
        variant: "destructive",
      });
    }
  };

  const placeType = getPlaceType(place.types, place.primary_type_display_name);
  const getCurrentStatus = () => {
    if (!place.opening_hours) {
      return { status: "Hours unknown", color: "text-muted-foreground" };
    }
    return place.opening_hours.open_now 
      ? { status: "Open now", color: "text-accent" }
      : { status: "Closed", color: "text-destructive" };
  };
  const status = getCurrentStatus();

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md mx-auto p-0 bg-gradient-to-br from-[rgba(22,33,62,0.95)] to-[rgba(10,10,10,0.95)] border border-primary/20 backdrop-blur-xl rounded-[24px] shadow-2xl overflow-hidden">
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-accent/20 rounded-full flex items-center justify-center">
              <Star className="w-8 h-8 text-accent fill-accent" />
            </div>
            <div className="space-y-2">
              <h3 className="font-orbitron font-bold text-xl text-primary">
                Thank You!
              </h3>
              <p className="text-muted-foreground">
                Your contribution helps build a better pet-friendly community
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-accent text-sm">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span>Saving your feedback...</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="
          max-w-2xl max-h-[90vh] w-[95vw] mx-auto p-0
          bg-gradient-to-br from-[rgba(22,33,62,0.95)] to-[rgba(10,10,10,0.95)]
          border border-primary/20 backdrop-blur-xl
          rounded-[24px] shadow-2xl
          overflow-hidden animate-scale-in
        "
      >
        {/* Close Button */}
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

        <div className="overflow-y-auto max-h-[90vh]">
          {/* Hero Section */}
          <div className="relative h-48 overflow-hidden rounded-t-[24px]">
            <PlaceImage 
              photos={place.photos} 
              businessName={place.name} 
              businessTypes={place.types} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Place Type Badge */}
            <div className="absolute top-6 left-6">
              <Badge variant="place-type" className="gap-1.5">
                <span>{placeType.icon}</span>
                {placeType.label}
              </Badge>
            </div>

            {/* Header Overlay */}
            <div className="absolute bottom-6 left-6 right-16 text-foreground">
              <h1 className="font-orbitron font-bold text-2xl mb-2 text-shadow-glow">
                Add {place.name} as Pet-Friendly
              </h1>
              <p className="text-primary/80 font-medium">
                Share your pet experience to help others
              </p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Business Info */}
            <div className="bg-background/20 backdrop-blur-md border border-primary/20 rounded-[16px] p-4 space-y-3">
              <h4 className="text-sm font-semibold text-primary/80 uppercase tracking-wide">Business Information</h4>
              
              {/* Name and Rating */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-foreground">{place.name}</h3>
                {place.rating && (
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="text-primary font-medium">{place.rating.toFixed(1)}</span>
                    {place.user_ratings_total && (
                      <span className="text-muted-foreground text-sm">
                        ({place.user_ratings_total} reviews)
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Address and Status */}
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground/90 leading-relaxed">
                    {place.formatted_address}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 ml-6">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className={`font-medium text-sm ${status.color}`}>
                      {status.status}
                    </span>
                  </div>
                  
                  {place.formatted_phone_number && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground text-sm">
                        {place.formatted_phone_number}
                      </span>
                    </div>
                  )}
                  
                  {place.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      <a 
                        href={place.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary text-sm hover:underline"
                      >
                        Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rating Section */}
            <div className="bg-background/20 backdrop-blur-md border border-primary/20 rounded-[16px] p-6 space-y-4">
              <h4 className="text-sm font-semibold text-primary/80 uppercase tracking-wide">Rate Pet-Friendliness</h4>
              <p className="text-muted-foreground text-sm">
                How pet-friendly is this place? (1 = Not pet-friendly, 5 = Very pet-friendly)
              </p>
              
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-all duration-200 hover:scale-110"
                  >
                    <Star 
                      className={`w-8 h-8 ${
                        star <= rating 
                          ? 'text-accent fill-accent' 
                          : 'text-muted-foreground hover:text-accent/50'
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-sm text-accent font-medium">
                    {rating === 1 && "Not pet-friendly"}
                    {rating === 2 && "Somewhat pet-friendly"}
                    {rating === 3 && "Pet-friendly"}
                    {rating === 4 && "Very pet-friendly"}
                    {rating === 5 && "Extremely pet-friendly"}
                  </span>
                )}
              </div>
            </div>

            {/* Experience Section */}
            <div className="bg-background/20 backdrop-blur-md border border-primary/20 rounded-[16px] p-6 space-y-4">
              <h4 className="text-sm font-semibold text-primary/80 uppercase tracking-wide">Share Your Experience</h4>
              <p className="text-muted-foreground text-sm">
                Tell other pet owners about your experience at this place
              </p>
              
              <Textarea
                placeholder="Describe your experience... (e.g., 'Staff was very welcoming to my dog, provided water bowl, had outdoor seating')"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="min-h-[100px] bg-background/30 border-primary/20 focus:border-primary/40 text-foreground placeholder:text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">
                {experience.length}/500 characters (minimum 10)
              </p>
            </div>

            {/* Photo Upload Placeholder */}
            <div className="bg-background/20 backdrop-blur-md border border-primary/20 rounded-[16px] p-6 space-y-4">
              <h4 className="text-sm font-semibold text-primary/80 uppercase tracking-wide">Add Photos</h4>
              <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center">
                <Upload className="w-8 h-8 text-primary/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Photo upload coming soon!
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  For now, share your experience in the text above
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 border-primary/30 text-primary hover:bg-primary/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || rating === 0 || experience.trim().length < 10}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Pet-Friendly Review'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContributionModal;