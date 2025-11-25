import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function AuthReceiver() {
  const [, setLocation] = useLocation();
  const { login } = useAuth(); // We might need a way to set user directly without login, but let's see.

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userStr = params.get("user");

    if (token) {
      localStorage.setItem("authToken", token);
      localStorage.setItem("token", token);

      if (userStr) {
        try {
          const user = JSON.parse(decodeURIComponent(userStr));
          localStorage.setItem("user", JSON.stringify(user));
        } catch (e) {
          console.error("Failed to parse user data", e);
        }
      }

      // Force a reload or redirect to dashboard to pick up the new token
      window.location.href = "/";
    } else {
      // No token, redirect to login
      setLocation("/login");
    }
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Authenticating...</p>
      </div>
    </div>
  );
}
