import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Download, Upload, BarChart3, PieChart } from 'lucide-react';
import { StatisticsForm } from './StatisticsForm';
import { Statistics } from '@/lib/schemas/statisticsSchema';
import { dbService } from '@/lib/services/db';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

interface UsageStatisticsPageProps {
  userId: string;
  onBack: () => void;
}

export function UsageStatisticsPage({ userId, onBack }: UsageStatisticsPageProps) {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        // Replace with actual data fetching logic
        const data = await dbService.getUserStatistics(userId);
        
        // Format the data to match our schema
        const formattedStats: Statistics = {
          user: {
            userId,
            totalArtifacts: data.artifactCount || 0,
            totalFolders: data.folderCount || 0,
            lastActivity: data.lastActivity || new Date().toISOString(),
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
          },
          artifacts: {
            totalCount: data.artifactCount || 0,
            byLanguage: data.languageDistribution || {},
            byFolder: data.folderDistribution || {},
            averageSize: data.averageArtifactSize || 0,
            totalSize: data.totalArtifactSize || 0,
          },
          storage: {
            used: data.storageUsed || 0,
            limit: data.storageLimit || 1000000,
            percentUsed: data.storageUsedPercent || 0,
          },
          activity: {
            daily: data.dailyActivity || {},
            weekly: data.weeklyActivity || {},
            monthly: data.monthlyActivity || {},
          },
        };
        
        setStatistics(formattedStats);
      } catch (error) {
        console.error("Failed to fetch statistics:", error);
        toast.error("Failed to load usage statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [userId]);

  const handleExportStatistics = () => {
    if (!statistics) return;
    
    const jsonData = JSON.stringify(statistics, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `usage-statistics-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast.success("Statistics exported successfully");
  };

  const handleImportStatistics = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedStats = JSON.parse(content);
        setStatistics(importedStats);
        toast.success("Statistics imported successfully");
      } catch (error) {
        console.error("Failed to parse imported statistics:", error);
        toast.error("Failed to import statistics: Invalid format");
      }
    };
    
    reader.readAsText(file);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-muted-foreground mb-4">No statistics available</p>
        <Button onClick={onBack}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" onClick={onBack} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Usage Statistics</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportStatistics}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <div className="relative">
            <input
              type="file"
              id="import-stats"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept="application/json"
              onChange={handleImportStatistics}
            />
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
        </div>
      </header>
      
      <div className="flex-grow p-4 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="raw">Raw Data</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="flex-grow">
            <TabsContent value="overview" className="space-y-4 mt-0">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Artifacts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statistics.artifacts.totalCount}</div>
                    <p className="text-xs text-muted-foreground">
                      {statistics.artifacts.totalSize > 0 
                        ? `${(statistics.artifacts.totalSize / 1024).toFixed(2)} KB total size`
                        : 'No data size information'
                      }
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Folders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statistics.user.totalFolders}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {statistics.storage.percentUsed.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {(statistics.storage.used / 1024 / 1024).toFixed(2)} MB of {(statistics.storage.limit / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>User Summary</CardTitle>
                  <CardDescription>
                    Last activity: {new Date(statistics.user.lastActivity || '').toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <BarChart3 className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">User ID</p>
                      <p className="font-medium">{statistics.user.userId}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="artifacts" className="space-y-4 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Artifact Distribution by Language</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(statistics.artifacts.byLanguage).map(([language, count]) => (
                      <div key={language} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`h-3 w-3 rounded-full mr-2 bg-${language.toLowerCase()}`}></div>
                          <span>{language}</span>
                        </div>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="storage" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Storage Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    <div className="relative h-64 w-64">
                      <PieChart className="h-full w-full" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold">{statistics.storage.percentUsed}%</span>
                        <span className="text-xs text-muted-foreground">Used</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Used</span>
                      <span>{(statistics.storage.used / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Available</span>
                      <span>{((statistics.storage.limit - statistics.storage.used) / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Capacity</span>
                      <span>{(statistics.storage.limit / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="raw" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Raw Statistics Data</CardTitle>
                  <CardDescription>View and edit the raw statistics data</CardDescription>
                </CardHeader>
                <CardContent>
                  <StatisticsForm 
                    initialData={statistics}
                    onSave={(updatedStats) => setStatistics(updatedStats)}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activity" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Daily Activity</h3>
                      <div className="flex items-end">
                        {Object.entries(statistics.activity.daily).map(([date, count], index) => (
                          <div key={date} className="flex flex-col items-center mr-2">
                            <div className="h-[100px] flex items-end">
                              <div 
                                className="w-6 bg-primary rounded-t" 
                                style={{ height: `${count * 10}px` }}
                              ></div>
                            </div>
                            <span className="text-xs mt-1">{date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Weekly Activity</h3>
                      <div className="space-y-2">
                        {Object.entries(statistics.activity.weekly).map(([week, count]) => (
                          <div key={week} className="flex items-center">
                            <span className="text-sm w-20">{week}</span>
                            <div className="flex-grow h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary" 
                                style={{ width: `${(count / 10) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm ml-2">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
}
