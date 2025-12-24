import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, Calendar, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StripeInvoice {
  id: string;
  date: number;
  amount: number;
  currency: string;
  status: string;
  paid: boolean;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
  description: string;
  period_start: number;
  period_end: number;
}

export const BillingSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<StripeInvoice[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('stripe_customer_id, subscription_status')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setUserProfile(data);
          
          // Only fetch billing history if user has a Stripe customer ID (not free trial)
          if (data.stripe_customer_id) {
            fetchBillingHistory();
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [user]);

  const fetchBillingHistory = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-stripe-invoices");

      // Silently handle errors - don't show error toast
      if (error) {
        console.error("Error fetching billing history:", error);
        return;
      }

      setInvoices(data?.invoices || []);
    } catch (error) {
      console.error("Error fetching billing history:", error);
      // Don't show error toast to user
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, paid: boolean) => {
    if (paid) {
      return <Badge variant="default">Paid</Badge>;
    }
    
    switch (status) {
      case "open":
        return <Badge variant="secondary">Pending</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "void":
        return <Badge variant="outline">Void</Badge>;
      case "uncollectible":
        return <Badge variant="destructive">Uncollectible</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleAddPaymentMethod = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-setup-session", {
        body: {
          success_url: `${window.location.origin}/app/account?payment_method_added=true`,
          cancel_url: `${window.location.origin}/app/account?payment_method_cancelled=true`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error creating setup session:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start payment method setup",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No payment methods on file</p>
            <Button 
              variant="outline" 
              onClick={handleAddPaymentMethod}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                'Add Payment Method'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History - Only show for users with Stripe customer ID */}
      {userProfile?.stripe_customer_id && (
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No billing history available</p>
              </div>
            ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {formatDate(new Date(invoice.date * 1000).toISOString())}
                      </TableCell>
                      <TableCell>{invoice.description}</TableCell>
                      <TableCell>
                        {formatCurrency(invoice.amount)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(invoice.status, invoice.paid)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {!invoice.paid && invoice.hosted_invoice_url && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => window.open(invoice.hosted_invoice_url!, '_blank')}
                            >
                              Pay Now
                            </Button>
                          )}
                          {invoice.invoice_pdf && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(invoice.invoice_pdf!, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        </Card>
      )}

    </div>
  );
};