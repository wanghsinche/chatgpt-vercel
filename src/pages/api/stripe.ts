import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const supabaseKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL;

const stripeKey: string = import.meta.env.STRIPE_APIKEY;
const webhookSecret: string = import.meta.env.STRIPE_WEBHOOK_SECRET;

const product19CNY: string = import.meta.env.STRIPE_PRODUCT_19CNY;

const testingEmail: string = import.meta.env.TESTING_EMAIL;

const oneMonth = 30 * 3600 * 24 * 1000;

const productDetail = {
  [product19CNY]: { product: product19CNY, credit: 2000, duration: oneMonth },
  default: { product: 'default', credit: 100, duration: oneMonth },
};

const subapaseClient = createClient(supabaseUrl, supabaseKey);

const stripe = new Stripe(stripeKey, {
  // This is needed to use the Fetch API rather than relying on the Node http
  // package.
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
});
// This is needed in order to use the Web Crypto API in Deno.
const cryptoProvider = Stripe.createSubtleCryptoProvider();

async function updateCredit(
  rawEmail: string,
  addCredit: number,
  newExpired: Date
) {
  let email = rawEmail;
  // testing
  if (process.env.NODE_ENV === 'development') {
    email = testingEmail;
  }
  // It's not possible to query the auth users table directly
  // https://nikofischer.com/supabase-how-to-query-users-table
  const info = await subapaseClient
    .from('users')
    .select<'id,email', { id: string; email: string }>('id,email')
    .eq('email', email);

  if (!info.data?.length) throw Error(`No User with ${email}`);
  const uid = info.data[0]?.id;
  const details = await subapaseClient
    .from('subscription')
    .select<'credit, expired_at', { credit: number; expired_at: string }>(
      'credit, expired_at'
    )
    .eq('id', uid);

  let credit = details.data[0]?.credit;
  credit += addCredit;

  const { error } = await subapaseClient
    .from('subscription')
    .update({
      credit,
      expired_at: newExpired.toISOString(),
    })
    .eq('id', uid);

  if (error) throw error;
}

export const post: APIRoute = async ({ request }) => {
  const signature = request.headers.get('Stripe-Signature');

  // First step is to verify the event. The .text() method must be used as the
  // verification relies on the raw request body rather than the parsed JSON.
  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      webhookSecret!,
      undefined,
      cryptoProvider
    );
  } catch (err) {
    console.log(`🔔 Error received: ${err}`);
    return new Response(JSON.stringify({ msg: err.message }), { status: 400 });
  }
  let results;
  let products: string[];
  let addCredit = 0;
  let newExpired = 0;
  let email: string;
  let updateResult;
  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      results = await stripe.checkout.sessions.listLineItems(
        (event.data.object as Stripe.Checkout.Session).id,
        {
          expand: ['data.price'],
        }
      );
      email =
        (event.data.object as Stripe.Checkout.Session).customer_details.email ||
        (event.data.object as Stripe.Checkout.Session).customer_email;

      products = (results.data as Stripe.LineItem[]).map(
        (el) => el.price.product
      ) as string[];
      addCredit = products.reduce(
        (am, p) => am + (productDetail[p] ?? productDetail.default).credit,
        0
      );
      newExpired = products.reduce(
        (am, p) =>
          Math.max(am, (productDetail[p] ?? productDetail.default).duration),
        0
      );
      await updateCredit(email, addCredit, new Date(Date.now() + newExpired));
      console.log(
        products,
        email,
        'add credit',
        addCredit,
        'new expired',
        new Date(Date.now() + newExpired)
      );

      // Then define and call a function to handle the event checkout.session.completed
      break;
    // case 'checkout.session.async_payment_succeeded':
    //     const asyncPaymentSucceeded = event.data.object;
    //     // Then define and call a function to handle the event payout.paid
    //     break;
    // case 'payment_intent.succeeded':
    //     const paymentIntentSucceeded = event.data.object;
    //     // Then define and call a function to handle the event payout.paid
    //     break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return new Response(JSON.stringify({ msg: 'ok' }), { status: 200 });
};
