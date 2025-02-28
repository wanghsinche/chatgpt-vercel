import type { APIRoute } from 'astro';
import { createRouteHandlerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { botMsg } from '@utils/bot';
import { IProductInfo, productDetail } from '@utils/priceModel';
import { hmac } from '@utils/hmac';
import { updateCredit } from './stripe';

const TOKEN_EXPIRATION = 1 * 60 * 1000; // 1 minutes in milliseconds

const supabaseKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const testingEmail: string = import.meta.env.TESTING_EMAIL;

const manualKey = import.meta.env.MANUAL_KEY;

function getConfirmToken() {
  const timestamp = Date.now();
  const token = `${timestamp}${manualKey}`;
  return {
    token,
    timestamp,
  };
}

function verifyConfirmToken(token: string, tm: string) {
  const timestamp = parseInt(tm, 10);
  const now = Date.now();
  if (now - timestamp > TOKEN_EXPIRATION) {
    return false;
  }
  const expectedToken = `${timestamp}${manualKey}`;

  if (token !== expectedToken) {
    return false;
  }

  return true;
}

async function core(email: string, productInfo: IProductInfo) {
  await updateCredit(
    email,
    productInfo.credit,
    new Date(Date.now() + productInfo.duration)
  );

  await botMsg(`${email} added ${productInfo.credit}`);
}

export const post: APIRoute = async ({ request }) => {
  const query = new URL(request.url).searchParams;
  const token = query.get('token');

  const { price, user, extra, uid, remark, timestamp } = await request.json();

  const info = {
    price,
    user,
    extra,
    uid,
    remark,
    timestamp,
  };
  const text = Object.keys(info)
    .sort()
    .map((k) => info[k])
    .join(',');

  const shouldBe = await hmac(manualKey, text);

  if (token !== shouldBe) {
    console.log(token, shouldBe, info);
    return new Response(JSON.stringify({ msg: `wrong token ${token}` }), {
      status: 400,
    });
  }

  const productInfo = productDetail[extra];

  await core(user, productInfo);

  return new Response(
    JSON.stringify({ msg: `ok, added ${productInfo.credit} to user ${user}` }),
    { status: 200 }
  );
};

export const get: APIRoute = async ({ request, cookies }) => {
  const query = new URL(request.url).searchParams;
  const token = query.get('Token');
  const email = query.get('Email');
  const product = productDetail[query.get('Product')]
    ? query.get('Product')
    : productDetail.default.product;
  const confirmToken = query.get('ConfirmToken');
  const ts = query.get('Ts');

  const supabaseClient = createRouteHandlerSupabaseClient({
    supabaseUrl,
    supabaseKey,
    headers: () => request.headers,
    cookies: () => cookies,
  });

  const myselfRes = await supabaseClient.auth.getUser();

  if (manualKey !== token || myselfRes.data.user?.email !== testingEmail) {
    return new Response(JSON.stringify({ msg: 'failed' }), { status: 400 });
  }

  const productInfo = productDetail[product];

  if (!confirmToken || !ts) {
    const confirmInfo = getConfirmToken();
    const confirmLink = `${request.url}&ConfirmToken=${confirmInfo.token}&Ts=${confirmInfo.timestamp}`;
    return new Response(
      `<p>double confirm with the link </p>
      <a href="${confirmLink}">${confirmLink}</a>  
      <p>to add ${productInfo.credit} to user ${email}</p>`,
      {
        status: 200,
        headers: {
          'content-type': 'text/html',
        },
      }
    );
  }

  if (!verifyConfirmToken(confirmToken, ts)) {
    return new Response(
      JSON.stringify({ msg: 'failed with wrong confirm token' }),
      { status: 400 }
    );
  }
  await core(email, productInfo);

  return new Response(
    JSON.stringify({ msg: `ok, added ${productInfo.credit} to user ${email}` }),
    { status: 200 }
  );
};
