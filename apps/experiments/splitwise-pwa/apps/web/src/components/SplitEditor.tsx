import { useState, useEffect } from "react";
import { Label } from "./ui/Label";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import type { SplitMethod } from "@splitwise/types";

interface SplitEditorProps {
  totalMinor: number;
  participants: Array<{ id: string; name: string }>;
  splitMethod: SplitMethod;
  onSplitMethodChange: (method: SplitMethod) => void;
  onSplitsChange: (splits: Record<string, number>) => void;
}

export function SplitEditor({
  totalMinor,
  participants,
  splitMethod,
  onSplitMethodChange,
  onSplitsChange,
}: SplitEditorProps) {
  const [exactValues, setExactValues] = useState<Record<string, number>>({});
  const [percentValues, setPercentValues] = useState<Record<string, number>>({});
  const [shareValues, setShareValues] = useState<Record<string, number>>({});

  useEffect(() => {
    // Initialize with equal split
    if (participants.length > 0 && splitMethod === "equal" && totalMinor > 0) {
      const perPerson = totalMinor / participants.length;
      const splits = Object.fromEntries(
        participants.map((p) => [p.id, Math.floor(perPerson)])
      );
      onSplitsChange(splits);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalMinor, participants.length, splitMethod]);

  const handleExactChange = (userId: string, value: string) => {
    const minor = Math.round(parseFloat(value || "0") * 100);
    const newValues = { ...exactValues, [userId]: minor };
    setExactValues(newValues);
    onSplitsChange(newValues);
  };

  const handlePercentChange = (userId: string, value: string) => {
    const percent = parseFloat(value || "0");
    const newValues = { ...percentValues, [userId]: percent };
    setPercentValues(newValues);
    onSplitsChange(newValues);
  };

  const handleShareChange = (userId: string, value: string) => {
    const shares = parseInt(value || "0");
    const newValues = { ...shareValues, [userId]: shares };
    setShareValues(newValues);
    onSplitsChange(newValues);
  };

  const renderSplitInputs = () => {
    if (splitMethod === "equal") {
      const perPerson = (totalMinor / participants.length / 100).toFixed(2);
      return (
        <div className="text-sm text-muted-foreground">
          Each person owes: ${perPerson}
        </div>
      );
    }

    if (splitMethod === "exact") {
      return (
        <div className="space-y-3">
          {participants.map((p) => (
            <div key={p.id} className="flex items-center gap-3">
              <Label className="w-32">{p.name}</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={exactValues[p.id] ? (exactValues[p.id] / 100).toFixed(2) : ""}
                onChange={(e) => handleExactChange(p.id, e.target.value)}
              />
            </div>
          ))}
        </div>
      );
    }

    if (splitMethod === "percent") {
      const total = Object.values(percentValues).reduce((a, b) => a + b, 0);
      return (
        <div className="space-y-3">
          {participants.map((p) => (
            <div key={p.id} className="flex items-center gap-3">
              <Label className="w-32">{p.name}</Label>
              <Input
                type="number"
                step="1"
                placeholder="0"
                value={percentValues[p.id] || ""}
                onChange={(e) => handlePercentChange(p.id, e.target.value)}
              />
              <span className="text-sm">%</span>
            </div>
          ))}
          <div className="text-sm text-muted-foreground">Total: {total}%</div>
        </div>
      );
    }

    if (splitMethod === "shares") {
      const totalShares = Object.values(shareValues).reduce((a, b) => a + b, 0);
      return (
        <div className="space-y-3">
          {participants.map((p) => (
            <div key={p.id} className="flex items-center gap-3">
              <Label className="w-32">{p.name}</Label>
              <Input
                type="number"
                step="1"
                placeholder="1"
                value={shareValues[p.id] || ""}
                onChange={(e) => handleShareChange(p.id, e.target.value)}
              />
              <span className="text-sm">shares</span>
            </div>
          ))}
          <div className="text-sm text-muted-foreground">
            Total shares: {totalShares}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Split Method</Label>
        <Select
          value={splitMethod}
          onChange={(e) => onSplitMethodChange(e.target.value as SplitMethod)}
        >
          <option value="equal">Equal</option>
          <option value="exact">Exact Amounts</option>
          <option value="percent">Percentages</option>
          <option value="shares">Shares</option>
        </Select>
      </div>
      {renderSplitInputs()}
    </div>
  );
}
