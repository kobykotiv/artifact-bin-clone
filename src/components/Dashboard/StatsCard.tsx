import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArtifactData } from "@/lib/services/db";
import { BarChart4, FileText, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboard } from "./DashboardContext";

interface StatsCardProps {
  userArtifacts: ArtifactData[];
  onClickViewAll?: () => void;
}

export function StatsCard({ userArtifacts, onClickViewAll }: StatsCardProps) {
  const countByLanguage = userArtifacts.reduce((acc, artifact) => {
    const language = artifact.language || 'unknown';
    acc[language] = (acc[language] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const { setLayout } = useDashboard();

  const handleViewAllStatistics = () => {
    if (onClickViewAll) {
      onClickViewAll();
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>Usage Statistics</span>
          <Button 
            variant="link" 
            size="sm" 
            className="text-xs p-0 h-auto"
            onClick={handleViewAllStatistics}
          >
            View All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <BarChart4 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium">Total Artifacts</p>
            <p className="text-xl font-bold">{userArtifacts.length}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(countByLanguage)
            .filter(([language]) => language !== 'unknown')
            .slice(0, 4)
            .map(([language, count]) => (
              <div key={language} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <div className="truncate text-xs">{language}: {count}</div>
              </div>
            ))
          }
        </div>
      </CardContent>
    </Card>
  );
}
