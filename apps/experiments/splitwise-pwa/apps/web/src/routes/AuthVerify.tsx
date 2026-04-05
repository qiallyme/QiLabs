import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export function AuthVerify() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      // Build the API verify URL
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
      // Remove trailing /api if present, then add the full path
      const baseUrl = apiUrl.replace(/\/api\/?$/, '');
      const verifyUrl = `${baseUrl}/api/auth/magic/verify?token=${token}`;
      
      // Redirect to API endpoint which will set the cookie and redirect back
      window.location.href = verifyUrl;
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Verifying your login...</p>
      </div>
    </div>
  );
}
