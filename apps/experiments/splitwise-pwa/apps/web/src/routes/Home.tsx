import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { api } from "@/lib/api";
import { Plus, Users } from "lucide-react";
import type { Space } from "@splitwise/types";

export function Home() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newSpace, setNewSpace] = useState({
    name: "",
    baseCurrency: "USD",
    icon: "💰",
  });

  useEffect(() => {
    loadSpaces();
  }, []);

  const loadSpaces = async () => {
    try {
      const data: any = await api.spaces.list();
      setSpaces(data);
    } catch (error) {
      console.error("Failed to load spaces", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.spaces.create(newSpace);
      setShowCreate(false);
      setNewSpace({ name: "", baseCurrency: "USD", icon: "💰" });
      loadSpaces();
    } catch (error) {
      alert("Failed to create space");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Your Spaces</h2>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Space
          </Button>
        </div>

        {showCreate && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Space</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateSpace} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newSpace.name}
                    onChange={(e) =>
                      setNewSpace({ ...newSpace, name: e.target.value })
                    }
                    placeholder="Weekend Trip"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Base Currency</Label>
                  <Select
                    id="currency"
                    value={newSpace.baseCurrency}
                    onChange={(e) =>
                      setNewSpace({ ...newSpace, baseCurrency: e.target.value })
                    }
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="INR">INR</option>
                    <option value="IDR">IDR</option>
                    <option value="JPY">JPY</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon (emoji)</Label>
                  <Input
                    id="icon"
                    value={newSpace.icon}
                    onChange={(e) =>
                      setNewSpace({ ...newSpace, icon: e.target.value })
                    }
                    maxLength={2}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Create</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreate(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {spaces.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No spaces yet. Create one to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {spaces.map((space: any) => (
              <Link key={space.id} to={`/spaces/${space.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>{space.icon}</span>
                      <span>{space.name}</span>
                    </CardTitle>
                    <CardDescription>
                      Base: {space.baseCurrency}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{space.memberships?.length || 0} members</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
