import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {ThemeToggle} from "@/components/ui/theme-toggle"
import {Wallet} from "lucide-react";
export function PublicHeader() {
  return (
    <header className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-pink-600 rounded-md flex items-center justify-center">
                <Wallet size={20} className="text-white" />
            </div>
            <span className="text-xl font-mono font-medium tracking-tighter first:mt-0">Cheapskate</span>
          </Link>
          
          <div className="flex gap-4 items-center">
            <ThemeToggle />
            <Link to="/login">
              <Button variant="outline" className="hover:cursor-pointer">Login</Button>
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
