import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, FileText, Globe, Users, Calendar, Star } from 'lucide-react';
// Removed ReviewCarousel import as it's been deleted

interface PetFriendlyEvidence {
  googleMB: {
    hasAttributes: boolean;
    attributes: string[];
  };
  reviews: {
    anyPetMention: boolean;
    totalReviews: number;
    excerpts: Array<{
      text: string;
      author: string;
      rating: number;
      date: string;
      keywords: string[];
    }>;
  };
  description: {
    hasPetPolicy: boolean;
    excerpts: string[];
  };
  website: {
    hasPetPolicy: boolean;
    policyText: string[];
  };
  community: {
    rating: number;
    totalVotes: number;
  };
}

interface PetFriendlyEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  placeName: string;
  evidence: PetFriendlyEvidence;
  verificationDate: string;
  primaryReason: string;
}

export const PetFriendlyEvidenceModal: React.FC<PetFriendlyEvidenceModalProps> = ({
  isOpen,
  onClose,
  placeName,
  evidence,
  verificationDate,
  primaryReason
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-md border border-primary/20">
        <DialogHeader className="text-center pb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">🐾</span>
            <DialogTitle className="text-2xl font-orbitron bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Why This Place is Pet-Friendly
            </DialogTitle>
          </div>
          <p className="text-lg font-medium text-foreground">{placeName}</p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Primary Reason Box */}
          <div className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-lg p-4">
            <p className="text-sm font-medium text-primary mb-2 uppercase tracking-wide">Primary Reason</p>
            <p className="text-foreground font-medium">{primaryReason}</p>
          </div>

          {/* Official Verification Section */}
          {(evidence.googleMB.hasAttributes || evidence.website.hasPetPolicy) && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <h3 className="font-semibold text-foreground uppercase tracking-wide">✅ Official Verification</h3>
              </div>
              <div className="space-y-2 ml-7">
                {/* Google My Business Attributes */}
                {evidence.googleMB.hasAttributes && evidence.googleMB.attributes.map((attribute, index) => (
                  <div key={`gmb-${index}`} className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <p className="text-sm text-muted-foreground">Google My Business: {attribute}</p>
                  </div>
                ))}
                
                {/* Website Policy */}
                {evidence.website.hasPetPolicy && evidence.website.policyText.map((policy, index) => (
                  <div key={`website-${index}`} className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <p className="text-sm text-muted-foreground">Business website: {policy}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review Mentions Section */}
          {evidence.reviews.anyPetMention && evidence.reviews.excerpts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                <h3 className="font-semibold text-foreground uppercase tracking-wide">📝 Review Mentions</h3>
              </div>
              <div className="space-y-3 ml-7">
                {evidence.reviews.excerpts.map((review, index) => (
                  <div key={`review-${index}`} className="bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20 rounded-lg p-3">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-accent mt-1">✓</span>
                      <p className="text-sm text-muted-foreground italic">"{review.text}"</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground/70 ml-6">
                      <span>- {review.author}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span>{review.date}</span>
                      </div>
                    </div>
                    {review.keywords.length > 0 && (
                      <div className="mt-2 ml-6">
                        <p className="text-xs text-accent">
                          Keywords: {review.keywords.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                <div className="ml-6">
                  <p className="text-xs text-accent font-medium">
                    Found {evidence.reviews.excerpts.length} review{evidence.reviews.excerpts.length !== 1 ? 's' : ''} mentioning pets
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Business Information Section */}
          {evidence.description.hasPetPolicy && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-400" />
                <h3 className="font-semibold text-foreground uppercase tracking-wide">🏢 Business Information</h3>
              </div>
              <div className="space-y-2 ml-7">
                {evidence.description.excerpts.map((excerpt, index) => (
                  <div key={`desc-${index}`} className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">✓</span>
                    <p className="text-sm text-muted-foreground">Business description: "{excerpt}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Community Input Section */}
          {evidence.community.totalVotes > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-400" />
                <h3 className="font-semibold text-foreground uppercase tracking-wide">👥 Community Input</h3>
              </div>
              <div className="ml-7">
                <div className="bg-gradient-to-r from-orange-500/10 to-orange-400/10 border border-orange-400/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-foreground">
                        {evidence.community.rating}% Pet-Friendly Rating
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Based on {evidence.community.totalVotes} community {evidence.community.totalVotes === 1 ? 'vote' : 'votes'}
                      </p>
                      {evidence.community.rating >= 70 && evidence.community.totalVotes >= 3 && (
                        <div className="flex items-center gap-1 mt-2">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span className="text-sm text-green-400 font-medium">Community Verified</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-orange-400">
                        {evidence.community.rating}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* No Evidence Message - Should not appear with current logic, but safety fallback */}
          {!evidence.googleMB.hasAttributes && 
           !evidence.reviews.anyPetMention && 
           !evidence.description.hasPetPolicy && 
           !evidence.website.hasPetPolicy && 
           evidence.community.totalVotes === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No specific pet-friendly evidence found in our records.</p>
              <p className="text-sm text-muted-foreground mt-2">This place may still welcome pets - please contact them directly to confirm their pet policy.</p>
            </div>
          )}

          {/* Verification Info */}
          <div className="border-t border-border/50 pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Evidence verified: {verificationDate}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-border/50">
            <Button variant="outline" size="sm" className="text-xs hover:bg-muted/50">
              Report Issues
            </Button>
            <Button 
              onClick={onClose} 
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 font-medium"
            >
              Got it!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};