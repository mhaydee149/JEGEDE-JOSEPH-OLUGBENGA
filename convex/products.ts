import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    category: v.optional(v.string()),
    featured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.category !== undefined) {
      return await ctx.db
        .query("products")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    } else if (args.featured !== undefined) {
      return await ctx.db
        .query("products")
        .withIndex("by_featured", (q) => q.eq("featured", args.featured!))
        .collect();
    }
    
    return await ctx.db.query("products").collect();
  },
});

export const get = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    const categories = [...new Set(products.map(p => p.category))];
    return categories;
  },
});

// Admin function to add products (in a real app, this would be protected)
export const create = mutation({
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
    return await ctx.db.insert("products", args);
  },
});

export const seedProducts = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if products already exist
    const existingProducts = await ctx.db.query("products").take(1);
    if (existingProducts.length > 0) {
      return "Products already seeded";
    }

    const sampleProducts = [
      {
        name: "Wireless Headphones",
        description: "Premium noise-canceling wireless headphones with 30-hour battery life.",
        price: 199.99,
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
        category: "Electronics",
        stock: 50,
        featured: true,
      },
      {
        name: "Smart Watch",
        description: "Advanced fitness tracking smartwatch with heart rate monitor.",
        price: 299.99,
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
        category: "Electronics",
        stock: 30,
        featured: true,
      },
      {
        name: "Coffee Mug",
        description: "Ceramic coffee mug with ergonomic handle and heat retention.",
        price: 24.99,
        imageUrl: "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=400",
        category: "Home",
        stock: 100,
        featured: false,
      },
      {
        name: "Laptop Backpack",
        description: "Durable laptop backpack with multiple compartments and USB charging port.",
        price: 79.99,
        imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
        category: "Accessories",
        stock: 25,
        featured: false,
      },
      {
        name: "Bluetooth Speaker",
        description: "Portable waterproof Bluetooth speaker with 360-degree sound.",
        price: 89.99,
        imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400",
        category: "Electronics",
        stock: 40,
        featured: true,
      },
      {
        name: "Yoga Mat",
        description: "Non-slip yoga mat with alignment lines and carrying strap.",
        price: 39.99,
        imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400",
        category: "Fitness",
        stock: 60,
        featured: false,
      },
    ];

    for (const product of sampleProducts) {
      await ctx.db.insert("products", product);
    }

    return "Products seeded successfully";
  },
});
