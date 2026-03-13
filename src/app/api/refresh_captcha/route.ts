import { NextResponse, NextRequest } from "next/server";
import { cookies } from 'next/headers';
import { sunoApi } from "@/lib/SunoApi";
import { corsHeaders } from "@/lib/utils";

export const maxDuration = 600; // CAPTCHA solving can take several minutes
export const dynamic = "force-dynamic";

/**
 * POST /api/refresh_captcha
 * Force-solves the hCaptcha and caches the token for subsequent generations.
 * Call this before generating to pre-warm the CAPTCHA token.
 *
 * GET /api/refresh_captcha
 * Returns current CAPTCHA status (cached token age, validity, etc.)
 */
export async function POST(req: NextRequest) {
  try {
    const resolvedCookie = req.headers.get('x-suno-cookie') || (await cookies()).toString();
    const api = await sunoApi(resolvedCookie);
    const result = await api.refreshCaptchaToken();
    return new NextResponse(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error('Error refreshing captcha:', error);
    return new NextResponse(
      JSON.stringify({ error: error.message || "Failed to refresh captcha" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const resolvedCookie = req.headers.get('x-suno-cookie') || (await cookies()).toString();
    const api = await sunoApi(resolvedCookie);
    const status = api.getCaptchaStatus();
    return new NextResponse(JSON.stringify(status), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: error.message || "Failed to get captcha status" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
}

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 200, headers: corsHeaders });
}
