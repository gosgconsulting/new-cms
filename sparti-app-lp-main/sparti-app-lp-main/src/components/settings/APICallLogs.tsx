import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Activity, ArrowRight } from "lucide-react";
import { format } from "date-fns";

interface APILog {
  id: string;
  created_at: string;
  service_name: string;
  model_name: string | null;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_usd: number;
  request_data: any;
}

export const APICallLogs = () => {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["api-call-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("api_token_usage")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as APILog[];
    },
  });

  const getProviderIcon = (serviceName: string) => {
    const service = serviceName.toLowerCase();
    if (service.includes('openai') || service.includes('gpt')) {
      return "🤖";
    } else if (service.includes('claude') || service.includes('anthropic')) {
      return "🧠";
    } else if (service.includes('gemini') || service.includes('google')) {
      return "🔮";
    } else if (service.includes('firecrawl')) {
      return "🔥";
    }
    return "⚡";
  };

  const getProviderBadgeVariant = (serviceName: string) => {
    const service = serviceName.toLowerCase();
    if (service.includes('openai') || service.includes('gpt')) {
      return "default";
    } else if (service.includes('claude') || service.includes('anthropic')) {
      return "secondary";
    }
    return "outline";
  };

  const getAppName = (requestData: any) => {
    if (requestData?.processed_by) {
      return requestData.processed_by.replace(/-function$/, '').replace(/-/g, ' ');
    }
    if (requestData?.title) {
      return "Article Generation";
    }
    if (requestData?.topic) {
      return "Topic Research";
    }
    return "Sparti AI";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading API Calls...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          API Call Logs
        </CardTitle>
        <CardDescription>
          Real-time tracking of all API calls with costs and token usage
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!logs || logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No API calls logged yet. Start using the platform to see your usage here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Provider / Model</TableHead>
                  <TableHead>App</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      {format(new Date(log.created_at), "MMM dd, hh:mm a")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getProviderIcon(log.service_name)}</span>
                        <div className="flex flex-col gap-1">
                          <Badge variant={getProviderBadgeVariant(log.service_name)} className="text-xs w-fit">
                            {log.model_name || log.service_name}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm capitalize">
                      {getAppName(log.request_data)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        {log.prompt_tokens > 0 && (
                          <>
                            <span className="text-muted-foreground">{log.prompt_tokens.toLocaleString()}</span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">{log.completion_tokens.toLocaleString()}</span>
                          </>
                        )}
                        {log.prompt_tokens === 0 && log.total_tokens === 0 && (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold">
                        ${Number(log.cost_usd).toFixed(log.cost_usd < 0.01 ? 5 : 2)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
