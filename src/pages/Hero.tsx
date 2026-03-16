import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  TrendingDown,
  PieChart,
  Target,
  CreditCard,
  BarChart3,
  Zap,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/providers/authProvider";
import { Navigate } from "react-router-dom";

const FEATURES = [
  {
    icon: TrendingDown,
    title: "Track Expenses",
    description:
      "Log transactions and categorize them instantly for better insights.",
  },
  {
    icon: PieChart,
    title: "Visual Analytics",
    description:
      "See spending patterns with charts and detailed breakdowns.",
  },
  {
    icon: Target,
    title: "Budget Goals",
    description:
      "Set budgets per category and stay on top of your spending limits.",
  },
  {
    icon: CreditCard,
    title: "Manage Accounts",
    description:
      "Track multiple accounts and watch your net worth grow over time.",
  },
  {
    icon: BarChart3,
    title: "Smart Dashboard",
    description:
      "Complete financial overview with income, expenses, and net balance.",
  },
  {
    icon: Zap,
    title: "Built for Speed",
    description:
      "Fast, responsive interface optimized for quick transaction entry.",
  },
];

export function Hero() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/app" replace />;

  return (
    <div className="min-h-screen bg-background text-foreground pt-14">
      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — copy */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-sm border border-primary/30 bg-primary/5 px-3 py-1">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">
                Free forever · No credit card
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.05]">
                Every dollar.
                <br />
                <span className="text-primary">Accounted for.</span>
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed max-w-md">
                Cheapskate is a no-nonsense personal finance tracker. Log
                transactions, set budgets, and watch your net worth — without
                the noise.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto gap-2">
                  Start tracking free
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Sign in
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-2">
              {[
                { dot: "bg-green-500", label: "Secure & private" },
                { dot: "bg-blue-500", label: "Real-time sync" },
                { dot: "bg-primary", label: "Multi-currency" },
              ].map(({ dot, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — decorative statement card */}
          <div className="hidden lg:block">
            <div className="rounded-sm border border-border bg-card overflow-hidden">
              {/* Card header */}
              <div className="bg-muted/40 border-b border-border px-5 py-3 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Monthly Summary
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  March 2026
                </span>
              </div>

              {/* Big net figure */}
              <div className="px-5 py-6 border-b border-border">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-2">
                  Net Balance
                </p>
                <p className="font-mono text-5xl font-semibold tracking-tight text-green-600 dark:text-green-400">
                  +$2,418.50
                </p>
              </div>

              {/* Income / Expenses row */}
              <div className="grid grid-cols-2 divide-x divide-border border-b border-border">
                <div className="px-5 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-1.5">
                    Income
                  </p>
                  <p className="font-mono text-xl font-semibold">$6,200.00</p>
                </div>
                <div className="px-5 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-1.5">
                    Expenses
                  </p>
                  <p className="font-mono text-xl font-semibold text-destructive">
                    $3,781.50
                  </p>
                </div>
              </div>

              {/* Budget progress rows */}
              <div className="px-5 py-4 space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2">
                  Budget Status
                </p>
                {[
                  { label: "Groceries", pct: 72, color: "bg-green-500" },
                  { label: "Transport", pct: 88, color: "bg-amber-500" },
                  { label: "Dining Out", pct: 110, color: "bg-destructive" },
                ].map(({ label, pct, color }) => (
                  <div key={label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-muted-foreground">
                        {label}
                      </span>
                      <span
                        className={`text-[11px] font-mono font-medium ${pct > 100 ? "text-destructive" : "text-foreground"}`}
                      >
                        {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-border overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Card footer */}
              <div className="bg-muted/40 border-t border-border px-5 py-2.5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-[11px] text-muted-foreground">
                  3 accounts synced · 47 transactions this month
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="border-t border-border" />
      </div>

      {/* ── Features ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight max-w-sm">
            Everything you need.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-sm overflow-hidden border border-border">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="group bg-card px-6 py-6 flex flex-col gap-4 hover:bg-muted/40 transition-colors duration-150"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-primary/20 bg-primary/10 transition-colors group-hover:bg-primary/15">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <p className="text-sm font-semibold">{feature.title}</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="border-t border-border" />
      </div>

      {/* ── CTA ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="rounded-sm border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-center gap-8 px-8 py-10">
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Ready to master your money?
              </h2>
              <p className="text-sm text-muted-foreground max-w-md">
                Join users taking control of their finances with Cheapskate.
                Free, fast, and built to last.
              </p>
            </div>
            <Link to="/register">
              <Button
                size="lg"
                className="w-full lg:w-auto gap-2 whitespace-nowrap"
              >
                Start free today
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="border-t border-border bg-muted/40 px-8 py-3 flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-green-500 shrink-0" />
            <span className="text-[11px] text-muted-foreground">
              No credit card required · Cancel anytime · Your data stays yours
            </span>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <span className="font-mono text-xs font-semibold tracking-tighter text-muted-foreground">
            Cheapskate
          </span>
          <div className="flex items-center gap-4">
            <p className="text-xs text-muted-foreground hidden sm:block">
              Built by{" "}
              <span className="font-medium text-foreground">Nagul</span>
            </p>
            <div className="h-3 w-px bg-border" />
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/Nagul75"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Github
              </a>
              <div className="h-3 w-px bg-border" />
              <a
                href="https://linkedin.com/in/nagul25"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
