import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Campaign } from '@/types/campaigns';
import { getStatusColor, getStatusLabel, formatDate } from './utils';

interface SemCampaignsTableProps {
  campaigns: Campaign[];
}

export const SemCampaignsTable = ({ campaigns }: SemCampaignsTableProps) => (
  <Card>
    <CardHeader>
      <CardTitle>SEM Campaigns</CardTitle>
      <CardDescription>SEM campaigns organized by creation date</CardDescription>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Bidding Strategy</TableHead>
            <TableHead>Landing Page</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell>
                <div className="font-medium">
                  {formatDate(campaign.created_at)}
                </div>
              </TableCell>
              <TableCell>{campaign.name}</TableCell>
              <TableCell>${campaign.budget}</TableCell>
              <TableCell>{campaign.location}</TableCell>
              <TableCell>{campaign.bidding_strategy}</TableCell>
              <TableCell>{campaign.landing_page_url}</TableCell>
              <TableCell>
                <Badge variant="secondary" className={getStatusColor(campaign.status)}>
                  {getStatusLabel(campaign.status)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);
