"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Leaf, LogOut } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        router.push("/sign-in");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white text-black dark:bg-slate-950 dark:text-white shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tight"
        >
          🌿 <span>Plant Inventory</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-1 text-sm font-medium text-black/60 transition-colors hover:text-black dark:text-white/80 dark:hover:text-white"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>

          <Link
            href="/plants"
            className="flex items-center gap-1 text-sm font-medium text-black/60 transition-colors hover:text-black dark:text-white/80 dark:hover:text-white"
          >
            <Leaf className="h-4 w-4" />
            Plants
          </Link>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          <ModeToggle />

          <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            variant="destructive"
            size="sm"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>
        </div>

      </div>
    </header>
  );
}