import React, { useRef, type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export function APITester() {
  const responseInputRef = useRef<HTMLTextAreaElement>(null);
  const [activeTab, setActiveTab] = useState<string>("test");
  const [apiVersion, setApiVersion] = useState<string>("v1");
  
  const testEndpoint = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const endpoint = formData.get("endpoint") as string;
      const url = new URL(endpoint, location.href);
      
      // Add API version to headers
      const method = formData.get("method") as string;
      const headers = new Headers({
        'Accept-Version': apiVersion,
        'Content-Type': 'application/json'
      });
      
      const res = await fetch(url, { 
        method, 
        headers
      });

      const data = await res.json();
      responseInputRef.current!.value = JSON.stringify(data, null, 2);
    } catch (error) {
      responseInputRef.current!.value = String(error);
    }
  };

  return (
    <div className="mt-8 mx-auto w-full max-w-2xl text-left flex flex-col gap-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="test">Test Endpoint</TabsTrigger>
          <TabsTrigger value="version">Version Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="test">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium">Test API Endpoint</h2>
            <Badge variant="outline">API Version: {apiVersion}</Badge>
          </div>
          
          <form
            onSubmit={testEndpoint}
            className="flex items-center gap-2 bg-card p-3 rounded-xl font-mono border border-input w-full"
          >
            <Select name="method" defaultValue="GET">
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="text"
              name="endpoint"
              defaultValue="/api/hello"
              className={cn(
                "flex-1 font-mono",
                "bg-transparent border-0 shadow-none",
                "focus-visible:ring-0 focus-visible:ring-offset-0"
              )}
              placeholder="/api/hello"
            />

            <Button type="submit" variant="secondary">
              Send
            </Button>
          </form>

          <textarea
            ref={responseInputRef}
            readOnly
            placeholder="Response will appear here..."
            className={cn(
              "w-full min-h-[140px] bg-card mt-4",
              "border border-input rounded-xl p-3",
              "font-mono resize-y",
              "placeholder:text-muted-foreground"
            )}
          />
        </TabsContent>
        
        <TabsContent value="version">
          <div className="space-y-4">
            <h2 className="font-medium">API Version Control</h2>
            <div className="flex items-center gap-2">
              <p className="text-sm">Select API Version:</p>
              <Select value={apiVersion} onValueChange={setApiVersion}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Version" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="v1">v1</SelectItem>
                  <SelectItem value="v2">v2</SelectItem>
                  <SelectItem value="latest">Latest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="border rounded-lg p-4 bg-card">
              <h3 className="font-medium mb-2">Version Information</h3>
              <div className="text-sm space-y-1">
                <p><strong>v1:</strong> Initial API release</p>
                <p><strong>v2:</strong> Enhanced with artifact versioning support</p>
                <p><strong>latest:</strong> Most recent API features</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
