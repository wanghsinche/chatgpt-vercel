import { createHmac } from 'crypto';

function hmacForNode(
  secretKey: string,
  message: string,
  algorithm = 'SHA-256'
) {
  return createHmac(algorithm.replace('SHA-256', 'sha256'), secretKey)
    .update(message)
    .digest('base64');
}

async function hmacForWeb(
  secretKey: string,
  message: string,
  algorithm = 'SHA-256'
) {
  // Convert the message and secretKey to Uint8Array
  const encoder = new TextEncoder();
  const messageUint8Array = encoder.encode(message);
  const keyUint8Array = encoder.encode(secretKey);

  // Import the secretKey as a CryptoKey
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyUint8Array,
    { name: 'HMAC', hash: algorithm },
    false,
    ['sign']
  );

  // Sign the message with HMAC and the CryptoKey
  const signature = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    messageUint8Array
  );

  // Convert the signature ArrayBuffer to a base64 string

  const b64 = Buffer.from(new Uint8Array(signature)).toString('base64');
  return b64;
}

export async function hmac(
  secretKey: string,
  message: string,
  algorithm = 'SHA-256'
) {
  if (typeof createHmac !== 'undefined')
    return hmacForNode(secretKey, message, algorithm);
  return hmacForWeb(secretKey, message, algorithm);
}
