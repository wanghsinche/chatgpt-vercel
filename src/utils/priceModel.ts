import { SupportedModel, defaultModel, noLoginCode } from '@configs/index';
import { createRouteHandlerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { APIRoute, APIContext } from 'astro';

export const priceList: Record<SupportedModel, number> = {
  // 'gpt-4': 0.06,
  // 'gpt-4-0314': 0.06,
  // 'gpt-4-32k': 0.12,
  // 'gpt-4-32k-0314': 0.12,
  'gpt-3.5-turbo': 0.002,
  'gpt-3.5-turbo-0301': 0.002,
};

export function countTokens(sentence: string) {
  const chineseTokenLength = 2; // 1 Chinese character ~= 2 tokens
  const englishTokenLength = 4; // 1 token ~= 4 chars in English
  const tokenRatio = 0.75; // 1 token ~= 3/4 words

  const chineseCharRegex = /[\u4e00-\u9fa5]/g; // regular expression to match Chinese characters
  const chineseCharCount = (sentence.match(chineseCharRegex) || []).length;
  const otherTokenCount = sentence.split(' ').length - chineseCharCount;

  const tokenCount =
    chineseCharCount * chineseTokenLength +
    Math.ceil(
      otherTokenCount * tokenRatio +
        (sentence.length - chineseCharCount * 2) / englishTokenLength
    );

  return tokenCount;
}

export function calculateCost(
  sentence: string,
  costPerThousandTokens = 0.03,
  ratio = 2,
  fxRate = 7
) {
  const tokenCount = Math.max(countTokens(sentence), 300);
  const cost = (tokenCount / 1000) * costPerThousandTokens * ratio * fxRate;
  return Number(cost.toFixed(2));
}

const supabaseKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL;

export const withPriceModel =
  (routeFn: APIRoute) => async (ctx: APIContext) => {
    const { request, cookies } = ctx;

    // Create authenticated Supabase Client
    const supabase = createRouteHandlerSupabaseClient({
      supabaseKey,
      supabaseUrl,
      headers: () => request.headers,
      cookies: () => cookies,
    });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return new Response(JSON.stringify({ msg: 'No Login' }), {
        status: noLoginCode,
      });
    }

    // Run queries with RLS on the server
    const { data: subscription } = await supabase
      .from('subscription')
      .select('credit, expired_at')
      .eq('id', session.user.id);

    let credit = subscription?.[0]?.credit;

    const bodyJson = await request.json();
    // to fix the body is unusable bug
    request.json = () => Promise.resolve(bodyJson);

    let { model } = bodyJson;
    const { messages } = bodyJson;
    model = model || defaultModel;

    const cost =
      100 *
      calculateCost(
        JSON.stringify(messages),
        priceList[model] || priceList['gpt-4-32k-0314']
      );

    credit -= cost;

    console.log(subscription, priceList[model], model, cost, credit);

    if (!credit || credit <= 0) {
      return new Response(
        JSON.stringify({
          msg: `Please click the premium button to add more credit \n 请点击充值按钮添加更多流量`,
        }),
        {
          status: 400,
        }
      );
    }

    /*
  To update a record on a table with RLS, you need to create a policy that allows users to update their own data. Here is an example of how to create such a policy:
  create policy "Users can update their own profiles."
    on profiles for update using (
      auth.uid() = id
    );

  This policy allows logged in users to update their own data in the profiles table. The auth.uid() function returns the UUID of the currently logged in user, and the id column in the profiles table is used to match the user's UUID.

  Once this policy is created, users will only be able to update their own data in the profiles table. If they try to update someone else's data, the update will fail.
*/
    const { error: updateErr } = await supabase
      .from('subscription')
      .update({ credit: Math.max(0, credit) })
      .eq('id', session.user.id);

    if (updateErr) {
      return new Response(JSON.stringify({ msg: updateErr.message }), {
        status: 400,
      });
    }

    return routeFn(ctx);
  };
