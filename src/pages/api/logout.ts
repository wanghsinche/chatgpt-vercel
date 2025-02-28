import type { APIRoute } from 'astro';
import { cookieName } from '@configs';

const supabaseKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL;

export const post: APIRoute = async ({ request, cookies }) => {
  const result = new Response(JSON.stringify({ msg: 'ok' }), { status: 200 });
  result.headers.set(
    'Set-Cookie',
    `${cookieName}=;path=/;Expires=${new Date().toUTCString()}`
  );
  return result;
};
