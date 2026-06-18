import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL ?? "admin@papillon.com";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? "admin123";

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
    await new Promise((r) => setTimeout(r, 300));
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      login("local-admin-token");
    } else {
      setError("Invalid email or password.");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-12 h-12 bg-[#930497] rounded-lg flex items-center justify-center mb-4">
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
              {isLoading ? "Signing in…" : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
