import { action, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import Stripe from "stripe";

// ✅ Secure Stripe initialization
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) throw new Error("Stripe secret key is not set.");
const stripe = new Stripe(stripeSecretKey); // ✅ apiVersion removed

export const createPaymentIntent = action({
  args: {
    amount: v.number(),
    currency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to create payment");
    }

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(args.amount * 100), // Convert to cents
        currency: args.currency || "usd",
        metadata: {
          userId: userId,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error("Stripe Payment Error:", error);
      throw new Error(
        `Payment failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },
});

export const confirmPayment = mutation({
  args: {
    paymentIntentId: v.string(),
    shippingAddress: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to confirm payment");
    }

    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    if (cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    const orderItems = [];
    let total = 0;

    for (const cartItem of cartItems) {
      const product = await ctx.db.get(cartItem.productId);
      if (!product) {
        throw new Error("Product not found");
      }

      if (cartItem.quantity > product.stock) {
        throw new Error(`Not enough stock for ${product.name}`);
      }

      const itemTotal = product.price * cartItem.quantity;
      total += itemTotal;

      orderItems.push({
        productId: cartItem.productId,
        productName: product.name,
        price: product.price,
        quantity: cartItem.quantity,
      });

      await ctx.db.patch(cartItem.productId, {
        stock: product.stock - cartItem.quantity,
      });
    }

    const orderId = await ctx.db.insert("orders", {
      userId,
      items: orderItems,
      total,
      status: "paid",
      paymentIntentId: args.paymentIntentId,
      shippingAddress: args.shippingAddress,
    });

    for (const cartItem of cartItems) {
      await ctx.db.delete(cartItem._id);
    }

    return orderId;
  },
});
