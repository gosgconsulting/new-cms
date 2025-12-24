import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HotelResultsTable } from './HotelResultsTable';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CURRENCIES = [
  { value: 'USD', label: '$ USD (US Dollar)' },
  { value: 'EUR', label: '€ EUR (Euro)' },
  { value: 'GBP', label: '£ GBP (British Pound)' },
  { value: 'THB', label: '฿ THB (Thai Baht)' },
  { value: 'AUD', label: 'A$ AUD (Australian Dollar)' },
  { value: 'JPY', label: '¥ JPY (Japanese Yen)' },
];

const RESULTS_OPTIONS = [
  { value: '10', label: '10 Results' },
  { value: '20', label: '20 Results' },
  { value: '50', label: '50 Results' },
];

export function PriceScraperForm() {
  const [hotelName, setHotelName] = useState('');
  const [location, setLocation] = useState('');
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
  const [currency, setCurrency] = useState('USD');
  const [radius, setRadius] = useState('10');
  const [maxResults, setMaxResults] = useState('20');
  const [isLoading, setIsLoading] = useState(false);
  const [hotels, setHotels] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!hotelName || !location || !checkInDate || !checkOutDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const searchQuery = `${hotelName} ${location}`;
      const { data, error } = await supabase.functions.invoke('apify-hotels', {
        body: {
          searchQuery,
          checkInDate: format(checkInDate, 'yyyy-MM-dd'),
          checkOutDate: format(checkOutDate, 'yyyy-MM-dd'),
          currencyCode: currency,
          maxResults: parseInt(maxResults),
        },
      });

      if (error) throw error;

      if (data?.hotels) {
        setHotels(data.hotels);
        toast.success(`Found ${data.hotels.length} hotels`);
      } else {
        setHotels([]);
        toast.error('No hotels found');
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
      toast.error('Failed to fetch hotels');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-xl p-8 space-y-6 max-w-3xl">
        <div className="space-y-2">
          <label className="text-sm font-medium">Hotel Name</label>
          <Input
            placeholder="Brady Hotels Central Melbourne"
            value={hotelName}
            onChange={(e) => setHotelName(e.target.value)}
          />
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
          <label className="text-sm font-medium">Location</label>
          <Input
            placeholder="Bangkok, Thailand"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Currency</label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((curr) => (
                  <SelectItem key={curr.value} value={curr.value}>
                    {curr.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Radius (km)</label>
            <Input
              type="number"
              placeholder="10"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Results</label>
            <Select value={maxResults} onValueChange={setMaxResults}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RESULTS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleSearch}
          disabled={isLoading}
          className="w-full h-12 text-base bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            'Search Hotels'
          )}
        </Button>
      </div>

      {hotels.length > 0 && (
        <HotelResultsTable
          hotels={hotels}
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          currency={currency}
        />
      )}
    </div>
  );
}
