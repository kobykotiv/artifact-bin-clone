import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  Download, 
  Upload,
  Key,
  Code,
  Zap,
  Brain,
  Save,
  X,
  ChevronRight,
  Info
} from 'lucide-react';
import { useAuthContext } from '@/lib/context/AuthContext';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface SettingsPageProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPage({ isOpen, onClose }: SettingsPageProps) {
  const { authState } = useAuthContext();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile Settings
  const [profileData, setProfileData] = useState({
    displayName: authState.user?.email || '',
    email: authState.user?.email || '',
    bio: '',
    location: '',
    website: '',
    publicProfile: false
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    autoSave: true,
    notifications: true,
    emailUpdates: false,
    defaultArtifactPrivacy: 'private',
    codeEditor: {
      fontSize: 14,
      tabSize: 2,
      wordWrap: true,
      lineNumbers: true,
      theme: 'vs-light'
    }
  });

  // API Keys
  const [apiKeys, setApiKeys] = useState({
    gemini: '',
    openai: '',
    anthropic: '',
    github: ''
  });

  // Advanced Settings
  const [advancedSettings, setAdvancedSettings] = useState({
    exportFormat: 'json',
    maxArtifacts: 1000,
    cacheDuration: 24,
    enableAnalytics: true,
    betaFeatures: false
  });

  const settingsSections = [
    { id: 'profile', label: 'Profile', icon: User, description: 'Personal information and public profile' },
    { id: 'preferences', label: 'Preferences', icon: Settings, description: 'App behavior and defaults' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Email and push notifications' },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield, description: 'Data privacy and security settings' },
    { id: 'api-keys', label: 'API Keys', icon: Key, description: 'External service integrations' },
    { id: 'advanced', label: 'Advanced', icon: Code, description: 'Power user settings' },
    { id: 'data', label: 'Data & Export', icon: Database, description: 'Import, export, and backup' }
  ];

  const handleSaveProfile = () => {
    // Save profile data
    toast.success('Profile updated successfully');
  };

  const handleSavePreferences = () => {
    // Save preferences
    toast.success('Preferences saved');
  };

  const handleSaveApiKey = (provider: string) => {
    // Save API key securely
    toast.success(`${provider} API key saved`);
  };

  const handleExportData = (format: string) => {
    // Export user data
    toast.success(`Exporting data as ${format}...`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl flex items-center">
                <Settings className="h-6 w-6 mr-2" />
                Settings
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your account settings and preferences
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex">
            {/* Sidebar Navigation */}
            <div className="w-64 border-r pr-4">
              <TabsList orientation="vertical" className="h-auto flex-col items-stretch bg-transparent p-0">
                {settingsSections.map(section => {
                  const Icon = section.icon;
                  return (
                    <TabsTrigger
                      key={section.id}
                      value={section.id}
                      className={`w-full justify-start p-3 mb-1 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-r-2 data-[state=active]:border-blue-600`}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      <div className="text-left flex-1">
                        <div className="font-medium">{section.label}</div>
                        <div className="text-xs text-muted-foreground">{section.description}</div>
                      </div>
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {/* Content Area */}
            <div className="flex-1 pl-6 overflow-auto">
              {/* Profile Settings */}
              <TabsContent value="profile" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal information and public profile</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                          id="displayName"
                          value={profileData.displayName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell others about yourself..."
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          placeholder="City, Country"
                          value={profileData.location}
                          onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          placeholder="https://example.com"
                          value={profileData.website}
                          onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="publicProfile"
                        checked={profileData.publicProfile}
                        onCheckedChange={(checked) => setProfileData(prev => ({ ...prev, publicProfile: checked }))}
                      />
                      <Label htmlFor="publicProfile">Make profile public</Label>
                    </div>

                    <Button onClick={handleSaveProfile}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Profile
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preferences */}
              <TabsContent value="preferences" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>App Preferences</CardTitle>
                    <CardDescription>Customize how the app behaves</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="theme">Theme</Label>
                        <Select value={preferences.theme} onValueChange={(value) => setPreferences(prev => ({ ...prev, theme: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="language">Language</Label>
                        <Select value={preferences.language} onValueChange={(value) => setPreferences(prev => ({ ...prev, language: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Español</SelectItem>
                            <SelectItem value="fr">Français</SelectItem>
                            <SelectItem value="de">Deutsch</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="autoSave"
                          checked={preferences.autoSave}
                          onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, autoSave: checked }))}
                        />
                        <Label htmlFor="autoSave">Auto-save artifacts</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="notifications"
                          checked={preferences.notifications}
                          onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, notifications: checked }))}
                        />
                        <Label htmlFor="notifications">Enable notifications</Label>
                      </div>
                    </div>

                    <Button onClick={handleSavePreferences}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Preferences
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Code Editor Settings</CardTitle>
                    <CardDescription>Customize the code editor experience</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="fontSize">Font Size</Label>
                        <Select 
                          value={preferences.codeEditor.fontSize.toString()} 
                          onValueChange={(value) => setPreferences(prev => ({ 
                            ...prev, 
                            codeEditor: { ...prev.codeEditor, fontSize: parseInt(value) }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="12">12px</SelectItem>
                            <SelectItem value="14">14px</SelectItem>
                            <SelectItem value="16">16px</SelectItem>
                            <SelectItem value="18">18px</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="tabSize">Tab Size</Label>
                        <Select 
                          value={preferences.codeEditor.tabSize.toString()} 
                          onValueChange={(value) => setPreferences(prev => ({ 
                            ...prev, 
                            codeEditor: { ...prev.codeEditor, tabSize: parseInt(value) }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2 spaces</SelectItem>
                            <SelectItem value="4">4 spaces</SelectItem>
                            <SelectItem value="8">8 spaces</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="editorTheme">Editor Theme</Label>
                        <Select 
                          value={preferences.codeEditor.theme} 
                          onValueChange={(value) => setPreferences(prev => ({ 
                            ...prev, 
                            codeEditor: { ...prev.codeEditor, theme: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vs-light">Light</SelectItem>
                            <SelectItem value="vs-dark">Dark</SelectItem>
                            <SelectItem value="hc-black">High Contrast</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* API Keys */}
              <TabsContent value="api-keys" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>API Keys</CardTitle>
                    <CardDescription>
                      Connect external services to enhance your workflow
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {Object.entries(apiKeys).map(([provider, key]) => (
                      <div key={provider} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Brain className="h-5 w-5 text-blue-600" />
                            <h3 className="font-medium capitalize">{provider} API</h3>
                            {key && <Badge variant="secondary">Connected</Badge>}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleSaveApiKey(provider)}
                            disabled={!key}
                          >
                            Save
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <Input
                            type="password"
                            placeholder={`Enter your ${provider} API key`}
                            value={key}
                            onChange={(e) => setApiKeys(prev => ({ ...prev, [provider]: e.target.value }))}
                          />
                          <p className="text-xs text-muted-foreground">
                            {provider === 'gemini' && 'Get your API key from Google AI Studio'}
                            {provider === 'openai' && 'Get your API key from OpenAI Platform'}
                            {provider === 'anthropic' && 'Get your API key from Anthropic Console'}
                            {provider === 'github' && 'Get your personal access token from GitHub'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Data & Export */}
              <TabsContent value="data" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Data Management</CardTitle>
                    <CardDescription>Export, import, and manage your data</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h3 className="font-medium">Export Data</h3>
                        <p className="text-sm text-muted-foreground">Download all your artifacts and settings</p>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleExportData('json')}>
                            <Download className="h-4 w-4 mr-2" />
                            Export as JSON
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleExportData('zip')}>
                            <Download className="h-4 w-4 mr-2" />
                            Export as ZIP
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="font-medium">Import Data</h3>
                        <p className="text-sm text-muted-foreground">Restore from backup or migrate</p>
                        <Button size="sm" variant="outline">
                          <Upload className="h-4 w-4 mr-2" />
                          Import Data
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                    <CardDescription>Irreversible actions - proceed with caution</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border border-red-200 rounded-lg p-4">
                      <h3 className="font-medium text-red-600 mb-2">Delete All Data</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        This will permanently delete all your artifacts, settings, and account data.
                      </p>
                      <Button variant="destructive" size="sm">
                        Delete All Data
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Other tabs would be similar... */}
              <TabsContent value="notifications" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Choose what notifications you want to receive</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive updates via email</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Push Notifications</Label>
                          <p className="text-sm text-muted-foreground">Browser notifications</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Collaboration Updates</Label>
                          <p className="text-sm text-muted-foreground">When someone comments or edits shared artifacts</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="privacy" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy & Security</CardTitle>
                    <CardDescription>Control your privacy and security settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Public Profile</Label>
                          <p className="text-sm text-muted-foreground">Allow others to see your profile</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Analytics</Label>
                          <p className="text-sm text-muted-foreground">Help improve the app with usage data</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Settings</CardTitle>
                    <CardDescription>Advanced configuration options</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Max Artifacts</Label>
                        <Input type="number" value={advancedSettings.maxArtifacts} />
                      </div>
                      <div>
                        <Label>Cache Duration (hours)</Label>
                        <Input type="number" value={advancedSettings.cacheDuration} />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={advancedSettings.betaFeatures}
                        onCheckedChange={(checked) => setAdvancedSettings(prev => ({ ...prev, betaFeatures: checked }))}
                      />
                      <Label>Enable beta features</Label>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
