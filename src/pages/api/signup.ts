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

  const signUpRes = await supabaseClient.auth.signUp({
    email,
    password,
  });

  if (signUpRes.error) {
    return new Response(JSON.stringify({ msg: signUpRes.error.message }), {
      status: 400,
    });
  }

  return new Response(
    JSON.stringify({ msg: `Please check your email ${email} to verify` }),
    { status: 200 }
  );
};
