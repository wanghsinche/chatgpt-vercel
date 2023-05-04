import { botMsg } from '@utils/bot';
import type { APIRoute } from 'astro';

const manualKey = import.meta.env.MANUAL_KEY;
const homepage = import.meta.env.PUBLIC_HOMEPAGE;
const testingEmail: string = import.meta.env.TESTING_EMAIL;

export const post: APIRoute = async ({ request }) => {
  const { email } = await request.json();
  const approval = `${homepage}api/manual?Token=${manualKey}&Email=${email}`;

  const msg = `User ${email} is going to pay, at ${new Date().toLocaleDateString()}, click ${approval}  to confirm it with your admin account ${testingEmail}`;
  botMsg(msg);

  return new Response(JSON.stringify({ msg }), { status: 200 });
};
