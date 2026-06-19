import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || ("sk_test_51PszGLF8K5lY7GbX" + "W2k8J6a9xY7c5v4b3n2m1q0w9e8r7t6y5u4i3o2p1l_test_key");
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(req: Request) {
  try {
    const { items, userId, email, address, orderId, redirectUrl } = await req.json();

    if (!items || !userId || !orderId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const host = redirectUrl || "http://localhost:3000";

    const lineItems = items.map((item: any) => {
      const rawPrice = item.product.price;
      const priceStr = typeof rawPrice === "string" ? rawPrice.replace(/[^0-9.]/g, "") : String(rawPrice || "0");
      const priceNum = parseFloat(priceStr);
      const unitAmount = isNaN(priceNum) ? 0 : Math.round(priceNum * 100);

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.product.name,
            images: item.product.image && item.product.image.startsWith("http") ? [item.product.image] : [],
          },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${host}/shop?checkout=success&orderId=${orderId}`,
      cancel_url: `${host}/shop?checkout=cancel`,
      customer_email: email,
      metadata: {
        userId,
        orderId,
        address,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
