import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Key,
  Plus,
  Trash2,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  BarChart,
  Shield,
  Settings,
  AlertCircle,
  CheckCircle2,
  Clock,
  Ban,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ApiKey {
  id: string;
  name: string;
  maskedKey: string;
  permissions: string[];
  scopes: any;
  rateLimit: number;
  allowedIps: string[] | null;
  expiresAt: string | null;
  createdAt: string;
  lastUsed: string | null;
  usageCount: number;
  isActive: boolean;
  metadata: any;
  createdBy?: string;
}

// Available permissions for Universal AI support
const AVAILABLE_PERMISSIONS = [
  {
    category: "Content",
    permissions: [
      { id: "content:read", label: "Read Content", description: "View articles and categories" },
      { id: "content:write", label: "Write Content", description: "Create and edit articles" },
      { id: "content:delete", label: "Delete Content", description: "Remove articles and content" },
      { id: "content:generate", label: "Generate Content", description: "AI-powered content generation" },
      { id: "content:analyze", label: "Analyze Content", description: "Content quality analysis" },
    ],
  },
  {
    category: "SEO & Analytics",
    permissions: [
      { id: "seo:optimize", label: "SEO Optimization", description: "Generate SEO metadata" },
      { id: "analytics:read", label: "Read Analytics", description: "View analytics and insights" },
      { id: "insights:read", label: "Read Insights", description: "Access AI-generated insights" },
    ],
  },
  {
    category: "User Management",
    permissions: [
      { id: "users:read", label: "Read Users", description: "View user information" },
      { id: "users:write", label: "Write Users", description: "Create and edit users" },
      { id: "users:delete", label: "Delete Users", description: "Remove users" },
    ],
  },
  {
    category: "Administration",
    permissions: [
      { id: "admin:read", label: "Admin Read", description: "View admin data" },
      { id: "admin:write", label: "Admin Write", description: "Modify admin settings" },
      { id: "*", label: "Full Access (Superadmin)", description: "Complete read/write access to all resources" },
    ],
  },
];

export default function ApiKeyManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [newKeyData, setNewKeyData] = useState<any>(null);
  const [showFullKey, setShowFullKey] = useState<string | null>(null);

  // Form state for creating API keys
  const [formData, setFormData] = useState({
    name: "",
    permissions: [] as string[],
    rateLimit: 100,
    allowedIps: "",
    expiresAt: "",
    metadata: { aiModel: "any", purpose: "" },
  });

  // Fetch API keys
  const { data: apiKeys, isLoading } = useQuery<ApiKey[]>({
    queryKey: ["apiKeys"],
    queryFn: async () => {
        const response = await fetch("/api/admin/api-keys", {
          credentials: "include",
        });
      if (!response.ok) throw new Error("Failed to fetch API keys");
      return response.json();
    },
  });

  // Create API key mutation
  const createKeyMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/admin/api-keys", {
        method: "POST",
          credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create API key");
      return response.json();
    },
    onSuccess: (data) => {
      setNewKeyData(data);
      queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
      toast({
        title: "API Key Created",
        description: "Your new API key has been generated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive",
      });
    },
  });

  // Delete API key mutation
  const deleteKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deactivating API key:', id);
      const response = await fetch(`/api/admin/api-keys/${id}`, {
        method: "DELETE",
        credentials: "include", // Important: Include cookies for session auth
      });
      console.log('Deactivate response status:', response.status);
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to deactivate API key" }));
        console.error('Deactivate error:', error);
        throw new Error(error.error || "Failed to deactivate API key");
      }
      return response.json();
    },
    onSuccess: () => {
      console.log('API key deactivated successfully');
      queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
      toast({
        title: "API Key Deactivated",
        description: "The API key has been deactivated successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Deactivate mutation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to deactivate API key",
        variant: "destructive",
      });
    },
  });

  // Permanent delete mutation (hard delete - removes from database)
  const permanentDeleteKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Permanent delete mutation called for ID:', id);
      const response = await fetch(`/api/admin/api-keys/${id}?permanent=true`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Permanent delete response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Permanent delete failed:', errorText);
        throw new Error(`Failed to permanently delete API key: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: () => {
      console.log('API key permanently deleted successfully');
      queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
      toast({
        title: "API Key Deleted",
        description: "The API key has been permanently deleted.",
      });
    },
    onError: (error: any) => {
      console.error('Permanent delete mutation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete API key",
        variant: "destructive",
      });
    },
  });

  // Regenerate API key mutation
  const regenerateKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/api-keys/${id}/regenerate`, {
        method: "POST",
          credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to regenerate API key");
      return response.json();
    },
    onSuccess: (data) => {
      setNewKeyData(data);
      queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
      toast({
        title: "API Key Regenerated",
        description: "A new API key has been generated. Make sure to copy it now.",
      });
    },
  });

  const handleCreateKey = () => {
    const data = {
      ...formData,
      allowedIps: formData.allowedIps ? formData.allowedIps.split(",").map(ip => ip.trim()) : null,
      expiresAt: formData.expiresAt || null,
    };

    createKeyMutation.mutate(data);
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      permissions: [],
      rateLimit: 100,
      allowedIps: "",
      expiresAt: "",
      metadata: { aiModel: "any", purpose: "" },
    });
  };

  const togglePermission = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Key className="h-6 w-6" />
            API Key Management
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage API keys for Universal AI model integration and external tools
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Generate a new API key with custom permissions and rate limits for Universal AI support
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="keyName">Key Name *</Label>
                  <Input
                    id="keyName"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., ChatGPT Integration, Content Generator"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rateLimit">Rate Limit (requests/hour)</Label>
                    <Input
                      id="rateLimit"
                      type="number"
                      value={formData.rateLimit}
                      onChange={(e) => setFormData({ ...formData, rateLimit: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
                    <Input
                      id="expiresAt"
                      type="date"
                      value={formData.expiresAt}
                      onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="allowedIps">Allowed IP Addresses (Optional)</Label>
                  <Input
                    id="allowedIps"
                    value={formData.allowedIps}
                    onChange={(e) => setFormData({ ...formData, allowedIps: e.target.value })}
                    placeholder="192.168.1.1, 10.0.0.1 (comma-separated)"
                  />
                </div>
              </div>

              <Separator />

              {/* Permissions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Permissions</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const allPermissions = AVAILABLE_PERMISSIONS.flatMap(cat =>
                        cat.permissions.map(p => p.id)
                      );
                      setFormData({ ...formData, permissions: allPermissions });
                    }}
                  >
                    Select All
                  </Button>
                </div>

                {AVAILABLE_PERMISSIONS.map((category) => (
                  <div key={category.category} className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground">{category.category}</h4>
                    <div className="space-y-2 pl-4">
                      {category.permissions.map((permission) => (
                        <div key={permission.id} className="flex items-start space-x-3">
                          <Checkbox
                            id={permission.id}
                            checked={formData.permissions.includes(permission.id)}
                            onCheckedChange={() => togglePermission(permission.id)}
                          />
                          <div className="space-y-1 leading-none">
                            <Label
                              htmlFor={permission.id}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {permission.label}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {permission.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Metadata */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">AI Model Configuration (Optional)</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="aiModel">Preferred AI Model</Label>
                    <Select
                      value={formData.metadata.aiModel}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          metadata: { ...formData.metadata, aiModel: value },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any AI Model (Universal)</SelectItem>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                        <SelectItem value="claude-3">Claude 3</SelectItem>
                        <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                        <SelectItem value="llama-2">Llama 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="purpose">Purpose/Notes</Label>
                    <Input
                      id="purpose"
                      value={formData.metadata.purpose}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          metadata: { ...formData.metadata, purpose: e.target.value },
                        })
                      }
                      placeholder="e.g., Content automation"
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateKey} disabled={!formData.name || formData.permissions.length === 0}>
                Create API Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* New Key Display Dialog */}
      {newKeyData && (
        <Dialog open={!!newKeyData} onOpenChange={() => setNewKeyData(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                API Key Created Successfully
              </DialogTitle>
              <DialogDescription>
                Make sure to copy your API key now. You won't be able to see it again!
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg">
                <Label className="text-xs text-muted-foreground">API Key</Label>
                <div className="flex items-center gap-2 mt-2">
                  <code className="flex-1 text-sm font-mono bg-background p-2 rounded border">
                    {newKeyData.key || newKeyData.newKey}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(newKeyData.key || newKeyData.newKey)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Store this API key securely. It provides access to your blog platform based on the permissions you granted.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* API Keys Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active API Keys</CardTitle>
          <CardDescription>
            Manage your API keys for Universal AI models and external integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : !apiKeys || apiKeys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No API keys created yet. Create one to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {showFullKey === key.id ? key.maskedKey : key.maskedKey}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(key.maskedKey)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(key.permissions) && key.permissions.slice(0, 2).map((perm) => (
                          <Badge key={perm} variant="outline" className="text-xs">
                            {perm}
                          </Badge>
                        ))}
                        {Array.isArray(key.permissions) && key.permissions.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{key.permissions.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{key.usageCount || 0} calls</div>
                        <div className="text-xs text-muted-foreground">
                          Limit: {key.rateLimit}/hr
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(key.lastUsed)}
                    </TableCell>
                    <TableCell>
                      {key.isActive ? (
                        <Badge variant="default" className="bg-green-500">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => regenerateKeyMutation.mutate(key.id)}
                          title="Regenerate key"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteKeyMutation.mutate(key.id)}
                          title="Deactivate key (soft delete)"
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm(`Are you sure you want to permanently delete "${key.name}"? This action cannot be undone.`)) {
                              permanentDeleteKeyMutation.mutate(key.id);
                            }
                          }}
                          title="Permanently delete key"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      {apiKeys && apiKeys.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              API Usage Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Total Keys</div>
                <div className="text-2xl font-bold mt-1">{apiKeys.length}</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Active Keys</div>
                <div className="text-2xl font-bold mt-1">
                  {apiKeys.filter(k => k.isActive).length}
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Total API Calls</div>
                <div className="text-2xl font-bold mt-1">
                  {apiKeys.reduce((sum, k) => sum + (k.usageCount || 0), 0)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
