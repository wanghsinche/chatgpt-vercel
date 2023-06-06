import type { APIRoute } from 'astro';
import { createRouteHandlerSupabaseClient } from '@supabase/auth-helpers-nextjs';

const supabaseKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL;

export const post: APIRoute = async ({ request, cookies }) => {
  const supabaseClient = createRouteHandlerSupabaseClient({
    supabaseUrl,
    supabaseKey,
    headers: () => request.headers,
    cookies: () => cookies,
  });

  const { email, password } = await request.json();
  const myselfRes = await supabaseClient.auth.updateUser({
    email,
    password,
  });

  if (myselfRes.error || !myselfRes.data?.user) {
    return new Response(
      JSON.stringify({ msg: myselfRes.error.message || 'Update failed' }),
      {
        status: 400,
      }
    );
  }

  return new Response(JSON.stringify({ msg: 'ok' }), { status: 200 });
};
