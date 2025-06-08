import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getOrderTracking = query({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Check if user owns this order or is admin
    const user = await ctx.db.get(userId);
    if (order.userId !== userId && !(user as any)?.isAdmin) {
      throw new Error("Access denied");
    }

    // Get tracking events
    const trackingEvents = await ctx.db
      .query("trackingEvents")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .order("desc")
      .collect();

    return {
      order,
      trackingEvents,
    };
  },
});

export const addTrackingEvent = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.string(),
    description: v.string(),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    // Check if user is admin
    const user = await ctx.db.get(userId);
    if (!(user as any)?.isAdmin) {
      throw new Error("Admin access required");
    }

    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Add tracking event
    await ctx.db.insert("trackingEvents", {
      orderId: args.orderId,
      status: args.status,
      description: args.description,
      location: args.location,
    });

    // Update order status
    await ctx.db.patch(args.orderId, { status: args.status });

    return "Tracking event added";
  },
});

export const getTrackingByOrderNumber = query({
  args: {
    orderNumber: v.string(),
  },
  handler: async (ctx, args) => {
    // Find order by the last 8 characters of the ID
    const orders = await ctx.db.query("orders").collect();
    const order = orders.find(o => o._id.slice(-8) === args.orderNumber);
    
    if (!order) {
      throw new Error("Order not found");
    }

    // Get tracking events
    const trackingEvents = await ctx.db
      .query("trackingEvents")
      .withIndex("by_order", (q) => q.eq("orderId", order._id))
      .order("desc")
      .collect();

    return {
      order,
      trackingEvents,
    };
  },
});
