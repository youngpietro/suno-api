import { NextResponse, NextRequest } from "next/server";
import { cookies } from 'next/headers';
import { sunoApi } from "@/lib/SunoApi";
import { corsHeaders } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * GET /api/stems?parent_id=xxx
 *
 * Discovers all stem clips for a given parent clip by scanning the user's
 * library feed for clips whose metadata.stem_from_id matches the parent.
 *
 * Returns:
 * {
 *   parent: { id, has_stem, title },
 *   stems: [{ id, title, status, audio_url, stem_type, stem_from_id, ... }]
 * }
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const parentId = url.searchParams.get('parent_id');

    if (!parentId) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required parameter: parent_id' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // X-Suno-Cookie header takes priority over Cookie header (for per-agent auth)
    const cookie = req.headers.get('x-suno-cookie') || (await cookies()).toString();
    const api = await sunoApi(cookie);
    const result = await api.findStems(parentId);

    return new NextResponse(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error: any) {
    console.error('Error finding stems:', error.message);
    return new NextResponse(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders
  });
}
