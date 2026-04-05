import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import cors from "cors";
import authRouter from "./router/auth";
import spacesRouter from "./router/spaces";
import expensesRouter from "./router/expenses";
import settlementsRouter from "./router/settlements";
import balancesRouter from "./router/balances";
import fxRouter from "./router/fx";
import exportsRouter from "./router/exports";

export function makeApp() {
  const app = express();

  // Trust proxy to read headers correctly on Vercel/proxies
  app.set("trust proxy", 1);

  // Check environment
  const isProduction = process.env.NODE_ENV === "production";

  // CORS configuration
  const allowedOrigins = [
    ...(process.env.FRONTEND_URL?.split(",") || ["http://localhost:5173"]),
    "http://localhost:5173", // Always allow local dev
  ].filter(Boolean);
  
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }));

  app.use(express.json());
  app.use(cookieParser());
  app.use(session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  }));

  // Routes
  app.use("/api/auth", authRouter);
  app.use("/api/spaces", spacesRouter);
  app.use("/api/spaces", expensesRouter);
  app.use("/api/spaces", settlementsRouter);
  app.use("/api/spaces", balancesRouter);
  app.use("/api/fx", fxRouter);
  app.use("/api/spaces", exportsRouter);

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  return app;
}

// Run as standalone server if executed directly
// In CommonJS, use require.main to check if this is the entry point
const PORT = process.env.PORT || 3001;
const app = makeApp();
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
