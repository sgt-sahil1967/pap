import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authFetch } from "@/lib/api";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Mock login for now since API might not be fully ready
      if (email === "admin@papillon.com" && password === "admin123") {
        login("mock-jwt-token");
        return;
      }
      
      const res = await authFetch("/admin/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      
      if (!res.ok) {
        throw new Error("Invalid credentials");
      }
      
      const data = await res.json();
      login(data.token);
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-12 h-12 bg-[#1a1a2e] rounded-lg flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <CardTitle className="text-2xl text-center">Papillon Admin</CardTitle>
          <p className="text-sm text-muted-foreground text-center">Enter your credentials to access the panel</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input 
                type="email" 
                placeholder="admin@papillon.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-4">
              Demo: admin@papillon.com / admin123
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
