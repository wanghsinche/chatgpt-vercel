import { botMsg } from '@utils/bot';
import type { APIRoute } from 'astro';

const manualKey = import.meta.env.MANUAL_KEY;
const homepage = import.meta.env.PUBLIC_HOMEPAGE;
const testingEmail: string = import.meta.env.TESTING_EMAIL;

function core(email: string) {
  const approval = `${homepage}api/manual?Token=${manualKey}&Email=${email}`;

  const msg = `User ${email} is going to pay, at ${new Date().toLocaleDateString()}, click ${approval}  to confirm it with your admin account ${testingEmail}`;
  botMsg(msg);
}
export const post: APIRoute = async ({ request }) => {
  const { email } = await request.json();
  core(email);
  return new Response(JSON.stringify({ msg: 'ok' }), { status: 200 });
};

export const get: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  core(url.searchParams.get('email'));
  return new Response(JSON.stringify({ msg: 'ok' }), { status: 200 });
};
