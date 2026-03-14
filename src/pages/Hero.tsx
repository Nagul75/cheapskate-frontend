import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TrendingDown,
  PieChart,
  Target,
  CreditCard,
  BarChart3,
  Zap,
} from "lucide-react";

import { useAuth } from "@/providers/authProvider";
import { Navigate } from "react-router-dom";

export function Hero() {
  const features = [
    {
      icon: TrendingDown,
      title: "Track Expenses",
      description:
        "Log all your transactions and categorize them instantly for better insights.",
    },
    {
      icon: PieChart,
      title: "Visual Analytics",
      description:
        "See your spending patterns with interactive charts and detailed breakdowns.",
    },
    {
      icon: Target,
      title: "Budget Goals",
      description:
        "Set budgets for each category and stay on top of your spending limits.",
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
        "Get a complete financial overview with income, expenses, and net balance.",
    },
    {
      icon: Zap,
      title: "Built for Speed",
      description:
        "Fast, responsive interface optimized for quick transaction entry.",
    },
  ];
  const {isAuthenticated} = useAuth();
  if(isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-pink-50/30 dark:to-pink-950/10">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <div className="text-center space-y-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              Free forever • No credit card required
            </div>
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight">
              Take Control of Your{" "}
              <span className="text-pink-600">Finances</span>
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Cheapskate helps you track expenses, manage budgets, and
              understand your spending habits.
              <span className="pl-1 font-semibold text-foreground">
                Because every dollar counts.
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register">
              <Button
                size="lg"
                className="w-full hover:cursor-pointer sm:w-auto px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Get Started Free
                <TrendingDown className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                variant="outline"
                className="w-full hover:cursor-pointer sm:w-auto px-8 py-3 text-lg border-2 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all duration-300"
              >
                Sign In
              </Button>
            </Link>
          </div>

          <div className="pt-8">
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Real-time Sync</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span>Smart Insights</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto px-4 sm:px-6 lg:px-8 py-20 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful tools to manage your money and reach your financial goals.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="group card-running-border">
                <Card className="card-inner h-48 border border-border hover:border-l-4 hover:border-l-chart-1 group-hover:shadow-lg transition-all duration-200 rounded-none hover:rounded-md">
                  <CardHeader>
                    <div className="w-12 h-12 bg-pink-600/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-pink-600/20 transition-colors duration-300">
                      <Icon className="w-6 h-6 text-pink-600 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <CardTitle className="group-hover:text-pink-600 transition-colors duration-300">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-linear-to-r from-pink-600/10 to-purple-600/10 rounded-lg border border-pink-600/20 p-12 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Ready to Master Your Money?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of users who are taking control of their finances
            with Cheapskate.
          </p>
          <Link to="/register">
            <Button size="lg" className="w-full hover:cursor-pointer sm:w-auto px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">Start Free Today</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 Cheapskate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
