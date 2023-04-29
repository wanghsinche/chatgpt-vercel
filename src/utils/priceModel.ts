import { SupportedModel, defaultModel } from '@configs/index';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { APIRoute, APIContext, EndpointOutput } from 'astro';

export const priceList: Record<SupportedModel, number> = {
  'gpt-4': 0.06,
  'gpt-4-0314': 0.06,
  'gpt-4-32k': 0.12,
  'gpt-4-32k-0314': 0.12,
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
const paymentUrl = import.meta.env.SUBSCRIPTION_URL;

export const withPriceModel =
  (routeFn: APIRoute) => async (ctx: APIContext) => {
    const { request, cookies } = ctx;

    // format astro cookie to nextjs cookie

    const nextjsCookies: Record<string, string> = {
      'supabase-auth-token': cookies.get('supabase-auth-token')?.value,
    };

    const nextjsHeaders: Record<string, string> = {};

    request.headers.forEach((v, k) => {
      nextjsHeaders[k] = v;
    });

    const resHeader = new Headers();

    function appendHeader(res: Response | EndpointOutput, headers: Headers) {
      if (!('headers' in res)) return res;
      headers.forEach((v, k) => {
        res.headers.set(k, v);
      });
      return res;
    }

    // Create authenticated Supabase Client
    const supabase = createServerSupabaseClient(
      {
        ...ctx,
        req: { ...request, cookies: nextjsCookies, headers: nextjsHeaders },
        res: {
          getHeader: (s: string) => resHeader.get(s),
          setHeader: (n: string, v: string) => resHeader.set(n, v),
        },
      },
      {
        supabaseKey,
        supabaseUrl,
      }
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return appendHeader(
        new Response(JSON.stringify({ msg: 'No Login' }), {
          status: 400,
        }),
        resHeader
      );
    }

    // Run queries with RLS on the server
    const { data: subscription } = await supabase
      .from('subscription')
      .select('credit, expired_at');

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

    // console.log(subscription, priceList[model], model, cost, credit);

    if (credit <= 0) {
      return appendHeader(
        new Response(
          JSON.stringify({ msg: `Please add more credit: ${paymentUrl}` }),
          {
            status: 400,
          }
        ),
        resHeader
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
      .update({ credit })
      .eq('id', session.user.id);

    if (updateErr) {
      return appendHeader(
        new Response(JSON.stringify({ msg: updateErr.message }), {
          status: 400,
        }),
        resHeader
      );
    }

    const finalRes = await routeFn(ctx);
    return appendHeader(finalRes, resHeader);
  };
