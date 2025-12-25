import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, Calendar } from 'lucide-react';
import { api } from '../../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
  // For now, we'll fetch orders with payment info
  // In the future, this could be a dedicated payments table
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', currentTenantId],
    queryFn: async () => {
      const response = await api.get('/api/shop/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      const result = await response.json();
      return result.data || [];
    },
  });

  const payments = orders
    .filter((order: any) => order.stripe_payment_intent_id)
    .map((order: any) => ({
      order_id: order.id,
      order_number: order.order_number,
      stripe_payment_intent_id: order.stripe_payment_intent_id,
      stripe_charge_id: order.stripe_charge_id,
      amount: order.total_amount,
      status: order.status,
      created_at: order.created_at,
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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-muted-foreground mt-1">View payment transactions</p>
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
                  <TableHead>Payment Intent ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{payment.order_number}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {payment.stripe_payment_intent_id}
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${parseFloat(payment.amount).toFixed(2)}
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


