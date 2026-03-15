import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Wallet } from "lucide-react";
export function PublicHeader() {
  return (
    <header className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 border border-primary/20 transition-colors group-hover:bg-primary/15">
            <Wallet className="h-4 w-4 text-primary" />
          </div>
          <span className="font-mono font-semibold tracking-tighter text-lg leading-none">
            Cheapskate
          </span>
        </Link>

          <div className="flex gap-4 items-center">
            <ThemeToggle />
            <Link to="/login">
              <Button variant="outline" className="hover:cursor-pointer">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button className="hover:cursor-pointer">Sign Up</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
