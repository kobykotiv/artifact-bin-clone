import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { saasStrategies, type SaaSStrategy } from '@/lib/saasStrategies';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function SaaSStrategies() {
  const [activeCategory, setActiveCategory] = useState<SaaSStrategy['category']>('acquisition');
  
  const filteredStrategies = saasStrategies.filter(strategy => 
    strategy.category === activeCategory
  );

  return (
    <div className="space-y-4">
      <Tabs defaultValue="acquisition" onValueChange={(value) => setActiveCategory(value as SaaSStrategy['category'])}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="monetization">Monetization</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeCategory}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredStrategies.map((strategy, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{strategy.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-3">{strategy.description}</p>
                  <Badge className="mt-2">{strategy.implementation}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
