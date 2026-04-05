import { makeApp } from "../../api/src/index";

// Create the Express app
const app = makeApp();

// Export as Vercel serverless function
export default app;
