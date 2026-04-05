import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Money } from "@/components/Money";
import { MemberChip } from "@/components/MemberChip";
import { api } from "@/lib/api";
import { Plus, Download } from "lucide-react";

export function Space() {
  const { id } = useParams<{ id: string }>();
  const [space, setSpace] = useState<any>(null);
  const [balances, setBalances] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadSpace();
      loadBalances();
      loadExpenses();
    }
  }, [id]);

  const loadSpace = async () => {
    try {
      const data = await api.spaces.get(id!);
      setSpace(data);
    } catch (error) {
      console.error("Failed to load space", error);
    } finally {
      setLoading(false);
    }
  };

  const loadBalances = async () => {
    try {
      const data: any = await api.balances.get(id!);
      setBalances(data);
    } catch (error) {
      console.error("Failed to load balances", error);
    }
  };

  const loadExpenses = async () => {
    try {
      const data: any = await api.expenses.list(id!);
      setExpenses(data);
    } catch (error) {
      console.error("Failed to load expenses", error);
    }
  };

  const handleExport = () => {
    window.open(api.exports.downloadCSV(id!), "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Space not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <span>{space.icon}</span>
              <span>{space.name}</span>
            </h2>
            <p className="text-sm text-muted-foreground">
              Base currency: {space.baseCurrency}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" />
            </Button>
            <Link to={`/spaces/${id}/add-expense`}>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Expense
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Balances</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {balances.length === 0 ? (
                <p className="text-sm text-muted-foreground">No expenses yet</p>
              ) : (
                balances.map((balance: any) => (
                  <div
                    key={balance.userId}
                    className="flex items-center justify-between"
                  >
                    <MemberChip
                      name={balance.user?.name || "Unknown"}
                      avatarUrl={balance.user?.avatarUrl}
                    />
                    <Money
                      amountMinor={balance.netMinor}
                      currency={space.baseCurrency}
                      showSign
                    />
                  </div>
                ))
              )}
              {balances.length > 0 && (
                <Link to={`/spaces/${id}/settle`}>
                  <Button variant="outline" className="w-full mt-4">
                    Settle Up
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {expenses.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No expenses yet
                </p>
              ) : (
                expenses.slice(0, 10).map((expense: any) => {
                  const revision = expense.revisions?.[0];
                  return (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div>
                        <p className="font-medium">
                          {revision?.note || "Expense"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {revision?.date}
                        </p>
                      </div>
                      <Money
                        amountMinor={revision?.nativeAmountMinor || 0}
                        currency={revision?.nativeCurrency || space.baseCurrency}
                      />
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {space.memberships?.map((m: any) => (
                <MemberChip
                  key={m.id}
                  name={m.user.name}
                  avatarUrl={m.user.avatarUrl}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
