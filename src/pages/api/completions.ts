/* eslint-disable no-console */
import type { APIRoute, APIContext } from 'astro';
import type { ParsedEvent, ReconnectInterval } from 'eventsource-parser';
import { createParser } from 'eventsource-parser';
import { defaultModel, supportedModels } from '@configs';
import { Message } from '@interfaces';
import { loadBalancer } from '@utils/server';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { calculateCost, priceList } from '@utils/token';
import { apiKeyStrategy, apiKeys, baseURL, config, password as pwd } from '.';

const supabaseKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL;

export { config };

export const post: APIRoute = async (ctx: APIContext) => {
  const { request, cookies } = ctx;

  // format astro cookie to nextjs cookie

  const nextjsCookies: Record<string, string> = {
    'supabase-auth-token': cookies.get('supabase-auth-token')?.value,
  };
  // Create authenticated Supabase Client
  const supabase = createServerSupabaseClient(
    { ...ctx, req: { ...request, cookies: nextjsCookies } },
    {
      supabaseKey,
      supabaseUrl,
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return new Response(JSON.stringify({ msg: 'No Login' }), {
      status: 400,
    });
  }

  if (!baseURL) {
    return new Response(JSON.stringify({ msg: 'No LOCAL_PROXY provided' }), {
      status: 400,
    });
  }

  const body = await request.json();
  const { messages, temperature = 1, password } = body;
  let { key, model } = body;

  if (!key) {
    const next = loadBalancer(apiKeys, apiKeyStrategy);
    key = next();
  }

  model = model || defaultModel;

  if (pwd && password !== pwd) {
    return new Response(
      JSON.stringify({ msg: 'No password or wrong password' }),
      {
        status: 401,
      }
    );
  }

  if (!key) {
    return new Response(JSON.stringify({ msg: 'No API key provided' }), {
      status: 400,
    });
  }

  if (!supportedModels.includes(model)) {
    return new Response(
      JSON.stringify({ msg: `Not supported model ${model}` }),
      {
        status: 400,
      }
    );
  }

  // Run queries with RLS on the server
  const { data: subscription } = await supabase
    .from('subscription')
    .select('credit, expired_at');

  console.log(subscription, priceList[model], model);

  console.log(
    calculateCost(
      messages.reduce((am, cur: Message) => `${am} ${cur.content}`, ''),
      priceList[model] || priceList['gpt-4-32k-0314']
    )
  );

  try {
    const res = await fetch(`https://${baseURL}/v1/chat/completions`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      method: 'POST',
      body: JSON.stringify({
        model,
        messages: messages.map((message: Message) => ({
          role: message.role,
          content: message.content,
        })),
        temperature,
        stream: true,
      }),
    });
    if (!res.ok) {
      return new Response(res.body, {
        status: res.status,
      });
    }

    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const streamParser = (event: ParsedEvent | ReconnectInterval) => {
          if (event.type === 'event') {
            const { data } = event;
            if (data === '[DONE]') {
              controller.close();
              return;
            }
            try {
              const json = JSON.parse(data);
              const text = json.choices[0].delta?.content || '';
              const queue = encoder.encode(text);
              controller.enqueue(queue);
            } catch (e) {
              controller.error(e);
            }
          }
        };

        const parser = createParser(streamParser);
        // eslint-disable-next-line no-restricted-syntax, @typescript-eslint/no-explicit-any
        for await (const chunk of res.body as any)
          parser.feed(decoder.decode(chunk));
      },
    });

    return new Response(stream);
  } catch (e) {
    console.log('Error', e);
    return new Response(JSON.stringify({ msg: e?.message || e?.stack || e }), {
      status: 500,
    });
  }
};
