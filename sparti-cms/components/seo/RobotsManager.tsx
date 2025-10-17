import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Save, 
  RefreshCw, 
  Eye, 
  Plus, 
  Trash2,
  AlertCircle,
  CheckCircle,
  Download,
  Upload
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

interface RobotsRule {
  id?: number;
  user_agent: string;
  directive: 'Allow' | 'Disallow';
  path: string;
  notes?: string;
  is_active?: boolean;
}

const RobotsManager: React.FC = () => {
  const [rules, setRules] = useState<RobotsRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatedRobotsTxt, setGeneratedRobotsTxt] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [newRule, setNewRule] = useState<RobotsRule>({
    user_agent: '*',
    directive: 'Allow',
    path: '/',
    notes: ''
  });

  useEffect(() => {
    loadRobotsConfig();
  }, []);

  const loadRobotsConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/robots-config');
      if (!response.ok) throw new Error('Failed to fetch robots config');
      
      const data = await response.json();
      setRules(data);
      
      // Generate preview
      generatePreview(data);
    } catch (error) {
      console.error('[testing] Error loading robots config:', error);
      toast({
        title: "Error",
        description: "Failed to load robots.txt configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = async (currentRules?: RobotsRule[]) => {
    try {
      const response = await fetch('/api/robots-txt/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rules: currentRules || rules }),
      });
      
      if (!response.ok) throw new Error('Failed to generate robots.txt');
      
      const robotsTxt = await response.text();
      setGeneratedRobotsTxt(robotsTxt);
    } catch (error) {
      console.error('[testing] Error generating robots.txt:', error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/robots-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rules }),
      });

      if (!response.ok) throw new Error('Failed to save robots config');

      toast({
        title: "Success",
        description: "Robots.txt configuration saved successfully.",
      });

      // Regenerate preview
      generatePreview();
      
      // Update the actual robots.txt file
      await updateRobotsTxtFile();
      
    } catch (error) {
      console.error('[testing] Error saving robots config:', error);
      toast({
        title: "Error",
        description: "Failed to save robots.txt configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateRobotsTxtFile = async () => {
    try {
      const response = await fetch('/api/robots-txt/update', {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to update robots.txt file');
      
      toast({
        title: "Success",
        description: "robots.txt file updated successfully.",
      });
    } catch (error) {
      console.error('[testing] Error updating robots.txt file:', error);
      toast({
        title: "Warning",
        description: "Configuration saved but failed to update robots.txt file.",
        variant: "destructive",
      });
    }
  };

  const addRule = () => {
    if (!newRule.user_agent || !newRule.path) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const rule: RobotsRule = {
      ...newRule,
      id: Date.now(), // Temporary ID for new rules
      is_active: true
    };

    setRules(prev => [...prev, rule]);
    setNewRule({
      user_agent: '*',
      directive: 'Allow',
      path: '/',
      notes: ''
    });

    // Update preview
    generatePreview([...rules, rule]);
  };

  const removeRule = (index: number) => {
    const updatedRules = rules.filter((_, i) => i !== index);
    setRules(updatedRules);
    generatePreview(updatedRules);
  };

  const updateRule = (index: number, field: keyof RobotsRule, value: string) => {
    const updatedRules = [...rules];
    updatedRules[index] = { ...updatedRules[index], [field]: value };
    setRules(updatedRules);
    generatePreview(updatedRules);
  };

  const getDirectiveBadge = (directive: string) => {
    return (
      <Badge variant={directive === 'Allow' ? 'default' : 'destructive'}>
        {directive === 'Allow' ? (
          <>
            <CheckCircle className="mr-1 h-3 w-3" />
            Allow
          </>
        ) : (
          <>
            <AlertCircle className="mr-1 h-3 w-3" />
            Disallow
          </>
        )}
      </Badge>
    );
  };

  const commonUserAgents = [
    '*',
    'Googlebot',
    'Bingbot',
    'Slurp', // Yahoo
    'DuckDuckBot',
    'Baiduspider',
    'YandexBot',
    'facebookexternalhit',
    'Twitterbot',
    'LinkedInBot'
  ];

  const commonPaths = [
    '/',
    '/admin',
    '/api',
    '/wp-admin',
    '/wp-content',
    '/private',
    '/temp',
    '/cache',
    '/*.pdf',
    '/*.doc',
    '/*.json',
    '/*.xml'
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-border shadow-sm p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brandPurple"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-border shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-foreground flex items-center">
              <Shield className="mr-2 h-6 w-6 text-brandPurple" />
              Robots.txt Management
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Control how search engines crawl your website with robots.txt directives
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
              <Eye className="mr-2 h-4 w-4" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </Button>
            <Button variant="outline" onClick={() => generatePreview()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="bg-brandPurple hover:bg-brandPurple/90"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save & Update'}
            </Button>
          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium">robots.txt Preview</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-3 w-3" />
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="mr-2 h-3 w-3" />
                  Test
                </Button>
              </div>
            </div>
            <pre className="bg-white p-3 rounded border text-sm font-mono overflow-x-auto">
              {generatedRobotsTxt || 'No rules configured'}
            </pre>
          </div>
        )}

        {/* Add New Rule */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-medium mb-4 text-blue-900">Add New Rule</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="new_user_agent">User Agent</Label>
              <Select 
                value={newRule.user_agent} 
                onValueChange={(value) => setNewRule(prev => ({ ...prev, user_agent: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {commonUserAgents.map(agent => (
                    <SelectItem key={agent} value={agent}>{agent}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="new_directive">Directive</Label>
              <Select 
                value={newRule.directive} 
                onValueChange={(value: 'Allow' | 'Disallow') => setNewRule(prev => ({ ...prev, directive: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Allow">Allow</SelectItem>
                  <SelectItem value="Disallow">Disallow</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="new_path">Path</Label>
              <Select 
                value={newRule.path} 
                onValueChange={(value) => setNewRule(prev => ({ ...prev, path: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {commonPaths.map(path => (
                    <SelectItem key={path} value={path}>{path}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={addRule} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Rule
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="new_notes">Notes (Optional)</Label>
            <Input
              id="new_notes"
              value={newRule.notes || ''}
              onChange={(e) => setNewRule(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add notes about this rule..."
            />
          </div>
        </div>

        {/* Rules Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Agent</TableHead>
                <TableHead>Directive</TableHead>
                <TableHead>Path</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex flex-col items-center">
                      <Shield className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No robots.txt rules configured</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add rules above to control search engine crawling
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                rules.map((rule, index) => (
                  <TableRow key={rule.id || index}>
                    <TableCell>
                      <Input
                        value={rule.user_agent}
                        onChange={(e) => updateRule(index, 'user_agent', e.target.value)}
                        className="font-mono text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={rule.directive} 
                        onValueChange={(value: 'Allow' | 'Disallow') => updateRule(index, 'directive', value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Allow">Allow</SelectItem>
                          <SelectItem value="Disallow">Disallow</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={rule.path}
                        onChange={(e) => updateRule(index, 'path', e.target.value)}
                        className="font-mono text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={rule.notes || ''}
                        onChange={(e) => updateRule(index, 'notes', e.target.value)}
                        placeholder="Notes..."
                        className="text-sm"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeRule(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Info Panel */}
        <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-amber-900">Important Notes</h4>
              <ul className="text-sm text-amber-800 mt-2 space-y-1">
                <li>• Changes will update the live robots.txt file at /robots.txt</li>
                <li>• Use "*" for all user agents or specify individual bots</li>
                <li>• "Disallow: /" blocks all crawling for that user agent</li>
                <li>• Always test your robots.txt with Google Search Console</li>
                <li>• The sitemap reference is automatically added</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Allow Rules</p>
                <p className="text-2xl font-bold text-green-900">
                  {rules.filter(r => r.directive === 'Allow').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-red-600">Disallow Rules</p>
                <p className="text-2xl font-bold text-red-900">
                  {rules.filter(r => r.directive === 'Disallow').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Total Rules</p>
                <p className="text-2xl font-bold text-blue-900">{rules.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RobotsManager;
