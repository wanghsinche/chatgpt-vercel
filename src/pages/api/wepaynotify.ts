import { botMsg } from '@utils/bot';
import type { APIRoute } from 'astro';

const manualKey = import.meta.env.MANUAL_KEY;
const homepage = import.meta.env.PUBLIC_HOMEPAGE;
const testingEmail: string = import.meta.env.TESTING_EMAIL;

function core(email: string, remark: string) {
  const approval = `${homepage}api/manual?Token=${manualKey}&Email=${email}`;

  const msg = `User ${email} is going to pay, remark is ${remark} ,at ${new Date().toLocaleDateString()}, click ${approval}  to confirm it with your admin account ${testingEmail}`;
  botMsg(msg);
}
export const post: APIRoute = async ({ request }) => {
  const { email, user, remark } = await request.json();
  core(email || user, remark);
  return new Response(JSON.stringify({ msg: 'ok' }), { status: 200 });
};

export const get: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const email = url.searchParams.get('email');
  const user = url.searchParams.get('user');
  const remark = url.searchParams.get('remark');

  core(email || user, remark);
  return new Response(JSON.stringify({ msg: 'ok' }), { status: 200 });
};
