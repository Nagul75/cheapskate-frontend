import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/authProvider";
import { authApi } from "@/api/auth";
import { AlertCircle } from "lucide-react";
import axios from "axios";

export function Register() {
  const navigate = useNavigate();
  const { isAuthenticated} = useAuth();
  const [name, setName]                       = useState("");
  const [email, setEmail]                     = useState("");
  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError]                     = useState("");
  const [isLoading, setIsLoading]             = useState(false);

  if (isAuthenticated) {
    navigate("/app", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.register({ name, email, password });
      navigate("/login", { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error ?? "Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background grid grid-cols-1 lg:grid-cols-2">

      {/* ── Left panel — brand ── */}
      <div className="hidden lg:flex flex-col justify-around border-r border-border bg-muted/30 px-10 py-8">

        <div className="space-y-7">
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Get started
            </p>
            <h2 className="text-3xl font-bold tracking-tight leading-[1.1]">
              Start free.<br />
              Stay in control.<br />
              <span className="text-primary">Forever.</span>
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Create your account in seconds and start building a clear picture of your finances today.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-0 border border-border rounded-lg overflow-hidden">
            {[
              { step: "01", title: "Create your account",    desc: "Takes under a minute, no card needed." },
              { step: "02", title: "Add your accounts",      desc: "Checking, savings, credit — all in one place." },
              { step: "03", title: "Start tracking",         desc: "Log transactions and set your first budget." },
            ].map(({ step, title, desc }, i, arr) => (
              <div
                key={step}
                className={`flex items-start gap-4 px-5 py-3 bg-card${i < arr.length - 1 ? " border-b border-border" : ""}`}
              >
                <span className="font-mono text-xs font-semibold text-primary shrink-0 mt-0.5">{step}</span>
                <div>
                  <p className="text-sm font-semibold leading-tight">{title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground">© 2026 Cheapskate · No credit card required</p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex flex-col">

        <div className="flex flex-1 justify-center px-6 py-18">
          <div className="w-full max-w-sm space-y-6">

            {/* Heading */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-1">
                Create account
              </p>
              <h1 className="text-3xl font-bold tracking-tight">Sign up free</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {error && (
                <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="name" className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Full Name
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  className="mt-1.5"
                />
              </div>

              <div>
                <label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="password" className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <label htmlFor="confirm-password" className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Confirm
                  </label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="mt-1.5"
                  />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground -mt-1">Minimum 8 characters.</p>

              <Button type="submit" size="sm" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                    Creating account…
                  </span>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>

            <p className="text-center text-[11px] text-muted-foreground">
              No credit card required · Your data stays yours
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}