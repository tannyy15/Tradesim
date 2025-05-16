import { Link } from "react-router-dom";
import { ThemeToggle } from "./theme-toggle";
import { LineChart, BarChart3, Settings } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <LineChart className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              GoQuant Trade Simulator
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="/analytics"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Analytics
            </Link>
            <Link
              href="/settings"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Settings
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="hidden md:flex">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
