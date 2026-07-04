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

    // Sign up with Neon Auth
    const { data, error } = await authClient.signUp.email({
      email,
      password,
      name: email.split("@")[0],
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to sign up" },
        { status: error.status || 400 }
      );
    }

    // Return the response
    return NextResponse.json(
      { success: true, user: data?.user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to sign up" },
      { status: 500 }
    );
  }
}
