import type { CategorySummaryData } from "@/api/dashboard";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PiggyBank, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface BiggestExpenseCardProps {
  categoryData: CategorySummaryData;
  fmt: (n: number) => string;
}

function toPascalCase(name: string): string {
  return name
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

export function BiggestExpenseCard({ categoryData, fmt }: BiggestExpenseCardProps) {
  if (!categoryData.breakdown.length) return null;

  const sorted = [...categoryData.breakdown].sort((a, b) => b.spent - a.spent);
  const [biggest] = sorted;
  if (!biggest) return null;

  const iconKey = biggest.category?.icon ?? "";
  const pascalName = toPascalCase(iconKey);
  const DynamicIcon = (Icons as Record<string, unknown>)[pascalName] as LucideIcon | undefined;
  const Icon = DynamicIcon ?? PiggyBank;
  const categoryName = biggest.category?.name ?? "Uncategorized";

  const totalSpent = categoryData.breakdown.reduce((s, b) => s + b.spent, 0);
  const pct = totalSpent > 0 ? Math.round((biggest.spent / totalSpent) * 100) : 0;

  // Top 3 for the mini breakdown
  const top3 = sorted.slice(0, 3);
  const maxSpent = top3[0]?.spent ?? 1;

  return (
    <div className="h-full flex flex-col rounded-none border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-border">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Biggest expense
        </p>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col sm:flex-row">

        {/* Left — spotlight */}
        <div className="flex flex-col items-center justify-center text-center px-6 py-6 sm:flex-1 sm:border-r border-border">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 mb-4">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <p className="text-xl font-bold tracking-tight">{categoryName}</p>
          <p className="font-mono text-2xl font-semibold mt-1">{fmt(biggest.spent)}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <TrendingUp className="h-3 w-3 text-destructive" />
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{pct}%</span> of total spending
            </p>
          </div>
        </div>

        {/* Right — top 3 breakdown */}
        <div className="flex flex-col justify-center px-5 py-5 sm:w-48 bg-muted/40 gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-1">
            Top categories
          </p>
          {top3.map((item) => {
            const barPct = Math.round((item.spent / maxSpent) * 100);
            const itemIconKey = item.category?.icon ?? "";
            const ItemIcon = ((Icons as Record<string, unknown>)[toPascalCase(itemIconKey)] as LucideIcon | undefined) ?? PiggyBank;
            const isBiggest = item === biggest;
            return (
              <div key={item.category?.id ?? item.category?.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <ItemIcon className={cn("h-3 w-3 shrink-0", isBiggest ? "text-primary" : "text-muted-foreground")} />
                    <span className={cn("text-xs truncate", isBiggest ? "text-foreground font-semibold" : "text-muted-foreground")}>
                      {item.category?.name ?? "Other"}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-medium ml-2 shrink-0">{fmt(item.spent)}</span>
                </div>
                <div className="h-1 rounded-full bg-border overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", isBiggest ? "bg-primary" : "bg-muted-foreground/30")}
                    style={{ width: `${barPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}