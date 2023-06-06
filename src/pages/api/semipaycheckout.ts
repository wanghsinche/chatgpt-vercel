import type { APIRoute } from 'astro';
import { createRouteHandlerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { productDetail } from '@utils/priceModel';
import { hmac } from '@utils/hmac';

const supabaseKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const hostname = import.meta.env.PUBLIC_PAY_GATEWAY as string;

const secret = import.meta.env.MANUAL_KEY as string;

export const config = {
  runtime: 'edge',
};

export const post: APIRoute = async ({ request, cookies }) => {
  const { product }: { product: string } = await request.json();
  const supabaseClient = createRouteHandlerSupabaseClient({
    supabaseUrl,
    supabaseKey,
    headers: () => request.headers,
    cookies: () => cookies,
  });

  const myselfRes = await supabaseClient.auth.getUser();

  if (!myselfRes.data.user) {
    return new Response(JSON.stringify({ msg: 'failed' }), { status: 400 });
  }

  const detail = productDetail[product] || productDetail.default;
  const info: Record<string, string | number> = {
    price: detail.price,
    user: myselfRes.data.user?.email,
    extra: detail.product,
    timestamp: Date.now(),
  };
  const text = Object.keys(info)
    .sort()
    .map((k) => info[k])
    .join(',');

  const token = await hmac(secret, text);
  const checkout = await fetch(`${hostname}/api/checkout`, {
    method: 'post',
    body: JSON.stringify({ ...info, token }),
  })
    .then((res) => {
      if (res.status !== 200) throw res.statusText;
      return res;
    })
    .then((res) => res.json());

  return new Response(JSON.stringify({ msg: 'ok', checkout }), { status: 200 });
};
