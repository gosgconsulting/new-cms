import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingCart, Filter, Calendar, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Order {
  order_id: number;
  user_id: number;
  user_email: string | null;
  user_name: string | null;
  status: string;
  date: string;
  amount: number | null;
  total: number | null;
  ref: string | null;
  payment_method: 'PAYSTACK' | 'STRIPE' | null;
  items?: OrderItem[];
}

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_slug: string;
  quantity: number;
  price: number;
}

interface OrdersManagerProps {
  currentTenantId: string;
}

export default function OrdersManager({ currentTenantId }: OrdersManagerProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', currentTenantId, statusFilter],
    queryFn: async () => {
      if (!currentTenantId) {
        throw new Error('Tenant ID is required');
      }
      
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      const response = await api.get(`/api/shop/orders?${params.toString()}`, { tenantId: currentTenantId });
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const result = await response.json();
      return result.data || [];
    },
    enabled: !!currentTenantId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      if (!currentTenantId) {
        throw new Error('Tenant ID is required');
      }
      const response = await api.put(`/api/shop/orders/${orderId}/status`, { status }, { tenantId: currentTenantId });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update order status');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', currentTenantId] });
    },
  });

  const fetchOrderDetails = async (orderId: number) => {
    if (expandedOrders.has(orderId)) {
      // Collapse
      setExpandedOrders(prev => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
      return;
    }

    // Expand and fetch details
    const response = await api.get(`/api/shop/orders/${orderId}`, { tenantId: currentTenantId });
    if (response.ok) {
      const result = await response.json();
      // Update the order in the list with details
      queryClient.setQueryData(['orders', currentTenantId, statusFilter], (oldData: Order[] = []) => {
        return oldData.map(order => 
          order.order_id === orderId ? result.data : order
        );
      });
      setExpandedOrders(prev => new Set(prev).add(orderId));
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'processing':
        return 'default';
      case 'shipped':
        return 'default';
      case 'delivered':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground mt-1">Manage customer orders</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-12">Loading orders...</div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No orders found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order: Order) => (
            <OrderCard
              key={order.order_id}
              order={order}
              isExpanded={expandedOrders.has(order.order_id)}
              onToggleExpand={() => fetchOrderDetails(order.order_id)}
              onStatusChange={(status) => {
                updateStatusMutation.mutate({
                  orderId: order.order_id,
                  status,
                });
              }}
              getStatusBadgeVariant={getStatusBadgeVariant}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface OrderCardProps {
  order: Order;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onStatusChange: (status: string) => void;
  getStatusBadgeVariant: (status: string) => any;
  formatDate: (date: string) => string;
}

function OrderCard({ order, isExpanded, onToggleExpand, onStatusChange, getStatusBadgeVariant, formatDate }: OrderCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Order Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">Order #{order.order_id}</h3>
                <Badge variant={getStatusBadgeVariant(order.status)}>
                  {order.status}
                </Badge>
                {order.payment_method && (
                  <Badge variant="outline" className="text-xs">
                    {order.payment_method}
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Customer:</span>{' '}
                  {order.user_name || order.user_email || `User #${order.user_id}`}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(order.date)}
                </div>
                <div>
                  <span className="font-medium">Total:</span>{' '}
                  <span className="text-lg font-bold text-gray-900">
                    ${(order.total || order.amount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={order.status}
                onChange={(e) => onStatusChange(e.target.value)}
                className="text-sm px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleExpand}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    View Details
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Expanded Order Details */}
          {isExpanded && (
            <div className="pt-4 border-t border-gray-200 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-gray-900">Customer Information</h4>
                  <div className="text-sm space-y-1 text-gray-600">
                    <p><strong>Name:</strong> {order.user_name || 'N/A'}</p>
                    <p><strong>Email:</strong> {order.user_email || 'N/A'}</p>
                    <p><strong>User ID:</strong> {order.user_id}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-gray-900">Order Information</h4>
                  <div className="text-sm space-y-1 text-gray-600">
                    <p><strong>Status:</strong> {order.status}</p>
                    <p><strong>Date:</strong> {new Date(order.date).toLocaleString()}</p>
                    {order.ref && (
                      <p><strong>Reference:</strong> {order.ref}</p>
                    )}
                    {order.payment_method && (
                      <p><strong>Payment:</strong> {order.payment_method}</p>
                    )}
                  </div>
                </div>
              </div>

              {order.items && order.items.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-gray-900 flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    Order Items ({order.items.length})
                  </h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.items.map((item: OrderItem) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{item.product_name}</div>
                                <div className="text-xs text-muted-foreground">{item.product_slug}</div>
                              </div>
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>${item.price.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-medium">
                              ${(item.price * item.quantity).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <div className="text-right space-y-1">
                      {order.amount && (
                        <p className="text-sm text-gray-600">
                          <strong>Amount:</strong> ${order.amount.toFixed(2)}
                        </p>
                      )}
                      <p className="text-lg font-bold text-gray-900">
                        <strong>Total:</strong> ${(order.total || order.amount || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
