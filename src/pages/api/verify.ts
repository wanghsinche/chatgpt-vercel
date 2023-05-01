import type { APIRoute } from 'astro';
import { createRouteHandlerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { EmailOtpType } from '@supabase/supabase-js';
import { setSession } from './signin';

const supabaseKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL;

// for email verification and reset password
export const get: APIRoute = async ({ request, cookies }) => {
  const supabaseClient = createRouteHandlerSupabaseClient({
    supabaseUrl,
    supabaseKey,
    headers: () => request.headers,
    cookies: () => cookies,
  });

  const query = new URL(request.url).searchParams;
  const type = query.get('Type') as EmailOtpType;
  const token = query.get('Token');
  const email = query.get('Email');
  const siteUrl = query.get('SiteURL');

  const verifyRes = await supabaseClient.auth.verifyOtp({
    email,
    token,
    type,
  });

  if (verifyRes.error) {
    return new Response(JSON.stringify({ msg: verifyRes.error.message }), {
      status: 400,
    });
  }

  return setSession(
    new Response(null, {
      status: 302,
      headers: {
        Location: siteUrl,
      },
    }),
    verifyRes.data.session
  );
};
