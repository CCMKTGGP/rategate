import Stripe from "stripe";

let stripe: Stripe | null = null;

// create the stripe client on first use so builds don't need the secret key
export function getStripe() {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY!);
  }
  return stripe;
}
