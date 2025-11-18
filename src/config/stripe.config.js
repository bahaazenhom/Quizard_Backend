import Stripe from "stripe";
export const stripe = async () => {
  console.log(process.env.STRIPE_SECRET_KEY);

  return new Stripe(process.env.STRIPE_SECRET_KEY);
};
