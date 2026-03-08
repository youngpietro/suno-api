import { NextResponse, NextRequest } from "next/server";
import { getCookieHealth } from "@/lib/SunoApi";
import { corsHeaders } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const health = await getCookieHealth();
    return new NextResponse(JSON.stringify(health), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({
        status: "error",
        error: error.message || "Failed to check cookie health",
      }),
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
