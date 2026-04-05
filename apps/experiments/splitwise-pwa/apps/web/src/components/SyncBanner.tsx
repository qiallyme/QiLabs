import { useOutbox } from "@/state/useOutbox";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./ui/Button";

export function SyncBanner() {
  const { pending, errors } = useOutbox();

  if (pending === 0 && errors === 0) return null;

  const handleRetry = () => {
    // Trigger sync retry
    window.location.reload();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100 p-3 flex items-center justify-between z-50 shadow-lg">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        <span className="text-sm font-medium">
          {pending > 0
            ? `${pending} unsynced change${pending > 1 ? "s" : ""}`
            : `Sync errors detected`}
        </span>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRetry}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    </div>
  );
}
