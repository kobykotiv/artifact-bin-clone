import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { type ArtifactData } from '@/lib/services/db';

interface StatsCardProps {
  userArtifacts: ArtifactData[];
}

export function StatsCard({ userArtifacts }: StatsCardProps) {
  // Calculate statistics
  const languageCounts: Record<string, number> = {};
  let totalArtifactsSize = 0;
  
  userArtifacts.forEach(artifact => {
    // Count languages
    const lang = artifact.language || 'unknown';
    languageCounts[lang] = (languageCounts[lang] || 0) + 1;
    
    // Calculate total size (approximation)
    totalArtifactsSize += (artifact.content?.length || 0);
  });
  
  // Sort languages by count
  const sortedLanguages = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  // Calculate max count for relative bar sizing
  const maxCount = sortedLanguages.length > 0 ? sortedLanguages[0][1] : 0;
  
  // Calculate recent activity
  const recentActivity = userArtifacts
    .filter(a => new Date(a.updatedAt).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000))
    .length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="mr-2 h-5 w-5" />
          Dashboard Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-muted rounded-lg p-4">
            <p className="text-muted-foreground text-sm">Total Artifacts</p>
            <p className="text-2xl font-bold">{userArtifacts.length}</p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-muted-foreground text-sm">Total Size</p>
            <p className="text-2xl font-bold">{Math.round(totalArtifactsSize / 1024)} KB</p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-muted-foreground text-sm">Recent Activity</p>
            <p className="text-2xl font-bold">
              {recentActivity} <span className="text-sm font-normal text-muted-foreground">last 7d</span>
            </p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-muted-foreground text-sm">Languages</p>
            <p className="text-2xl font-bold">
              {Object.keys(languageCounts).length}
            </p>
          </div>
        </div>

        {/* Language Distribution Visualization */}
        {sortedLanguages.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Language Distribution</h3>
            <div className="space-y-2">
              {sortedLanguages.map(([lang, count]) => (
                <div key={lang} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{lang}</span>
                    <span>{count} ({Math.round(count / userArtifacts.length * 100)}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${Math.round(count / maxCount * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
