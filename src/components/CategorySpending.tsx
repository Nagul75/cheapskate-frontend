import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export function CategorySpending({ categoryData, fmt }: CategorySpendingProps) {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  const PALETTE = [
    "#3b82f6", // blue-500
    "#ec4899", // pink-500
    "#8b5cf6", // violet-500
    "#22c55e", // green-500
    "#eab308", // yellow-500
    "#f97316", // orange-500
    "#6366f1", // indigo-500
    "#14b8a6", // teal-500
    "#a855f7", // purple-500
    "#ef4444", // red-500
    "#0ea5e9", // sky-500
    "#84cc16", // lime-500
  ];

  const pieData = categoryData.breakdown.map((b, i) => ({
    name: b.category?.name ?? "Uncategorized",
    value: b.spent,
    budget: b.budget,
    icon: b.category?.icon ?? null,
    color: PALETTE[i % PALETTE.length],
    idx: i,
  }));
  const totalSpent = pieData.reduce((s, d) => s + d.value, 0);
  const rowData = [...pieData].sort((a, b) => {
    const aHasBudget = a.budget > 0 ? 1 : 0;
    const bHasBudget = b.budget > 0 ? 1 : 0;
    return aHasBudget - bHasBudget; // budgeted categories last
  });

  return (
    <Card className="rounded-none h-full">
      <CardHeader>
        <CardTitle className="text-muted-foreground">Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center">
          
          {/* donut */}
          <div className="relative shrink-0 w-full md:w-auto flex justify-center md:block">
            <ResponsiveContainer width={190} height={190}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={86}
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
                      opacity={activeCategory === null || activeCategory === i ? 1 : 0.3}
                      style={{ cursor: "pointer", transition: "opacity 0.2s" }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {activeCategory !== null ? (
                (() => {
                  const d = pieData[activeCategory];
                  const over = d.budget > 0 && d.value > d.budget;
                  return (
                    <>
                      <div className="text-[10px] text-gray-400 font-mono">{d.name}</div>
                      <div
                        className={`text-base font-bold mt-0.5 ${over ? 'text-red-500' : ''}`}
                        style={!over ? { color: d.color } : undefined}
                      >
                        {fmt(d.value)}
                      </div>
                      <div className="text-[11px] text-gray-500 font-mono">
                        {((d.value / totalSpent) * 100).toFixed(0)}%
                      </div>
                    </>
                  );
                })()
              ) : (
                <>
                  <div className="text-[11px] text-muted-foreground font-mono">categories</div>
                  <div className="text-2xl font-bold text-muted-foreground font-sans">{pieData.length}</div>
                </>
              )}
            </div>
          </div>

          {/* rows */}
          <div className="flex-1 flex flex-col gap-3.5 ml-0 md:ml-10">
            {rowData.map((d) => {
              const over = d.value > d.budget && d.budget > 0;
              const atOrOver = d.budget > 0 && d.value >= d.budget;
              const Icon = getIcon(d.icon);
              const progressValue =
                d.budget > 0 ? Math.min(100, Math.round((d.value / d.budget) * 100)) : 0;
              return (
                <div
                  key={`${d.name}-${d.idx}`}
                  onMouseEnter={() => setActiveCategory(d.idx)}
                  onMouseLeave={() => setActiveCategory(null)}
                  className={`cursor-default transition-opacity duration-200 ${activeCategory === null || activeCategory === d.idx ? 'opacity-100' : 'opacity-50'}`}
                >
                  <div className="flex justify-between mb-1.5 items-center">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${d.color}1a` }} // ~10% opacity
                      >
                        <Icon className="w-4 h-4" style={{ color: d.color }} />
                      </div>
                      <span className={`text-sm font-sans transition-colors duration-200 ${activeCategory === d.idx ? 'text-foreground' : 'text-foreground/60'}`}>
                        {d.name}
                      </span>
                    </div>
                    <div className="font-mono text-xs flex gap-1.5 items-center">
                      <span className={over ? 'text-red-500' : 'text-foreground/60'}>{fmt(d.value)}</span>
                      {d.budget > 0 && <span className="text-foreground/60">/ {fmt(d.budget)}</span>}
                      {over && (
                        <span className="hidden md:inline-flex text-[10px] bg-red-100 text-red-600 dark:bg-red-700 dark:text-red-100 px-1.5 py-0.5 rounded font-mono">
                          +{fmt(d.value - d.budget)}
                        </span>
                      )}
                    </div>
                  </div>

                  {d.budget > 0 && (
                    <div className="pl-10">
                      <Progress
                        value={progressValue}
                        className="h-1.5"
                        indicatorClassName={atOrOver ? "bg-red-600/80" : undefined}
                        indicatorStyle={!atOrOver ? { backgroundColor: d.color } : undefined}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}