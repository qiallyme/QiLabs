import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MemberChip } from "@/components/MemberChip";
import { Money } from "@/components/Money";
import { api } from "@/lib/api";
import { ArrowRight, CheckCircle } from "lucide-react";
import { ulid } from "ulid";

export function SettlePlan() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [space, setSpace] = useState<any>(null);
  const [plan, setPlan] = useState<any[]>([]);
  const [settled, setSettled] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadSpace();
      loadPlan();
    }
  }, [id]);

  const loadSpace = async () => {
    try {
      const data = await api.spaces.get(id!);
      setSpace(data);
    } catch (error) {
      console.error("Failed to load space", error);
    }
  };

  const loadPlan = async () => {
    try {
      const data: any = await api.balances.getSettlePlan(id!);
      setPlan(data);
    } catch (error) {
      console.error("Failed to load settle plan", error);
    }
  };

  const handleMarkPaid = async (index: number, transfer: any) => {
    setLoading(true);
    try {
      await api.settlements.create(id!, {
        fromUserId: transfer.from,
        toUserId: transfer.to,
        amountMinor: transfer.amountMinor,
        method: "cash",
        idempotencyKey: ulid(),
      });
      setSettled(new Set([...settled, index]));
    } catch (error) {
      alert("Failed to record settlement");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!space) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const allSettled = plan.length > 0 && settled.size === plan.length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Settle Plan for {space.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {plan.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  All settled up! No transfers needed.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => navigate(`/spaces/${id}`)}
                >
                  Back to Space
                </Button>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Minimal transfers to settle all balances:
                </p>
                {plan.map((transfer, index) => (
                  <Card
                    key={index}
                    className={
                      settled.has(index)
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200"
                        : ""
                    }
                  >
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <MemberChip
                            name={transfer.fromUser?.name || "Unknown"}
                            avatarUrl={transfer.fromUser?.avatarUrl}
                          />
                          <ArrowRight className="h-5 w-5 text-muted-foreground" />
                          <MemberChip
                            name={transfer.toUser?.name || "Unknown"}
                            avatarUrl={transfer.toUser?.avatarUrl}
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <Money
                            amountMinor={transfer.amountMinor}
                            currency={space.baseCurrency}
                          />
                          {settled.has(index) ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleMarkPaid(index, transfer)}
                              loading={loading}
                            >
                              Mark Paid
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {allSettled && (
                  <div className="text-center py-4">
                    <p className="text-green-600 font-medium mb-4">
                      ✓ All payments recorded! Everyone is settled up.
                    </p>
                    <Button onClick={() => navigate(`/spaces/${id}`)}>
                      Back to Space
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
