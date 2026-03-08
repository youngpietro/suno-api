import { NextResponse, NextRequest } from "next/server";
import { updateCookie } from "@/lib/SunoApi";
import { corsHeaders } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cookie: newCookie } = body;

    if (!newCookie || typeof newCookie !== "string") {
      return new NextResponse(
        JSON.stringify({
          error: "Missing 'cookie' field in request body",
          usage: 'POST /api/update_cookie with body: { "cookie": "__client=eyJ...;__client_Jnxw-muT=..." }',
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!newCookie.includes("__client")) {
      return new NextResponse(
        JSON.stringify({
          error: "Invalid cookie: must contain __client token from suno.com",
          tip: "Go to suno.com → DevTools → Application → Cookies → copy the full cookie string including __client",
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const result = await updateCookie(newCookie);
    return new NextResponse(
      JSON.stringify({
        success: true,
        message: "Cookie updated and validated successfully. All cached sessions cleared and re-initialized.",
        ...result,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    const isAuthError =
      error.message?.includes("session id") ||
      error.message?.includes("SUNO_COOKIE") ||
      error.message?.includes("Unauthorized");

    return new NextResponse(
      JSON.stringify({
        success: false,
        error: isAuthError
          ? "Cookie is invalid or expired. Could not authenticate with Suno."
          : error.message || "Failed to update cookie",
        tip: isAuthError
          ? "Make sure you copy the FULL cookie string from suno.com while logged in. The __client token must be from an active session."
          : undefined,
      }),
      {
        status: isAuthError ? 401 : 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
}

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 200, headers: corsHeaders });
}
