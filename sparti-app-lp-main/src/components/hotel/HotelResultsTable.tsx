import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Star, MapPin } from 'lucide-react';

interface HotelResultsTableProps {
  hotels: any[];
  checkInDate?: Date;
  checkOutDate?: Date;
  currency: string;
}

export function HotelResultsTable({
  hotels,
  checkInDate,
  checkOutDate,
  currency,
}: HotelResultsTableProps) {
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

  const getPriceRange = (hotel: any) => {
    const price = hotel.pricePerNight?.amount;
    if (!price) return 'N/A';
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${Math.round(price)}`;
  };

  return (
    <div className="glass rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-4">Search Results</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hotel Name</TableHead>
              <TableHead>Price Range</TableHead>
              <TableHead>Check-in Date</TableHead>
              <TableHead>Check-out Date</TableHead>
              <TableHead className="text-center">Stars</TableHead>
              <TableHead>Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hotels.map((hotel, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {hotel.hotelName || 'Unknown Hotel'}
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  {getPriceRange(hotel)}
                </TableCell>
                <TableCell>
                  {checkInDate ? format(checkInDate, 'MMM d, yyyy') : 'N/A'}
                </TableCell>
                <TableCell>
                  {checkOutDate ? format(checkOutDate, 'MMM d, yyyy') : 'N/A'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    {hotel.starRating ? (
                      <>
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{hotel.starRating}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {hotel.city || hotel.address || 'N/A'}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
