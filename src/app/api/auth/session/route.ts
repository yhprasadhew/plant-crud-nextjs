import { authClient } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { data } = await authClient.getSession();
    return NextResponse.json(data || { session: null, user: null });
  } catch (error) {
    return NextResponse.json({ session: null, user: null }, { status: 200 });
  }
}
