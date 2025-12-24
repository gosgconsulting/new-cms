import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw, Calendar, Filter, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  subscription_status: string;
  plan_id: string | null;
  plan_name?: string;
  trial_end: string | null;
  created_at: string;
}

export const UsersManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setError(null);
      
      // Prepare date parameters
      const startDateParam = startDate ? startDate : null;
      const endDateParam = endDate ? endDate : null;
      
      // Use the new database function to get profiles with emails and date filtering
      const { data: usersData, error: usersError } = await supabase
        .rpc('get_admin_user_profiles', {
          start_date: startDateParam,
          end_date: endDateParam
        });

      if (usersError) {
        console.error('Error fetching users with emails:', usersError);
        
        // Check if it's a permission error
        if (usersError.message?.includes('Access denied') || usersError.message?.includes('admin')) {
          setError('Admin access required to view user emails. Please contact support if you believe this is an error.');
        } else {
          setError('Failed to fetch user emails. Using basic profile data instead.');
        }
        
        // Fallback to basic profiles query if the function fails
        let query = supabase
          .from('profiles')
          .select(`
            id, 
            first_name, 
            last_name, 
            email,
            subscription_status, 
            plan_id, 
            trial_end, 
            created_at,
            plans (
              name
            )
          `)
          .order('created_at', { ascending: false });

        // Apply date filters to fallback query
        if (startDate) {
          query = query.gte('created_at', startDate);
        }
        if (endDate) {
          // Add one day to endDate to include the entire day
          const endDateTime = new Date(endDate);
          endDateTime.setDate(endDateTime.getDate() + 1);
          query = query.lt('created_at', endDateTime.toISOString());
        }

        const { data: profilesData, error: profilesError } = await query;

        if (profilesError) throw profilesError;

        // Map profile data with plan names
        const usersWithDetails = (profilesData || []).map((profile: any) => ({
          ...profile,
          plan_name: profile.plans?.name || 'Free Trial',
        }));

        setUsers(usersWithDetails);
      } else {
        // The new function returns JSONB, so we can use it directly
        setUsers(usersData || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch user data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      trialing: "secondary",
      canceled: "destructive",
      past_due: "destructive",
    };
    return (
      <Badge variant={variants[status] || "outline"}>
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleApplyFilters = () => {
    fetchUsers();
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    fetchUsers();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (startDate) count++;
    if (endDate) count++;
    return count;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">All Users ({users.length})</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Date Filters */}
      {showFilters && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Filter by Signup Date
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="Select start date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="Select end date"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleApplyFilters} disabled={loading}>
                Apply Filters
              </Button>
              <Button 
                variant="outline" 
                onClick={handleClearFilters}
                disabled={loading}
              >
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">{error}</p>
        </div>
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Trial Ends</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  {user.first_name || user.last_name
                    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                    : 'N/A'}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {user.email || 'N/A'}
                </TableCell>
                <TableCell>{getStatusBadge(user.subscription_status)}</TableCell>
                <TableCell>
                  <span className="font-medium">{user.plan_name || 'Free Trial'}</span>
                </TableCell>
                <TableCell>{formatDate(user.created_at)}</TableCell>
                <TableCell>
                  {user.trial_end ? formatDate(user.trial_end) : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
