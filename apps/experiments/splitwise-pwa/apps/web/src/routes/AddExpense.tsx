import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { SplitEditor } from "@/components/SplitEditor";
import { api } from "@/lib/api";
import type { SplitMethod } from "@splitwise/types";

export function AddExpense() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [space, setSpace] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [payerId, setPayerId] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [splitMethod, setSplitMethod] = useState<SplitMethod>("equal");
  const [participants, setParticipants] = useState<string[]>([]);
  const [splits, setSplits] = useState<Record<string, number>>({});
  const [fxRate, setFxRate] = useState(1000000); // 1.0 in micros

  useEffect(() => {
    loadSpace();
  }, [id]);

  useEffect(() => {
    if (currency !== space?.baseCurrency && space) {
      loadFxRate();
    } else {
      setFxRate(1000000);
    }
  }, [currency, space]);

  const loadSpace = async () => {
    try {
      const data: any = await api.spaces.get(id!);
      setSpace(data);
      setCurrency(data.baseCurrency);
      
      // Default to all members as participants
      const memberIds = data.memberships.map((m: any) => m.userId);
      setParticipants(memberIds);
      
      // Default payer to first member
      if (memberIds.length > 0) {
        setPayerId(memberIds[0]);
      }
    } catch (error) {
      console.error("Failed to load space", error);
    }
  };

  const loadFxRate = async () => {
    try {
      const data: any = await api.fx.getRate(currency, space.baseCurrency);
      setFxRate(data.rateMicros);
    } catch (error) {
      console.error("Failed to load FX rate", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const amountMinor = Math.round(parseFloat(amount) * 100);
      
      const expenseData: any = {
        payerId,
        nativeAmountMinor: amountMinor,
        nativeCurrency: currency,
        fxRateMicrosToBase: fxRate,
        note,
        category,
        date,
        splitMethod,
        participants,
      };

      if (splitMethod === "exact") {
        expenseData.exactMinor = splits;
      } else if (splitMethod === "percent") {
        expenseData.percent = splits;
      } else if (splitMethod === "shares") {
        expenseData.shares = splits;
      }

      await api.expenses.create(id!, expenseData);
      navigate(`/spaces/${id}`);
    } catch (error) {
      alert("Failed to create expense");
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

  const memberOptions = space.memberships.map((m: any) => ({
    id: m.userId,
    name: m.user.name,
  }));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Add Expense to {space.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="payer">Paid by</Label>
                <Select
                  id="payer"
                  value={payerId}
                  onChange={(e) => setPayerId(e.target.value)}
                  required
                >
                  <option value="">Select payer</option>
                  {memberOptions.map((m: any) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    id="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="INR">INR</option>
                    <option value="IDR">IDR</option>
                    <option value="JPY">JPY</option>
                  </Select>
                </div>
              </div>

              {currency !== space.baseCurrency && (
                <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  FX rate locked: 1 {currency} = {(fxRate / 1000000).toFixed(4)} {space.baseCurrency}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="note">Description</Label>
                <Input
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Dinner at restaurant"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Food"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <SplitEditor
                totalMinor={Math.round(parseFloat(amount || "0") * 100)}
                participants={memberOptions.filter((m: any) =>
                  participants.includes(m.id)
                )}
                splitMethod={splitMethod}
                onSplitMethodChange={setSplitMethod}
                onSplitsChange={setSplits}
              />

              <div className="flex gap-2 pt-4 sticky bottom-0 bg-card p-4 -mx-6 -mb-6 border-t">
                <Button type="submit" className="flex-1" loading={loading}>
                  Save Expense
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/spaces/${id}`)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
