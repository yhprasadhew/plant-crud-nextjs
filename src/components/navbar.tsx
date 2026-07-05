"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Leaf, LogOut, User, Settings, LogIn, ShoppingCart } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    try {
      const response = await fetch("/api/cart");
      if (response.ok) {
        const data = await response.json();
        const count = data.reduce((acc: number, item: any) => acc + item.quantity, 0);
        setCartCount(count);
      } else {
        setCartCount(0);
      }
    } catch (error) {
      setCartCount(0);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        if (response.ok) {
          const data = await response.json();
          if (data && data.user) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Failed to check session:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, [pathname]);

  useEffect(() => {
    if (user) {
      fetchCartCount();
      window.addEventListener("cart-updated", fetchCartCount);
      return () => {
        window.removeEventListener("cart-updated", fetchCartCount);
      };
    } else {
      setCartCount(0);
    }
  }, [user, pathname]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        setUser(null);
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white text-black dark:bg-slate-950 dark:text-white shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-green-700"
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

          {user && (
            <Link
              href="/cart"
              className="flex items-center gap-1 text-sm font-medium text-black/60 transition-colors hover:text-black dark:text-white/80 dark:hover:text-white relative"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-3 bg-blue-600 text-white rounded-full text-[9px] w-4 h-4 flex items-center justify-center font-extrabold shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>
          )}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          <ModeToggle />

          {isLoading ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200 dark:bg-slate-800" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center focus:outline-none"
              >
                <div className="h-9 w-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center font-bold shadow-sm transition-colors cursor-pointer">
                  {user.email ? user.email[0].toUpperCase() : <User className="h-4 w-4" />}
                </div>
              </button>

              {isDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-40 animate-in fade-in slide-in-from-top-1 duration-100">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700 transition-colors w-full text-left"
                    >
                      <Settings className="h-4 w-4" />
                      Account Settings
                    </Link>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        handleLogout();
                      }}
                      disabled={isLoggingOut}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition-colors w-full text-left cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      {isLoggingOut ? "Logging out..." : "Sign Out"}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link href="/sign-in">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 cursor-pointer">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}