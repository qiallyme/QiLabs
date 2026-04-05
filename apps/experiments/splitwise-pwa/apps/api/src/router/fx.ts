import { Router } from "express";

const router = Router();

// Stub FX rates - in production, use real API
const STUB_RATES: Record<string, Record<string, number>> = {
  USD: { USD: 1, EUR: 0.92, INR: 83.0, IDR: 15600, JPY: 148 },
  EUR: { USD: 1.09, EUR: 1, INR: 90.2, IDR: 16956, JPY: 161 },
  INR: { USD: 0.012, EUR: 0.011, INR: 1, IDR: 188, JPY: 1.78 },
  IDR: { USD: 0.000064, EUR: 0.000059, INR: 0.0053, IDR: 1, JPY: 0.0095 },
  JPY: { USD: 0.0068, EUR: 0.0062, INR: 0.56, IDR: 105, JPY: 1 },
};

router.get("/latest", (req, res) => {
  const base = (req.query.base as string) || "USD";
  const to = (req.query.to as string) || "USD";
  
  const rate = STUB_RATES[base]?.[to] || 1;
  const rateMicros = Math.round(rate * 1_000_000);
  
  res.json({
    base,
    to,
    rate,
    rateMicros,
    timestamp: new Date().toISOString(),
  });
});

export default router;
