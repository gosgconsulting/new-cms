import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Package, 
  Calendar, 
  CreditCard,
  Truck,
  Building
} from 'lucide-react';

interface Address {
  first_name?: string | null;
  last_name?: string | null;
  company?: string | null;
  address_1?: string | null;
  address_2?: string | null;
  city?: string | null;
  state?: string | null;
  postcode?: string | null;
  country?: string | null;
  email?: string | null;
  phone?: string | null;
}

interface OrderItem {
  id?: number;
  product_id?: number;
  product_name?: string;
  product_slug?: string;
  quantity: number;
  price: number;
  unit_price?: number;
  total_price?: number;
  variant_id?: number;
  variant_title?: string;
}

interface Order {
  order_id: number;
  order_number?: string;
  user_id?: number;
  user_name?: string | null;
  user_email?: string | null;
  customer_email?: string | null;
  customer_first_name?: string | null;
  customer_last_name?: string | null;
  status: string;
  date: string;
  amount?: number;
  total?: number;
  total_amount?: number;
  subtotal?: number;
  tax_amount?: number;
  shipping_amount?: number;
  ref?: string | null;
  payment_method?: string | null;
  billing_address?: Address | string | null;
  shipping_address?: Address | string | null;
  items?: OrderItem[];
  line_items?: any[];
  external_id?: string;
  external_source?: string;
}

interface OrderDetailsViewProps {
  order: Order;
  getStatusBadgeVariant: (status: string) => any;
}

export default function OrderDetailsView({ order, getStatusBadgeVariant }: OrderDetailsViewProps) {
  // Parse addresses if they're JSON strings
  const parseAddress = (addr: Address | string | null | undefined): Address | null => {
    if (!addr) return null;
    if (typeof addr === 'string') {
      try {
        return JSON.parse(addr);
      } catch {
        return null;
      }
    }
    return addr;
  };

  const billingAddress = parseAddress(order.billing_address);
  const shippingAddress = parseAddress(order.shipping_address);

  // Get customer info - prefer WooCommerce fields, fallback to user fields
  const customerName = order.customer_first_name && order.customer_last_name
    ? `${order.customer_first_name} ${order.customer_last_name}`
    : order.customer_first_name || order.customer_last_name || order.user_name || 'N/A';
  
  const customerEmail = order.customer_email || order.user_email || billingAddress?.email || 'N/A';
  const customerPhone = billingAddress?.phone || 'N/A';

  // Get order items - handle both formats
  const orderItems: OrderItem[] = order.items || order.line_items?.map((item: any) => ({
    id: item.id,
    product_id: item.product_id,
    product_name: item.name || item.product_name,
    quantity: item.quantity || 1,
    price: parseFloat(item.price || item.unit_price || item.total || 0),
    unit_price: parseFloat(item.price || item.unit_price || 0),
    total_price: parseFloat(item.total || item.total_price || 0),
    variant_id: item.variation_id,
    variant_title: item.variation?.name || item.variant_title,
  })) || [];

  // Calculate totals
  const subtotal = order.subtotal || orderItems.reduce((sum, item) => 
    sum + (item.total_price || (item.price * item.quantity)), 0
  );
  const tax = order.tax_amount || 0;
  const shipping = order.shipping_amount || 0;
  const total = order.total_amount || order.total || order.amount || subtotal + tax + shipping;

  const formatAddress = (address: Address | null): string => {
    if (!address) return 'N/A';
    const parts = [
      address.address_1,
      address.address_2,
      address.city,
      address.state,
      address.postcode,
      address.country,
    ].filter(Boolean);
    return parts.join(', ') || 'N/A';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Order #{order.order_number || order.order_id}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {formatDate(order.date)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusBadgeVariant(order.status)} className="text-sm">
                {order.status}
              </Badge>
              {order.payment_method && (
                <Badge variant="outline" className="text-sm">
                  {order.payment_method}
                </Badge>
              )}
              {order.external_source === 'woocommerce' && (
                <Badge variant="secondary" className="text-xs">
                  WooCommerce
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <User className="h-5 w-5 mr-2" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="font-medium text-sm w-24 text-gray-600">Name:</span>
                <span className="text-sm">{customerName}</span>
              </div>
              <div className="flex items-start">
                <Mail className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                <span className="font-medium text-sm w-20 text-gray-600">Email:</span>
                <span className="text-sm break-all">{customerEmail}</span>
              </div>
              {customerPhone !== 'N/A' && (
                <div className="flex items-start">
                  <Phone className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                  <span className="font-medium text-sm w-20 text-gray-600">Phone:</span>
                  <span className="text-sm">{customerPhone}</span>
                </div>
              )}
              {order.user_id && (
                <div className="flex items-start">
                  <span className="font-medium text-sm w-24 text-gray-600">User ID:</span>
                  <span className="text-sm">{order.user_id}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Order Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start">
              <span className="font-medium text-sm w-32 text-gray-600">Order Number:</span>
              <span className="text-sm">{order.order_number || order.order_id}</span>
            </div>
            {order.ref && (
              <div className="flex items-start">
                <span className="font-medium text-sm w-32 text-gray-600">Reference:</span>
                <span className="text-sm">{order.ref}</span>
              </div>
            )}
            <div className="flex items-start">
              <span className="font-medium text-sm w-32 text-gray-600">Date:</span>
              <span className="text-sm">{formatDate(order.date)}</span>
            </div>
            {order.payment_method && (
              <div className="flex items-start">
                <CreditCard className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                <span className="font-medium text-sm w-28 text-gray-600">Payment:</span>
                <span className="text-sm">{order.payment_method}</span>
              </div>
            )}
            {order.external_id && (
              <div className="flex items-start">
                <span className="font-medium text-sm w-32 text-gray-600">External ID:</span>
                <span className="text-sm">{order.external_id}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Billing Address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Billing Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            {billingAddress ? (
              <div className="space-y-2 text-sm">
                {billingAddress.company && (
                  <p className="font-medium">{billingAddress.company}</p>
                )}
                <p>
                  {billingAddress.first_name} {billingAddress.last_name}
                </p>
                <p className="text-muted-foreground">
                  {formatAddress(billingAddress)}
                </p>
                {billingAddress.email && (
                  <p className="text-muted-foreground">
                    <Mail className="h-3 w-3 inline mr-1" />
                    {billingAddress.email}
                  </p>
                )}
                {billingAddress.phone && (
                  <p className="text-muted-foreground">
                    <Phone className="h-3 w-3 inline mr-1" />
                    {billingAddress.phone}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No billing address provided</p>
            )}
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Truck className="h-5 w-5 mr-2" />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            {shippingAddress ? (
              <div className="space-y-2 text-sm">
                {shippingAddress.company && (
                  <p className="font-medium">{shippingAddress.company}</p>
                )}
                <p>
                  {shippingAddress.first_name} {shippingAddress.last_name}
                </p>
                <p className="text-muted-foreground">
                  {formatAddress(shippingAddress)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {billingAddress ? 'Same as billing address' : 'No shipping address provided'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Order Items ({orderItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orderItems.length > 0 ? (
            <>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((item, index) => {
                      const itemPrice = item.unit_price || item.price || 0;
                      const itemQuantity = item.quantity || 1;
                      const itemTotal = item.total_price || (itemPrice * itemQuantity);
                      
                      return (
                        <TableRow key={item.id || index}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.product_name || 'Unknown Product'}</div>
                              {item.variant_title && (
                                <div className="text-xs text-muted-foreground">
                                  Variant: {item.variant_title}
                                </div>
                              )}
                              {item.product_slug && (
                                <div className="text-xs text-muted-foreground">
                                  /{item.product_slug}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">{itemQuantity}</TableCell>
                          <TableCell className="text-right">${itemPrice.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-medium">
                            ${itemTotal.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              
              {/* Order Totals */}
              <div className="mt-6 flex justify-end">
                <div className="w-full max-w-md space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax:</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                  )}
                  {shipping > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping:</span>
                      <span>${shipping.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No items in this order</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
