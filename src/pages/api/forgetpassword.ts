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

  const { email } = await request.json();
  const resetRes = await supabaseClient.auth.resetPasswordForEmail(email);

  if (resetRes.error) {
    return new Response(
      JSON.stringify({ msg: resetRes.error.message || 'Reset failed' }),
      {
        status: 400,
      }
    );
  }

  return new Response(
    JSON.stringify({
      msg: `Please check your email ${email} to reset the password`,
    }),
    { status: 200 }
  );
};
