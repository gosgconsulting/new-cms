import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrapedLead } from '@/services/lobstrService';
import { ExternalLink, Phone, Mail, MapPin } from 'lucide-react';

interface LeadsResultsTableProps {
  leads: ScrapedLead[];
}

export const LeadsResultsTable = ({ leads }: LeadsResultsTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scraped Leads ({leads.length})</CardTitle>
        <CardDescription>
          Review the business leads before saving to your campaign
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Category</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead, index) => (
                <TableRow key={lead.id || index}>
                  <TableCell>
                    <div className="font-medium">{lead.name}</div>
                    {lead.website && (
                      <a
                        href={lead.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Website
                      </a>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm flex items-start gap-1">
                      <MapPin className="h-3 w-3 mt-0.5 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {lead.address || 'N/A'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {lead.phone && (
                        <div className="text-sm flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{lead.phone}</span>
                        </div>
                      )}
                      {lead.email && (
                        <div className="text-sm flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span>{lead.email}</span>
                        </div>
                      )}
                      {!lead.phone && !lead.email && (
                        <span className="text-xs text-muted-foreground">No contact</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {lead.rating ? (
                      <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">
                        ⭐ {lead.rating}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">No rating</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {lead.category && (
                      <Badge variant="outline" className="text-xs">
                        {lead.category}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
