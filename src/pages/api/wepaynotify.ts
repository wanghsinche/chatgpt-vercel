import type { APIRoute } from 'astro';

const bot: string = import.meta.env.TG_BOT_URL;

export const post: APIRoute = async ({ request }) => {
  const { email } = await request.json();
  const msg = `User ${email} is going to pay, at ${new Date().toISOString()}`;
  await fetch(`${bot}&text=${encodeURIComponent(msg)}`);

  return new Response(JSON.stringify({ msg }), { status: 200 });
};
