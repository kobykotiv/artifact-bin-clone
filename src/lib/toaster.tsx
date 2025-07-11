import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster 
      position="bottom-right"
      toastOptions={{
        duration: 3000,
        classNames: {
          toast: "group toast group flex w-full items-center gap-2 rounded-md border p-4 pr-6 shadow-lg",
          title: "text-sm font-semibold [&+div]:text-xs",
          description: "text-sm opacity-90",
          success: "bg-background text-foreground border-border [&>div>svg]:text-green-500",
          error: "bg-background text-foreground border-border [&>div>svg]:text-red-500",
          info: "bg-background text-foreground border-border [&>div>svg]:text-blue-500",
          warning: "bg-background text-foreground border-border [&>div>svg]:text-yellow-500",
          loading: "bg-background text-foreground border-border",
        },
      }}
    />
  );
}
