"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, ShoppingCart, Loader2, X, PlusCircle, MinusCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface Plant {
  id: number;
  name: string;
  scientific_name: string | null;
  description: string | null;
  price: string | number;
  image_url: string | null;
  stock: number;
}

export default function PlantsPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Modal / Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    scientific_name: "",
    description: "",
    price: "",
    image_url: "",
    stock: "0",
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartAddingId, setCartAddingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch session
      const sessionRes = await fetch("/api/auth/session");
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        if (sessionData && sessionData.user) {
          setUser(sessionData.user);
          // Check if admin (role is admin, or we check emails)
          const adminEmails = ["influ@example.com"]; // Fallback check or set via config
          const isUserAdmin = sessionData.user.role === "admin" || adminEmails.includes(sessionData.user.email);
          setIsAdmin(isUserAdmin);
        }
      }

      // Fetch plants
      const plantsRes = await fetch("/api/plants");
      if (plantsRes.ok) {
        const plantsData = await plantsRes.json();
        setPlants(plantsData);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddForm = () => {
    setEditingPlant(null);
    setFormData({
      name: "",
      scientific_name: "",
      description: "",
      price: "",
      image_url: "",
      stock: "10",
    });
    setFormError("");
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (plant: Plant) => {
    setEditingPlant(plant);
    setFormData({
      name: plant.name,
      scientific_name: plant.scientific_name || "",
      description: plant.description || "",
      price: String(plant.price),
      image_url: plant.image_url || "",
      stock: String(plant.stock),
    });
    setFormError("");
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    if (!formData.name || !formData.price) {
      setFormError("Name and Price are required.");
      setIsSubmitting(false);
      return;
    }

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      setFormError("Price must be a valid positive number.");
      setIsSubmitting(false);
      return;
    }

    const endpoint = editingPlant ? `/api/plants/${editingPlant.id}` : "/api/plants";
    const method = editingPlant ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        setFormError(result.error || "Something went wrong.");
      } else {
        setIsFormOpen(false);
        showTemporaryMessage(
          editingPlant ? "Plant updated successfully!" : "Plant added successfully!",
          "success"
        );
        fetchData();
      }
    } catch (err) {
      setFormError("Failed to save plant. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlant = async (id: number) => {
    if (!confirm("Are you sure you want to delete this plant?")) return;

    try {
      const response = await fetch(`/api/plants/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showTemporaryMessage("Plant deleted successfully!", "success");
        fetchData();
      } else {
        const data = await response.json();
        showTemporaryMessage(data.error || "Failed to delete plant.", "error");
      }
    } catch (error) {
      showTemporaryMessage("Failed to delete plant.", "error");
    }
  };

  const handleAddToCart = async (plantId: number) => {
    setCartAddingId(plantId);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plantId, quantity: 1 }),
      });

      if (response.ok) {
        showTemporaryMessage("Added to cart successfully!", "success");
        // Dispatch an event to update the cart count in the Navbar
        window.dispatchEvent(new Event("cart-updated"));
      } else {
        const data = await response.json();
        showTemporaryMessage(data.error || "Failed to add to cart.", "error");
      }
    } catch (error) {
      showTemporaryMessage("Failed to add to cart.", "error");
    } finally {
      setCartAddingId(null);
    }
  };

  const showTemporaryMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-slate-900">
        <Loader2 className="h-10 w-10 animate-spin text-green-600" />
        <p className="text-gray-500 dark:text-gray-400">Loading catalog...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 border-b border-gray-200 dark:border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              🌿 Plants Catalog
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Browse our selection of indoor and outdoor plants.
            </p>
          </div>
          {isAdmin && (
            <Button
              onClick={handleOpenAddForm}
              className="bg-green-600 hover:bg-green-700 text-white font-medium flex items-center gap-2 cursor-pointer transition shadow-md"
            >
              <Plus className="h-5 w-5" />
              Add Plant
            </Button>
          )}
        </div>

        {/* Message Toast */}
        {message && (
          <div
            className={`fixed top-20 right-4 z-50 p-4 rounded-md shadow-lg border animate-in fade-in slide-in-from-top-4 duration-300 ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800"
                : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Plants Grid */}
        {plants.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
            <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Plants Found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Our botanical inventory is empty at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {plants.map((plant) => (
              <div
                key={plant.id}
                className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col hover:shadow-md transition duration-300"
              >
                {/* Image */}
                <div className="relative h-56 bg-gray-100 dark:bg-slate-700 overflow-hidden">
                  <img
                    src={plant.image_url || "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=600"}
                    alt={plant.name}
                    className="w-full h-full object-cover hover:scale-105 transition duration-500"
                  />
                  {plant.stock <= 0 && (
                    <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                      SOLD OUT
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                      {plant.name}
                    </h3>
                    {plant.scientific_name && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-0.5 truncate">
                        {plant.scientific_name}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 line-clamp-3">
                      {plant.description || "No description provided."}
                    </p>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-extrabold text-green-600 dark:text-green-400">
                        ${Number(plant.price).toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {plant.stock > 0 ? `${plant.stock} available` : "Out of stock"}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {isAdmin ? (
                        <>
                          <Button
                            onClick={() => handleOpenEditForm(plant)}
                            variant="outline"
                            className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Edit2 className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDeletePlant(plant.id)}
                            variant="outline"
                            className="border-red-200 dark:border-red-900/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => handleAddToCart(plant.id)}
                          disabled={plant.stock <= 0 || cartAddingId === plant.id}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition"
                        >
                          {cartAddingId === plant.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ShoppingCart className="h-4 w-4" />
                          )}
                          Add to Cart
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
              
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {editingPlant ? "Edit Plant details" : "Add New Plant"}
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                {formError && (
                  <div className="bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-850 p-3 rounded text-sm">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-400">
                      Plant Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="e.g. Fiddle Leaf Fig"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-400">
                      Scientific Name
                    </label>
                    <input
                      type="text"
                      value={formData.scientific_name}
                      onChange={(e) => setFormData({ ...formData, scientific_name: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="e.g. Ficus lyrata"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-400">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="29.99"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-400">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="10"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-400">
                      Image URL
                    </label>
                    <input
                      type="text"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="https://example.com/plant.jpg"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-400">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Describe the plant's growth habits, sunlight requirements, care instructions, etc..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsFormOpen(false)}
                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {editingPlant ? "Save Changes" : "Add Plant"}
                  </Button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}