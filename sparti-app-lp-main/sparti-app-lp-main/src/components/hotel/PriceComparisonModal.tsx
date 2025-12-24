import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, ExternalLink, Loader2, Info } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PriceComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotelData: any;
  checkInDate?: Date;
  checkOutDate?: Date;
  currency: string;
}

export function PriceComparisonModal({
  isOpen,
  onClose,
  hotelData,
  checkInDate,
  checkOutDate,
  currency,
}: PriceComparisonModalProps) {
  const [hotelDetails, setHotelDetails] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
  const directPrice = hotelData.price || 0;
  const hotelName = hotelData.name || '';
  const hotelLocation = hotelData.location || '';
  
  // Generate booking platform URLs
  const searchQuery = encodeURIComponent(`${hotelName} ${hotelLocation}`);
  const checkInParam = checkInDate ? format(checkInDate, 'yyyy-MM-dd') : '';
  const checkOutParam = checkOutDate ? format(checkOutDate, 'yyyy-MM-dd') : '';
  
  const platforms = [
    { 
      name: 'Agoda', 
      price: directPrice, 
      link: `https://www.agoda.com/search?city=${searchQuery}&checkIn=${checkInParam}&checkOut=${checkOutParam}`
    },
    { 
      name: 'Hotels.com', 
      price: directPrice, 
      link: `https://www.hotels.com/search.do?q-destination=${searchQuery}&q-check-in=${checkInParam}&q-check-out=${checkOutParam}`
    },
    { 
      name: 'Booking.com', 
      price: directPrice, 
      link: `https://www.booking.com/search.html?ss=${searchQuery}&checkin=${checkInParam}&checkout=${checkOutParam}`
    },
    { 
      name: 'Expedia', 
      price: directPrice, 
      link: `https://www.expedia.com/Hotel-Search?destination=${searchQuery}&startDate=${checkInParam}&endDate=${checkOutParam}`
    },
  ];

  const fetchHotelDetails = async () => {
    if (!hotelData.url || isLoadingDetails || hotelDetails) return;
    
    setIsLoadingDetails(true);
    try {
      console.log('🔍 Fetching detailed hotel info from:', hotelData.url);
      const { data, error } = await supabase.functions.invoke('hotel-details-firecrawl', {
        body: {
          hotelUrl: hotelData.url,
          hotelName: hotelName,
        },
      });

      if (error) throw error;
      if (data?.success) {
        setHotelDetails(data);
        console.log('✅ Hotel details loaded');
      } else {
        console.error('❌ Failed to load details:', data?.error);
      }
    } catch (error) {
      console.error('Error fetching hotel details:', error);
      toast.error('Could not load detailed hotel information');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const getCurrencySymbol = (curr: string) => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      THB: '฿',
      AUD: 'A$',
      JPY: '¥',
    };
    return symbols[curr] || curr;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{hotelName}</DialogTitle>
          {hotelData.address && (
            <p className="text-sm text-muted-foreground">{hotelData.address}</p>
          )}
        </DialogHeader>

        <Tabs defaultValue="prices" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="prices">Prices</TabsTrigger>
            <TabsTrigger value="details" onClick={fetchHotelDetails}>
              Details {isLoadingDetails && <Loader2 className="ml-2 h-3 w-3 animate-spin" />}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prices" className="space-y-6">
            {/* Direct Price */}
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">
                {getCurrencySymbol(currency)}
                {Math.round(directPrice)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {checkInDate && checkOutDate && (
                  <>
                    {format(checkInDate, 'MMM d')} - {format(checkOutDate, 'MMM d, yyyy')}
                  </>
                )}
              </p>
            </div>

            {/* Amenities */}
            {hotelData.amenities && hotelData.amenities.length > 0 && (
              <div className="space-y-2">
                {hotelData.amenities.slice(0, 5).map((amenity: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Book Direct Button */}
            <Button
              className="w-full h-12 text-base bg-green-500 hover:bg-green-600"
              onClick={() => window.open(hotelData.url, '_blank')}
            >
              Book Direct - Save More
            </Button>

            {/* Other Platforms */}
            <div className="space-y-2 pt-4 border-t">
              <h3 className="text-sm font-semibold mb-2">Compare Prices</h3>
              {platforms.map((platform) => (
                <div
                  key={platform.name}
                  className="flex items-center justify-between p-3 hover:bg-accent rounded-lg transition-colors cursor-pointer border"
                  onClick={() => window.open(platform.link, '_blank')}
                >
                  <span className="text-sm font-medium">{platform.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">
                      {getCurrencySymbol(currency)}
                      {Math.round(platform.price)}
                    </span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            {isLoadingDetails ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : hotelDetails ? (
              <>
                {hotelDetails.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground">{hotelDetails.description}</p>
                  </div>
                )}

                {hotelDetails.amenities && hotelDetails.amenities.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Amenities</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {hotelDetails.amenities.map((amenity: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {hotelDetails.images && hotelDetails.images.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Photos</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {hotelDetails.images.slice(0, 4).map((img: string, index: number) => (
                        <img 
                          key={index} 
                          src={img} 
                          alt={`Hotel photo ${index + 1}`}
                          className="rounded-lg w-full h-32 object-cover"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Info className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Click this tab to load detailed hotel information
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
