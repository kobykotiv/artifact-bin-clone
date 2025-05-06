import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  statisticsSchema,
  Statistics,
  UserStats,
  ArtifactStats,
  StorageStats,
  ActivityStats
} from "@/lib/schemas/statisticsSchema";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface StatisticsFormProps {
  initialData: Statistics;
  onSave?: (data: Statistics) => void;
  readOnly?: boolean;
}

export function StatisticsForm({ initialData, onSave, readOnly = false }: StatisticsFormProps) {
  const form = useForm<Statistics>({
    resolver: zodResolver(statisticsSchema),
    defaultValues: initialData,
  });

  const [expanded, setExpanded] = useState<{
    user: boolean;
    artifacts: boolean;
    storage: boolean;
    activity: boolean;
  }>({
    user: false,
    artifacts: false,
    storage: false,
    activity: false,
  });

  const toggleSection = (section: keyof typeof expanded) => {
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSubmit = useCallback((data: Statistics) => {
    if (onSave) {
      try {
        onSave(data);
        toast.success("Statistics data updated");
      } catch (error) {
        console.error("Failed to update statistics:", error);
        toast.error("Failed to update statistics");
      }
    }
  }, [onSave]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* User Statistics Section */}
        <Card>
          <CardHeader 
            className="cursor-pointer" 
            onClick={() => toggleSection('user')}
          >
            <CardTitle className="flex items-center justify-between">
              User Statistics
              <Button type="button" variant="ghost" size="sm">
                {expanded.user ? 'Collapse' : 'Expand'}
              </Button>
            </CardTitle>
          </CardHeader>
          {expanded.user && (
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="user.userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User ID</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="user.totalArtifacts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Artifacts</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        readOnly={readOnly}
                        onChange={e => field.onChange(parseInt(e.target.value))} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="user.totalFolders"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Folders</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        readOnly={readOnly}
                        onChange={e => field.onChange(parseInt(e.target.value))} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="user.lastActivity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Activity</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          )}
        </Card>

        {/* Artifact Statistics Section */}
        <Card>
          <CardHeader 
            className="cursor-pointer" 
            onClick={() => toggleSection('artifacts')}
          >
            <CardTitle className="flex items-center justify-between">
              Artifact Statistics
              <Button type="button" variant="ghost" size="sm">
                {expanded.artifacts ? 'Collapse' : 'Expand'}
              </Button>
            </CardTitle>
          </CardHeader>
          {expanded.artifacts && (
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="artifacts.totalCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Count</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        readOnly={readOnly}
                        onChange={e => field.onChange(parseInt(e.target.value))} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="artifacts.averageSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Average Size (bytes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        readOnly={readOnly}
                        onChange={e => field.onChange(parseFloat(e.target.value))} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="artifacts.totalSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Size (bytes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        readOnly={readOnly}
                        onChange={e => field.onChange(parseFloat(e.target.value))} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          )}
        </Card>

        {/* Storage Statistics Section */}
        <Card>
          <CardHeader 
            className="cursor-pointer" 
            onClick={() => toggleSection('storage')}
          >
            <CardTitle className="flex items-center justify-between">
              Storage Statistics
              <Button type="button" variant="ghost" size="sm">
                {expanded.storage ? 'Collapse' : 'Expand'}
              </Button>
            </CardTitle>
          </CardHeader>
          {expanded.storage && (
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="storage.used"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Storage Used (bytes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        readOnly={readOnly}
                        onChange={e => field.onChange(parseFloat(e.target.value))} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="storage.limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Storage Limit (bytes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        readOnly={readOnly}
                        onChange={e => field.onChange(parseFloat(e.target.value))} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="storage.percentUsed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Percent Used</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        readOnly={readOnly}
                        onChange={e => field.onChange(parseFloat(e.target.value))} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          )}
        </Card>

        {!readOnly && (
          <div className="flex justify-end">
            <Button type="submit">Save Changes</Button>
          </div>
        )}
      </form>
    </Form>
  );
}
