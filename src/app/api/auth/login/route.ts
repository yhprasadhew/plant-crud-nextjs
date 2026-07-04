import { authClient } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Sign in with Neon Auth
    const { data, error } = await authClient.signIn.email({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to sign in" },
        { status: error.status || 400 }
      );
    }

    // Return the response
    return NextResponse.json(
      { success: true, user: data?.user },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Failed to sign in" },
      { status: 500 }
    );
  }
}
