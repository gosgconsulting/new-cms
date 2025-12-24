import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Copy, Key, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface APIKeysManagerProps {
  brandId: string;
}

export function APIKeysManager({ brandId }: APIKeysManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const queryClient = useQueryClient();

  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ["api-keys", brandId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .eq("brand_id", brandId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const generateKeyMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase.functions.invoke("generate-api-key", {
        body: { brandId, keyName: name },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setGeneratedKey(data.apiKey);
      queryClient.invalidateQueries({ queryKey: ["api-keys", brandId] });
      toast.success("API key generated successfully");
      setKeyName("");
    },
    onError: (error) => {
      toast.error(`Failed to generate API key: ${error.message}`);
    },
  });

  const revokeKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const { error } = await supabase.functions.invoke("revoke-api-key", {
        body: { keyId },
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys", brandId] });
      toast.success("API key revoked successfully");
    },
    onError: (error) => {
      toast.error(`Failed to revoke API key: ${error.message}`);
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleGenerateKey = () => {
    if (!keyName.trim()) {
      toast.error("Please enter a key name");
      return;
    }
    generateKeyMutation.mutate(keyName);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">API Keys</h3>
          <p className="text-sm text-muted-foreground">
            Manage API keys for programmatic access to your SEO data
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setGeneratedKey(null)}>
              <Key className="mr-2 h-4 w-4" />
              Generate New Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate API Key</DialogTitle>
            </DialogHeader>
            {generatedKey ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-yellow-500 bg-yellow-50 p-4 dark:bg-yellow-950">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    ⚠️ Save this key now - you won't see it again!
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Your API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      value={generatedKey}
                      readOnly
                      type={showKey ? "text" : "password"}
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowKey(!showKey)}
                    >
                      {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(generatedKey)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button onClick={() => setIsCreateOpen(false)} className="w-full">
                  Done
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="keyName">Key Name</Label>
                  <Input
                    id="keyName"
                    placeholder="e.g., Production API, Development"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleGenerateKey}
                  disabled={generateKeyMutation.isPending}
                  className="w-full"
                >
                  {generateKeyMutation.isPending ? "Generating..." : "Generate Key"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last Used</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : apiKeys && apiKeys.length > 0 ? (
            apiKeys.map((key) => (
              <TableRow key={key.id}>
                <TableCell className="font-medium">{key.key_name}</TableCell>
                <TableCell>
                  <code className="rounded bg-muted px-2 py-1 text-xs">
                    {key.key_prefix}
                  </code>
                </TableCell>
                <TableCell>
                  <Badge variant={key.is_active ? "default" : "secondary"}>
                    {key.is_active ? "Active" : "Revoked"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(key.created_at), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {key.last_used_at
                    ? format(new Date(key.last_used_at), "MMM d, yyyy")
                    : "Never"}
                </TableCell>
                <TableCell>
                  {key.is_active && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => revokeKeyMutation.mutate(key.id)}
                      disabled={revokeKeyMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No API keys yet. Generate your first key to get started.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}