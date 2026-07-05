import { query } from "@/lib/db";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 401 });
    }

    const id = (await params).id;
    const { name, scientific_name, description, price, image_url, stock } = await request.json();

    if (!name || price === undefined) {
      return NextResponse.json({ error: "Name and price are required" }, { status: 400 });
    }

    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock) || 0;

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    const result = await query(
      `UPDATE plants
       SET name = $1, scientific_name = $2, description = $3, price = $4, image_url = $5, stock = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [
        name,
        scientific_name || null,
        description || null,
        parsedPrice,
        image_url || null,
        parsedStock,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Plant not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Failed to update plant:", error);
    return NextResponse.json({ error: "Failed to update plant" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 401 });
    }

    const id = (await params).id;

    const result = await query("DELETE FROM plants WHERE id = $1 RETURNING *", [id]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Plant not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Plant deleted successfully" });
  } catch (error) {
    console.error("Failed to delete plant:", error);
    return NextResponse.json({ error: "Failed to delete plant" }, { status: 500 });
  }
}
