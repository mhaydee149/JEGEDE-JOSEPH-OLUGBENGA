import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const order = await ctx.db.get(args.id);
    if (!order || order.userId !== userId) {
      throw new Error("Order not found");
    }

    return order;
  },
});

export const create = mutation({
  args: {
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
      throw new Error("Must be logged in to place order");
    }

    // Get cart items
    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    if (cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    // Build order items and calculate total
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

      // Update product stock
      await ctx.db.patch(cartItem.productId, {
        stock: product.stock - cartItem.quantity,
      });
    }

    // Create order
    const orderId = await ctx.db.insert("orders", {
      userId,
      items: orderItems,
      total,
      status: "pending",
      shippingAddress: args.shippingAddress,
    });

    // Clear cart
    for (const cartItem of cartItems) {
      await ctx.db.delete(cartItem._id);
    }

    return orderId;
  },
});
