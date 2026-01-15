import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, Calendar, ExternalLink, Filter } from 'lucide-react';
import { api } from '../../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Payment {
  id: number;
  order_id: number;
  order_number: string;
  stripe_payment_intent_id: string;
  stripe_charge_id: string | null;
  amount: string;
  status: string;
  created_at: string;
}

interface PaymentsManagerProps {
  currentTenantId: string;
}

export default function PaymentsManager({ currentTenantId }: PaymentsManagerProps) {
  const [filterMethod, setFilterMethod] = useState<string>('all');

  // Fetch orders with payment info
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', currentTenantId],
    queryFn: async () => {
      const response = await api.get('/api/shop/orders', { tenantId: currentTenantId });
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      const result = await response.json();
      return result.data || [];
    },
    enabled: !!currentTenantId,
  });

  const payments = orders
    .filter((order: any) => {
      // Filter by payment method if not 'all'
      if (filterMethod !== 'all') {
        if (filterMethod === 'stripe' && !order.payment_method) return false;
        if (filterMethod === 'stripe' && order.payment_method !== 'STRIPE') return false;
        if (filterMethod === 'paystack' && order.payment_method !== 'PAYSTACK') return false;
        if (filterMethod === 'cash' && order.payment_method && order.payment_method !== 'CASH') return false;
      }
      // Only show orders with payment info (payment_method set or stripe_payment_intent_id)
      return order.payment_method || order.stripe_payment_intent_id || order.ref;
    })
    .map((order: any) => ({
      order_id: order.order_id || order.id,
      order_number: order.ref || order.order_number || `ORD-${order.order_id || order.id}`,
      stripe_payment_intent_id: order.stripe_payment_intent_id || null,
      stripe_charge_id: order.stripe_charge_id || null,
      amount: order.total || order.amount || order.total_amount || 0,
      status: order.status,
      payment_method: order.payment_method || 'Unknown',
      created_at: order.date || order.created_at,
    }));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'processing':
      case 'shipped':
      case 'delivered':
        return 'default';
      case 'cancelled':
      case 'refunded':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    switch (method?.toUpperCase()) {
      case 'STRIPE':
        return <Badge className="bg-blue-500">Stripe</Badge>;
      case 'PAYSTACK':
        return <Badge className="bg-purple-500">Paystack</Badge>;
      case 'CASH':
        return <Badge variant="secondary">Cash</Badge>;
      default:
        return <Badge variant="outline">{method || 'Unknown'}</Badge>;
    }
  };

  const getStripeDashboardUrl = (paymentIntentId: string) => {
    return `https://dashboard.stripe.com/payments/${paymentIntentId}`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground mt-1">View payment transactions</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterMethod} onValueChange={setFilterMethod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="paystack">Paystack</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading payments...</div>
      ) : payments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No payments found</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Payment Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Payment Intent ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{payment.order_number}</TableCell>
                    <TableCell>
                      {getPaymentMethodBadge(payment.payment_method)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {payment.stripe_payment_intent_id || payment.ref || 'N/A'}
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${parseFloat(payment.amount || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(payment.status)}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(payment.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {payment.stripe_payment_intent_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(getStripeDashboardUrl(payment.stripe_payment_intent_id), '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View in Stripe
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


