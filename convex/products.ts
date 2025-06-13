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
      {
        name: "Organic Green Tea",
        description: "Premium quality organic green tea leaves, rich in antioxidants.",
        price: 15.99,
        imageUrl: "https://images.unsplash.com/photo-1576092762791-d07c199f14e3?w=400",
        category: "Groceries",
        stock: 120,
        featured: false,
      },
      {
        name: "Stainless Steel Water Bottle",
        description: "Insulated stainless steel water bottle, keeps drinks cold for 24 hours.",
        price: 29.99,
        imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400",
        category: "Accessories",
        stock: 75,
        featured: true,
      },
      {
        name: "Novel - \"The Last Adventure\"",
        description: "A thrilling fantasy novel about a quest to save a magical kingdom.",
        price: 12.99,
        imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
        category: "Books",
        stock: 90,
        featured: false,
      },
      {
        name: "Desk Lamp",
        description: "Modern LED desk lamp with adjustable brightness and color temperature.",
        price: 45.50,
        imageUrl: "https://images.unsplash.com/photo-1507436300770-0517003ffeea?w=400",
        category: "Home",
        stock: 35,
        featured: true,
      },
      {
        name: "Running Shoes",
        description: "Lightweight and comfortable running shoes for men and women.",
        price: 120.00,
        imageUrl: "https://images.unsplash.com/photo-1460353581680-5185aa298a69?w=400",
        category: "Fitness",
        stock: 55,
        featured: true,
      },
      {
        name: "Smartphone Tripod",
        description: "Extendable smartphone tripod with remote shutter.",
        price: 22.00,
        imageUrl: "https://images.unsplash.com/photo-1575024357670-2b5164f470c3?w=400",
        category: "Electronics",
        stock: 40,
        featured: false,
      },
      {
        name: "Wall Art Print",
        description: "Abstract art print for modern home decor, 24x36 inches.",
        price: 65.00,
        imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400",
        category: "Home",
        stock: 20,
        featured: true,
      },
      {
        name: "Leather Wallet",
        description: "Genuine leather wallet with multiple card slots and RFID blocking.",
        price: 55.99,
        imageUrl: "https://images.unsplash.com/photo-1601850494438-7cf07ba9540b?w=400",
        category: "Accessories",
        stock: 60,
        featured: false,
      },
      {
        name: "Gaming Mouse",
        description: "Ergonomic gaming mouse with customizable RGB lighting and programmable buttons.",
        price: 49.99,
        imageUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400",
        category: "Electronics",
        stock: 30,
        featured: true,
      },
      {
        name: "Scented Candle",
        description: "Lavender scented soy wax candle for relaxation and stress relief.",
        price: 18.00,
        imageUrl: "https://images.unsplash.com/photo-1600070352486-90919fe80095?w=400",
        category: "Home",
        stock: 80,
        featured: false,
      },
      {
        name: "Sketchbook",
        description: "A5 sketchbook with 100 blank pages, perfect for drawing and doodling.",
        price: 9.99,
        imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400",
        category: "Stationery",
        stock: 150,
        featured: false,
      },
      {
        name: "Travel Pillow",
        description: "Memory foam neck pillow for comfortable travel.",
        price: 25.00,
        imageUrl: "https://images.unsplash.com/photo-1578852642079-80a88970192b?w=400",
        category: "Accessories",
        stock: 45,
        featured: true,
      },
      {
        name: "Fitness Tracker",
        description: "Water-resistant fitness tracker with sleep monitoring and step counter.",
        price: 75.00,
        imageUrl: "https://images.unsplash.com/photo-1526627326359-594e71736510?w=400",
        category: "Fitness",
        stock: 50,
        featured: false,
      },
      {
        name: "Portable Charger",
        description: "High-capacity portable charger with fast charging technology.",
        price: 35.99,
        imageUrl: "https://images.unsplash.com/photo-1588853639417-eaff047f139a?w=400",
        category: "Electronics",
        stock: 70,
        featured: true,
      }
    ];

    for (const product of sampleProducts) {
      await ctx.db.insert("products", product);
    }

    return "Products seeded successfully";
  },
});
