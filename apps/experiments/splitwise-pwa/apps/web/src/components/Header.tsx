import { useAuth } from "@/state/useAuth";
import { useOutbox } from "@/state/useOutbox";
import { LogOut, User } from "lucide-react";
import { Button } from "./ui/Button";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";

export function Header() {
  const { user, setUser } = useAuth();
  const { pending } = useOutbox();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    if (pending > 0) {
      const confirm = window.confirm(
        "You have unsynced changes. Sign out anyway? (local unsynced changes will be lost)"
      );
      if (!confirm) return;
    }

    await api.auth.signOut();
    setUser(null);
    navigate("/");
  };

  if (!user) return null;

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">Splitwise</h1>
          <div className="flex items-center gap-2">
            {pending > 0 && (
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="text-sm">{user.name}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
