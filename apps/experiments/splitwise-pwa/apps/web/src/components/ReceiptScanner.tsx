import { useState } from "react";
import { Button } from "./ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Input } from "./ui/Input";
import { Camera, Trash2 } from "lucide-react";

interface ReceiptItem {
  id: string;
  description: string;
  amount: number;
  assignedTo: string[];
}

interface ReceiptScannerProps {
  members: Array<{ id: string; name: string }>;
  onItemsExtracted: (items: ReceiptItem[]) => void;
}

export function ReceiptScanner({ members: _members, onItemsExtracted }: ReceiptScannerProps) {
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [scanning, setScanning] = useState(false);

  // OCR stub - in production, use Tesseract.js
  const handleScanReceipt = async (_file: File) => {
    setScanning(true);
    
    // Mock OCR processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Mock extracted items
    const mockItems: ReceiptItem[] = [
      {
        id: "1",
        description: "Coffee",
        amount: 450,
        assignedTo: [],
      },
      {
        id: "2",
        description: "Sandwich",
        amount: 850,
        assignedTo: [],
      },
      {
        id: "3",
        description: "Water",
        amount: 200,
        assignedTo: [],
      },
    ];
    
    setItems(mockItems);
    setScanning(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleScanReceipt(file);
    }
  };

  const handleItemChange = (id: string, field: string, value: any) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleApply = () => {
    onItemsExtracted(items);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scan Receipt (OCR)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="receipt-upload">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
              <Camera className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {scanning ? "Scanning..." : "Click to upload receipt image"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                (OCR stub - mock data for demo)
              </p>
            </div>
            <input
              id="receipt-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={scanning}
            />
          </label>
        </div>

        {items.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Extracted Items:</p>
            {items.map((item) => (
              <Card key={item.id} className="p-3">
                <div className="flex gap-3">
                  <div className="flex-1 space-y-2">
                    <Input
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(item.id, "description", e.target.value)
                      }
                      placeholder="Item description"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      value={(item.amount / 100).toFixed(2)}
                      onChange={(e) =>
                        handleItemChange(
                          item.id,
                          "amount",
                          Math.round(parseFloat(e.target.value) * 100)
                        )
                      }
                      placeholder="Amount"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
            <Button onClick={handleApply} className="w-full">
              Apply Items to Split
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


