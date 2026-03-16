import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { CategorySummaryData } from "@/api/dashboard";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PiggyBank } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CategorySpendingProps {
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

function getIcon(icon?: string | null): LucideIcon {
  if (!icon) return PiggyBank;
  const pascal = toPascalCase(icon);
  const DynamicIcon = (Icons as Record<string, unknown>)[pascal] as LucideIcon | undefined;
  return DynamicIcon ?? PiggyBank;
}

const PALETTE = [
  "#3b82f6", "#ec4899", "#8b5cf6", "#22c55e",
  "#eab308", "#f97316", "#6366f1", "#14b8a6",
  "#a855f7", "#ef4444", "#0ea5e9", "#84cc16",
];

export function CategorySpending({ categoryData, fmt }: CategorySpendingProps) {
  if (!categoryData.breakdown.length) return null;

  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  const pieData = categoryData.breakdown.map((b, i) => ({
    name: b.category?.name ?? "Uncategorized",
    value: b.spent,
    budget: b.budget,
    icon: b.category?.icon ?? null,
    color: PALETTE[i % PALETTE.length],
    idx: i,
  }));

  const totalSpent = pieData.reduce((s, d) => s + d.value, 0);
  const rowData = [...pieData].sort((a, b) => b.value - a.value);
  const activeItem = activeCategory !== null ? pieData[activeCategory] : null;

  return (
    <div className="rounded-none border border-border bg-card overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border shrink-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Spending by category
        </p>
      </div>

      {/* Body — fixed height, never grows */}
      <div className="flex flex-col md:flex-row" style={{ height: "280px" }}>

        {/* ── Donut — never shrinks ── */}
        <div className="flex items-center justify-center shrink-0 md:w-48" style={{ minWidth: "160px", padding: "16px" }}>
          <div className="relative" style={{ width: "148px", height: "148px", flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={46}
                  outerRadius={68}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  onMouseEnter={(_, i) => setActiveCategory(i)}
                  onMouseLeave={() => setActiveCategory(null)}
                  strokeWidth={0}
                >
                  {pieData.map((d, i) => (
                    <Cell
                      key={i}
                      fill={d.color}
                      opacity={activeCategory === null || activeCategory === i ? 1 : 0.25}
                      style={{ cursor: "pointer", transition: "opacity 0.15s" }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Centre label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {activeItem ? (
                <>
                  <span className="text-[10px] text-muted-foreground leading-tight text-center px-1 truncate max-w-[80px]">
                    {activeItem.name}
                  </span>
                  <span
                    className="text-base font-semibold font-mono leading-tight mt-0.5"
                    style={{ color: activeItem.budget > 0 && activeItem.value > activeItem.budget ? "#ef4444" : activeItem.color }}
                  >
                    {fmt(activeItem.value)}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {((activeItem.value / totalSpent) * 100).toFixed(0)}%
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[11px] text-muted-foreground">total</span>
                  <span className="text-md font-semibold font-mono leading-tight">{fmt(totalSpent)}</span>
                  <span className="text-[10px] text-muted-foreground">{pieData.length} categories</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="hidden md:block w-px bg-border shrink-0" />
        <div className="md:hidden h-px bg-border shrink-0" />

        {/* ── Rows — scrollable ── */}
        <div className="flex-1 flex flex-col gap-3 px-5 py-4 overflow-y-auto min-h-0 bg-muted/30">
          {rowData.map((d) => {
            const over = d.budget > 0 && d.value > d.budget;
            const progressValue = d.budget > 0 ? Math.min(100, Math.round((d.value / d.budget) * 100)) : 0;
            const Icon = getIcon(d.icon);
            const isActive = activeCategory === null || activeCategory === d.idx;

            return (
              <div
                key={`${d.name}-${d.idx}`}
                onMouseEnter={() => setActiveCategory(d.idx)}
                onMouseLeave={() => setActiveCategory(null)}
                className="cursor-default transition-opacity duration-150"
                style={{ opacity: isActive ? 1 : 0.35 }}
              >
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  {/* Icon + name */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                      style={{ backgroundColor: `${d.color}18` }}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: d.color }} />
                    </div>
                    <span className="text-sm font-medium truncate">{d.name}</span>
                  </div>

                  {/* Amounts */}
                  <div className="flex items-center gap-1.5 shrink-0 font-mono text-xs">
                    <span className={over ? "text-destructive font-medium" : "text-foreground"}>
                      {fmt(d.value)}
                    </span>
                    {d.budget > 0 && (
                      <span className="text-muted-foreground">/ {fmt(d.budget)}</span>
                    )}
                    {over && (
                      <span className="text-[10px] bg-destructive/10 border border-destructive/20 text-destructive px-1.5 py-0.5 rounded-sm font-semibold">
                        +{fmt(d.value - d.budget)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar — only if budgeted */}
                {d.budget > 0 && (
                  <div className="pl-9">
                    <Progress
                      value={progressValue}
                      className="h-1"
                      indicatorClassName={over ? "bg-destructive" : undefined}
                      indicatorStyle={!over ? { backgroundColor: d.color } : undefined}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}