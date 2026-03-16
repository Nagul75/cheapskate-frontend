import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/authProvider";
import { authApi } from "@/api/auth";
import { AlertCircle, TrendingDown, PiggyBank, Target } from "lucide-react";
import axios from "axios";

const STATS = [
  { label: "Avg. monthly savings", value: "$1,240" },
  { label: "Budgets tracked",      value: "12"     },
  { label: "Transactions logged",  value: "340+"   },
];

const TICKS = [
  { icon: TrendingDown, text: "Track every transaction" },
  { icon: PiggyBank,    text: "Set and hit budget goals" },
  { icon: Target,       text: "Watch your net worth grow" },
];

export function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, setIsAuthenticated, setUser } = useAuth();
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [error, setError]         = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    navigate("/app", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await authApi.login({ email, password });
      const userData = await authApi.getMe();
      setUser(userData.user);
      setIsAuthenticated(true);
      navigate("/app", { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error ?? "Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background grid grid-cols-1 lg:grid-cols-2">

      {/* ── Left panel — brand ── */}
      <div className="hidden lg:flex flex-col justify-around border-r border-border bg-muted/30 px-12 py-18">

        {/* Middle — statement */}
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Personal finance
            </p>
            <h2 className="text-4xl font-bold tracking-tight leading-[1.1]">
              Your money.<br />
              Your rules.<br />
              <span className="text-primary">Your future.</span>
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              No subscriptions. No upsells. Just a clean, fast tool for people who take their finances seriously.
            </p>
          </div>

          {/* Feature ticks */}
          <div className="space-y-3">
            {TICKS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">{text}</span>
              </div>
            ))}
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-px bg-border rounded-lg overflow-hidden border border-border">
            {STATS.map(({ label, value }) => (
              <div key={label} className="bg-card px-4 py-3">
                <p className="font-mono text-lg font-semibold tracking-tight">{value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p className="text-[11px] text-muted-foreground">© 2026 Cheapskate · Free forever</p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex flex-col">

        <div className="flex flex-1 justify-center px-6 py-18 items-center mb-24">
          <div className="w-full max-w-sm space-y-6">

            {/* Heading */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Welcome back
              </p>
              <h1 className="text-3xl font-bold tracking-tight">Sign in</h1>
              <p className="text-sm text-muted-foreground mt-1.5">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
                >
                  Create one free
                </Link>
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="mt-1.5"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="mt-1.5"
                />
              </div>

              <Button type="submit" size="sm" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            {/* Divider + trust line */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] text-muted-foreground">free forever</span>
              <div className="h-px flex-1 bg-border" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}