import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { consumptionEveryTime } from '@configs';

const supabasePrivateKey = import.meta.env.NEXT_PRIVATE_SUPABASE_SERVICE_KEY;
const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL;

const oneMonth = 30 * 3600 * 24 * 1000;

const subapaseClient = createClient(supabaseUrl, supabasePrivateKey);

async function updateCredit() {
  const details = await subapaseClient
    .from('subscription')
    .select<
      'id, credit, expired_at',
      { id: string; credit: number; expired_at: string }
    >('id, credit, expired_at');
  const now = new Date().toISOString();
  const nextExpiry = new Date(Date.now() + oneMonth).toISOString();

  const toExpired = details.data
    ?.filter((el) => el.expired_at <= now)
    .map((el) => {
      const newEl = { ...el };
      newEl.expired_at = nextExpiry;
      newEl.credit = Math.max(newEl.credit - consumptionEveryTime, 0);
      return newEl;
    });

  const tasks = toExpired.map((rec) =>
    subapaseClient.from('subscription').update(rec).eq('id', rec.id)
  );

  await Promise.all(tasks)
    .then((res) => {
      res.forEach((it) => {
        console.log(it.status, it.error);
      });
    })
    .catch((err) => {
      console.log(err);
    });
}

export const post: APIRoute = async ({ request }) => {
  console.log('Cron Job at ', new Date().toISOString());
  updateCredit();
  return new Response(JSON.stringify({ msg: 'ok' }), { status: 200 });
};
