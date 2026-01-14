import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../utils/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Mail, Phone, Building2, MapPin, DollarSign, ShoppingCart, Calendar } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Client {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  company: string | null;
  address: {
    address_1?: string;
    address_2?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  } | null;
  orders_count: number;
  total_spent: number;
  date_created: string | null;
  external_source?: string;
}

interface ClientsManagerProps {
  currentTenantId: string;
}

const ClientsManager: React.FC<ClientsManagerProps> = ({ currentTenantId }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: clients = [], isLoading, error } = useQuery<Client[]>({
    queryKey: ['clients', currentTenantId],
    queryFn: async () => {
      if (!currentTenantId) {
        return [];
      }
      const response = await api.get(`/api/shop/clients`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Failed to fetch clients');
    },
    enabled: !!currentTenantId,
  });

  const filteredClients = clients.filter((client) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      client.email?.toLowerCase().includes(query) ||
      client.first_name?.toLowerCase().includes(query) ||
      client.last_name?.toLowerCase().includes(query) ||
      client.company?.toLowerCase().includes(query) ||
      client.phone?.toLowerCase().includes(query)
    );
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAddress = (address: Client['address']) => {
    if (!address) return 'N/A';
    const parts = [
      address.address_1,
      address.address_2,
      address.city,
      address.state,
      address.postcode,
      address.country,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-muted-foreground">Loading clients...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-destructive">Error loading clients: {error instanceof Error ? error.message : 'Unknown error'}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground mt-1">
            Manage your shop customers and clients
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
          <CardDescription>
            View and manage all customers who have placed orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by email, name, company, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredClients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'No clients found matching your search.' : 'No clients found.'}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>First Order</TableHead>
                    <TableHead>Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div className="font-medium">
                          {client.first_name || client.last_name
                            ? `${client.first_name || ''} ${client.last_name || ''}`.trim()
                            : 'N/A'}
                        </div>
                        {client.company && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Building2 className="h-3 w-3" />
                            {client.company}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {client.email || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {client.phone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {client.phone}
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 max-w-xs">
                          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm truncate" title={formatAddress(client.address)}>
                            {formatAddress(client.address)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                          {client.orders_count}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 font-medium">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          {formatCurrency(client.total_spent)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(client.date_created)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={client.external_source === 'woocommerce' ? 'default' : 'secondary'}>
                          {client.external_source === 'woocommerce' ? 'WooCommerce' : 'Sparti'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {filteredClients.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredClients.length} of {clients.length} clients
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientsManager;
