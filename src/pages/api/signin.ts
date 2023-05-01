import type { APIRoute } from 'astro';
import {
  createRouteHandlerSupabaseClient,
  Session,
} from '@supabase/auth-helpers-nextjs';
import { cookieName } from '@configs';

const supabaseKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL;

export function stringifySupabaseSession(session: Session) {
  return JSON.stringify([
    session.access_token,
    session.refresh_token,
    session.provider_token,
    session.provider_refresh_token,
    session.user.factors,
  ]);
}

export const post: APIRoute = async ({ request, cookies }) => {
  const supabaseClient = createRouteHandlerSupabaseClient({
    supabaseUrl,
    supabaseKey,
    headers: () => request.headers,
    cookies: () => cookies,
  });

  const { email, password } = await request.json();
  const myselfRes = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (myselfRes.error || !myselfRes.data?.user) {
    return new Response(JSON.stringify({ msg: 'Login failed' }), {
      status: 400,
    });
  }

  const result = new Response(JSON.stringify({ msg: 'ok' }), { status: 200 });

  const maxAge = 60 * 60 * 24 * 7;

  result.headers.set(
    'Set-Cookie',
    `${cookieName}=${stringifySupabaseSession(
      myselfRes.data.session
    )};path=/;Max-Age=${maxAge};HttpOnly}`
  );
  return result;
};
