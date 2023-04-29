import type { APIRoute } from 'astro';
import Stripe from 'stripe';

const stripeKey: string = import.meta.env.STRIPE_APIKEY;
const webhookSecret: string = import.meta.env.STRIPE_WEBHOOK_SECRET;

const stripe = new Stripe(stripeKey, {
  // This is needed to use the Fetch API rather than relying on the Node http
  // package.
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
});
// This is needed in order to use the Web Crypto API in Deno.
const cryptoProvider = Stripe.createSubtleCryptoProvider();

export const post: APIRoute = async ({ request }) => {
  const signature = request.headers.get('Stripe-Signature');

  // First step is to verify the event. The .text() method must be used as the
  // verification relies on the raw request body rather than the parsed JSON.
  const body = await request.text();

  let event;
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
  console.log(`🔔 Event received: ${event.id}`);

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      console.log(event.data.object);
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
