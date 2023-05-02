import type { APIRoute } from 'astro';
import { createRouteHandlerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { productDetail, updateCredit } from './stripe';

const supabaseKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const testingEmail: string = import.meta.env.TESTING_EMAIL;

const manualKey = import.meta.env.MANUAL_KEY;

export const post: APIRoute = async ({ request, cookies }) => {
  const { email, token } = await request.json();

  const supabaseClient = createRouteHandlerSupabaseClient({
    supabaseUrl,
    supabaseKey,
    headers: () => request.headers,
    cookies: () => cookies,
  });

  const myselfRes = await supabaseClient.auth.getUser();

  if (manualKey !== token || myselfRes.data.user?.email !== testingEmail) {
    return new Response(JSON.stringify({ msg: 'failed' }), { status: 400 });
  }
  await updateCredit(
    email,
    productDetail.manual.credit,
    new Date(Date.now() + productDetail.manual.duration)
  );

  return new Response(JSON.stringify({ msg: 'ok' }), { status: 200 });
};
