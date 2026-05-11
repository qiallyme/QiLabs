import { AppErrorBoundary } from "@/components/auth";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Card, CardContent } from "@repo/ui";
import { AlertCircle } from "lucide-react";


// Only queryClient in context - needed for beforeLoad prefetching.
// Auth client is a singleton (no hook equivalent in Better Auth).
export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: Root,
  notFoundComponent: NotFound,
});


export function Root() {
  return (
    <AppErrorBoundary>
      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </AppErrorBoundary>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            Did you forget to add the page to the router?
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
