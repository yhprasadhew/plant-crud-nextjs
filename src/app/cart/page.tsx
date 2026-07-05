"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Trash2, ArrowLeft, Loader2, Plus, Minus, CheckCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CartItem {
  id: number;
  plant_id: number;
  quantity: number;
  name: string;
  price: string | number;
  image_url: string | null;
  scientific_name: string | null;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/cart");
      if (response.ok) {
        const data = await response.json();
        setCartItems(data);
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQuantity = async (plantId: number, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    setUpdatingItemId(plantId);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plantId, quantity: newQty, action: "set" }),
      });

      if (response.ok) {
        // Refresh cart
        const fetchRes = await fetch("/api/cart");
        if (fetchRes.ok) {
          const data = await fetchRes.json();
          setCartItems(data);
        }
        window.dispatchEvent(new Event("cart-updated"));
      }
    } catch (error) {
      console.error("Failed to update quantity:", error);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (plantId: number) => {
    if (!confirm("Remove this item from your cart?")) return;
    try {
      const response = await fetch(`/api/cart?plantId=${plantId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCartItems(cartItems.filter((item) => item.plant_id !== plantId));
        window.dispatchEvent(new Event("cart-updated"));
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const response = await fetch("/api/cart", {
        method: "DELETE",
      });

      if (response.ok) {
        setCheckoutSuccess(true);
        setCartItems([]);
        window.dispatchEvent(new Event("cart-updated"));
      }
    } catch (error) {
      console.error("Checkout failed:", error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-slate-900">
        <Loader2 className="h-10 w-10 animate-spin text-green-600" />
        <p className="text-gray-500 dark:text-gray-400">Loading your cart...</p>
      </div>
    );
  }

  if (checkoutSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-150 dark:border-gray-700 text-center animate-in zoom-in-95 duration-200">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Order Confirmed!</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-4 leading-relaxed">
            Thank you for your purchase. Your green friends are being carefully packed and will be shipped to your doorstep soon! 🌿
          </p>
          <div className="mt-8">
            <Link href="/plants">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 cursor-pointer">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link href="/plants" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="h-8 w-8 text-green-600" />
            Shopping Cart
          </h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center shadow-sm border border-gray-200 dark:border-gray-800">
            <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Cart is Empty</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Looks like you haven't added any botanical additions to your cart yet.
            </p>
            <div className="mt-6">
              <Link href="/plants">
                <Button className="bg-green-600 hover:bg-green-700 text-white font-medium cursor-pointer">
                  Go Browse Plants
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-850 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 hover:shadow-md transition"
                >
                  {/* Image */}
                  <div className="relative h-24 w-24 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    <img
                      src={item.image_url || "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=300"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                      {item.name}
                    </h3>
                    {item.scientific_name && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-0.5 truncate">
                        {item.scientific_name}
                      </p>
                    )}
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400 mt-2 block">
                      ${Number(item.price).toFixed(2)} each
                    </span>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleUpdateQuantity(item.plant_id, item.quantity, -1)}
                      disabled={item.quantity <= 1 || updatingItemId === item.plant_id}
                      className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                    >
                      <MinusCircle className="h-6 w-6" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-gray-950 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.plant_id, item.quantity, 1)}
                      disabled={updatingItemId === item.plant_id}
                      className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                    >
                      <PlusCircle className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveItem(item.plant_id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full cursor-pointer transition"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-850 space-y-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b pb-4">
                Order Summary
              </h3>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${calculateSubtotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span className="font-semibold text-gray-900 dark:text-white text-green-600">
                    FREE
                  </span>
                </div>
                <div className="border-t pt-4 flex justify-between text-base font-bold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 cursor-pointer transition shadow-md flex items-center justify-center gap-2"
              >
                {isCheckingOut ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Proceed to Checkout"
                )}
              </Button>

              <div className="text-center">
                <Link href="/plants" className="text-xs text-green-600 dark:text-green-400 hover:underline">
                  Continue Shopping
                </Link>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

// Small inline SVGs for MinusCircle / PlusCircle if Lucide constructors fail
function MinusCircle({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function PlusCircle({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}
