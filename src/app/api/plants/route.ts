import { query } from "@/lib/db";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const { rows } = await query("SELECT * FROM plants ORDER BY name ASC");
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Failed to fetch plants:", error);
    return NextResponse.json({ error: "Failed to fetch plants" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 401 });
    }

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
      `INSERT INTO plants (name, scientific_name, description, price, image_url, stock)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        name,
        scientific_name || null,
        description || null,
        parsedPrice,
        image_url || null,
        parsedStock,
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create plant:", error);
    return NextResponse.json({ error: "Failed to create plant" }, { status: 500 });
  }
}
