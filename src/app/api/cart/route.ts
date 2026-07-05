import { query } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rows } = await query(
      `SELECT c.id, c.plant_id, c.quantity, p.name, p.price, p.image_url, p.scientific_name
       FROM cart_items c
       JOIN plants p ON c.plant_id = p.id
       WHERE c.user_id = $1
       ORDER BY c.created_at ASC`,
      [user.id]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Failed to fetch cart:", error);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plantId, quantity, action = "increment" } = await request.json();

    if (plantId === undefined) {
      return NextResponse.json({ error: "Plant ID is required" }, { status: 400 });
    }

    const qty = parseInt(quantity) || 1;

    let result;
    if (action === "set") {
      if (qty <= 0) {
        // Delete item if quantity is set to 0 or less
        await query(
          "DELETE FROM cart_items WHERE user_id = $1 AND plant_id = $2",
          [user.id, plantId]
        );
        return NextResponse.json({ message: "Item removed from cart" });
      }

      result = await query(
        `INSERT INTO cart_items (user_id, plant_id, quantity)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, plant_id)
         DO UPDATE SET quantity = $3
         RETURNING *`,
        [user.id, plantId, qty]
      );
    } else {
      result = await query(
        `INSERT INTO cart_items (user_id, plant_id, quantity)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, plant_id)
         DO UPDATE SET quantity = cart_items.quantity + $3
         RETURNING *`,
        [user.id, plantId, qty]
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Failed to update cart:", error);
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const plantId = url.searchParams.get("plantId");

    if (plantId) {
      await query(
        "DELETE FROM cart_items WHERE user_id = $1 AND plant_id = $2",
        [user.id, plantId]
      );
    } else {
      // Clear entire cart (checkout)
      await query("DELETE FROM cart_items WHERE user_id = $1", [user.id]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to remove from cart:", error);
    return NextResponse.json({ error: "Failed to remove from cart" }, { status: 500 });
  }
}
