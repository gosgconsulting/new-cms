import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PriceComparisonModal } from './PriceComparisonModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const COUNTRIES = [
  { value: 'Thailand', label: 'Thailand' },
  { value: 'United States', label: 'United States' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Japan', label: 'Japan' },
  { value: 'Singapore', label: 'Singapore' },
  { value: 'Malaysia', label: 'Malaysia' },
  { value: 'Indonesia', label: 'Indonesia' },
  { value: 'Philippines', label: 'Philippines' },
  { value: 'Vietnam', label: 'Vietnam' },
  { value: 'South Korea', label: 'South Korea' },
  { value: 'China', label: 'China' },
  { value: 'India', label: 'India' },
  { value: 'Germany', label: 'Germany' },
  { value: 'France', label: 'France' },
  { value: 'Italy', label: 'Italy' },
  { value: 'Spain', label: 'Spain' },
];

export function PriceWidget() {
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [location, setLocation] = useState('Thailand');
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hotelData, setHotelData] = useState<any>(null);

  const handleSearch = async () => {
    console.log('🚀 handleSearch called', { googleMapsUrl, location, checkInDate, checkOutDate });
    
    if (!googleMapsUrl || !location || !checkInDate || !checkOutDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate URL
    try {
      new URL(googleMapsUrl);
    } catch {
      toast.error('Please enter a valid Google Maps URL');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔍 Scraping hotel from Google Maps:', googleMapsUrl);
      
      const { data, error } = await supabase.functions.invoke('google-maps-hotel-scraper', {
        body: {
          googleMapsUrl,
          location,
          checkInDate: format(checkInDate, 'yyyy-MM-dd'),
          checkOutDate: format(checkOutDate, 'yyyy-MM-dd'),
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        toast.error(error.message || 'Failed to fetch hotel data');
        return;
      }

      // Check for API-level errors
      if (data?.error) {
        console.error('API error:', data);
        const errorMsg = data.details || data.error || 'Failed to fetch hotel data';
        toast.error(errorMsg, {
          description: 'Please try again with a different URL',
          duration: 5000,
        });
        return;
      }

      if (data?.success && data?.hotel) {
        console.log('✅ Hotel data scraped:', data.hotel);
        setHotelData(data.hotel);
        setShowModal(true);
      } else {
        console.log('⚠️ No hotel data returned');
        toast.error('No hotel data found', {
          description: 'Try a different Google Maps URL',
          duration: 4000,
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Something went wrong', {
        description: error instanceof Error ? error.message : 'Please try again',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="glass rounded-xl p-8 space-y-6 max-w-3xl">
        <div className="space-y-2">
          <label className="text-sm font-medium">Google Maps Hotel URL</label>
          <Input
            placeholder="https://www.google.com/maps/place/Brady+Hotels+Central+Melbourne/@..."
            value={googleMapsUrl}
            onChange={(e) => setGoogleMapsUrl(e.target.value)}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Paste the Google Maps URL for the hotel (dates will be added automatically)
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Check-in and Check-out Dates</label>
          <div className="grid grid-cols-2 gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal h-12',
                    !checkInDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {checkInDate ? format(checkInDate, 'PPP') : <span>Check-in</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={checkInDate}
                  onSelect={setCheckInDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal h-12',
                    !checkOutDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {checkOutDate ? format(checkOutDate, 'PPP') : <span>Check-out</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={checkOutDate}
                  onSelect={setCheckOutDate}
                  initialFocus
                  disabled={(date) => checkInDate ? date <= checkInDate : false}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Location (Country)</label>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Currency will be automatically determined based on the selected country
          </p>
        </div>

        <Button
          onClick={handleSearch}
          disabled={isLoading}
          className="w-full h-12 text-base bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scraping Hotel Data...
            </>
          ) : (
            'Get Hotel Prices'
          )}
        </Button>
      </div>

      {showModal && hotelData && (
        <PriceComparisonModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          hotelData={hotelData}
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          currency={hotelData.currency}
        />
      )}
    </>
  );
}
