import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  products: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    imageUrl: v.string(),
    category: v.string(),
    stock: v.number(),
    featured: v.optional(v.boolean()),
  }).index("by_category", ["category"])
    .index("by_featured", ["featured"]),

  cartItems: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    quantity: v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_and_product", ["userId", "productId"]),

  orders: defineTable({
    userId: v.id("users"),
    items: v.array(v.object({
      productId: v.id("products"),
      productName: v.string(),
      price: v.number(),
      quantity: v.number(),
    })),
    total: v.number(),
    status: v.string(), // "pending", "paid", "processing", "shipped", "delivered"
    paymentIntentId: v.optional(v.string()),
    shippingAddress: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
    }),
  }).index("by_user", ["userId"])
    .index("by_status", ["status"]),

  trackingEvents: defineTable({
    orderId: v.id("orders"),
    status: v.string(),
    description: v.string(),
    location: v.optional(v.string()),
  }).index("by_order", ["orderId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
