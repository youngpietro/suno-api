import { NextResponse, NextRequest } from "next/server";
import { cookies } from 'next/headers';
import { DEFAULT_MODEL, sunoApi } from "@/lib/SunoApi";
import { corsHeaders } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const { audio_id, title, mode } = body;

      if (!audio_id) {
        return new NextResponse(JSON.stringify({ error: 'Audio ID is required' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Validate mode if provided (default: twelve = All Detected Stems)
      const stemMode: 'twelve' | 'two' = mode === 'two' ? 'two' : 'twelve';

      // X-Suno-Cookie header takes priority over Cookie header (for per-agent auth)
      const resolvedCookie = req.headers.get('x-suno-cookie') || (await cookies()).toString();
      const audioInfo = await (await sunoApi(resolvedCookie))
        .generateStems(audio_id, title || undefined, stemMode);

      return new NextResponse(JSON.stringify(audioInfo), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    } catch (error: any) {
      const errData = error.response?.data;
      const errStatus = error.response?.status;
      console.error('Error generating stems:', JSON.stringify(errData || error.message));
      if (errStatus === 402) {
        return new NextResponse(JSON.stringify({ error: errData?.detail || 'Insufficient Suno credits for stem extraction' }), {
          status: 402,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
      return new NextResponse(JSON.stringify({ error: 'Internal server error: ' + JSON.stringify(errData?.detail || error.message) }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  } else {
    return new NextResponse('Method Not Allowed', {
      headers: {
        Allow: 'POST',
        ...corsHeaders
      },
      status: 405
    });
  }
}


export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders
  });
}