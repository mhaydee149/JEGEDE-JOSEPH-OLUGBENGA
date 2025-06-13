import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";
import { create as createProduct } from "../products";

// Admin check function
async function isAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Must be logged in");
  }
  
  const user = await ctx.db.get(userId);
  if (!(user as any)?.isAdmin) {
    throw new Error("Admin access required");
  }
  
  return userId;
}

export const getAllOrders = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await isAdmin(ctx);
    
    if (args.status) {
      return await ctx.db
        .query("orders")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    }
    
    return await ctx.db.query("orders").order("desc").collect();
  },
});

export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await isAdmin(ctx);
    
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }
    
    await ctx.db.patch(args.orderId, { status: args.status });
    
    // Send email notification to customer
    const user = await ctx.db.get(order.userId);
    if (user?.email) {
      await ctx.scheduler.runAfter(0, api.notifications.sendOrderStatusEmail, {
        email: user.email,
        orderId: args.orderId,
        status: args.status,
        orderTotal: order.total,
      });
    }
    
    return order;
  },
});

export const getOrderStats = query({
  args: {},
  handler: async (ctx) => {
    await isAdmin(ctx);
    
    const orders = await ctx.db.query("orders").collect();
    const products = await ctx.db.query("products").collect();
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === "pending" || o.status === "paid").length;
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.stock < 10).length;
    
    return {
      totalRevenue,
      totalOrders,
      pendingOrders,
      totalProducts,
      lowStockProducts,
    };
  },
});

export const makeUserAdmin = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await isAdmin(ctx);
    
    await ctx.db.patch(args.userId, { isAdmin: true } as any);
    return "User promoted to admin";
  },
});

// Helper function to make the first user admin (for testing)
export const makeFirstUserAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").take(1);
    if (users.length > 0) {
      await ctx.db.patch(users[0]._id, { isAdmin: true } as any);
      return `Made user ${users[0].email || users[0].name || users[0]._id} an admin`;
    }
    return "No users found";
  },
});

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    await isAdmin(ctx);
    
    return await ctx.db.query("users").collect();
  },
});

export const addProductByAdmin = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    imageUrl: v.string(),
    category: v.string(),
    stock: v.number(),
    featured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await isAdmin(ctx);
    return await createProduct(ctx, args);
  },
});
