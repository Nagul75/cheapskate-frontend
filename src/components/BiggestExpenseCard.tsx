import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CategorySummaryData } from "@/api/dashboard";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PiggyBank } from "lucide-react";

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

  const [biggest] = [...categoryData.breakdown].sort((a, b) => b.spent - a.spent);
  if (!biggest) return null;

  const iconKey = biggest.category?.icon ?? "";
  const pascalName = toPascalCase(iconKey);
  const DynamicIcon = (Icons as Record<string, unknown>)[pascalName] as LucideIcon | undefined;
  const Icon = DynamicIcon ?? PiggyBank;
  const categoryName = biggest.category?.name ?? "this category";

  return (
    <Card className="rounded-none h-full flex flex-col">
      <CardHeader className="pb-1">
        <CardTitle className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Biggest expense
        </CardTitle>
      </CardHeader>
      <CardContent className="-mt-8 flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <Icon className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
          Your biggest expense this month was
        </p>
        <p className="text-lg font-semibold mb-1">
          {categoryName}
        </p>
        <p className="text-xs text-muted-foreground">
          You spent <span className="font-mono">{fmt(biggest.spent)}</span> in this category.
        </p>
      </CardContent>
    </Card>
  );
}

