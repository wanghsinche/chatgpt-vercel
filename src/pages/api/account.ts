import type { APIRoute } from 'astro';
import { createRouteHandlerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { noLoginCode } from '@configs';

const supabaseKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL;

export interface IAccount {
  email: string;
  credit: number;
  expired_at: string;
  id: string;
}

export const get: APIRoute = async ({ request, cookies }) => {
  const supabaseClient = createRouteHandlerSupabaseClient({
    supabaseUrl,
    supabaseKey,
    headers: () => request.headers,
    cookies: () => cookies,
  });

  const myselfRes = await supabaseClient.auth.getUser();
  if (!myselfRes.data?.user) {
    return new Response(JSON.stringify({ msg: 'No Login' }), {
      status: noLoginCode,
    });
  }
  const subscriptionRes = await supabaseClient
    .from('subscription')
    .select<
      'credit, expired_at',
      {
        credit: number;
        expired_at: string;
      }
    >('credit, expired_at')
    .eq('id', myselfRes.data.user.id);

  const result: IAccount = {
    id: myselfRes.data.user.id,
    credit: subscriptionRes.data?.[0]?.credit,
    expired_at: subscriptionRes.data?.[0]?.expired_at,
    email: myselfRes.data.user.email,
  };

  return new Response(JSON.stringify(result), { status: 200 });
};
