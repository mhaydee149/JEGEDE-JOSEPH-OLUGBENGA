"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

const resend = new Resend(process.env.CONVEX_RESEND_API_KEY);

export const sendOrderStatusEmail = action({
  args: {
    email: v.string(),
    orderId: v.id("orders"),
    status: v.string(),
    orderTotal: v.number(),
  },
  handler: async (ctx, args) => {
    const statusMessages = {
      paid: "Your payment has been confirmed!",
      processing: "Your order is being processed.",
      shipped: "Your order has been shipped!",
      delivered: "Your order has been delivered.",
    };

    const subject = `Order Update: ${statusMessages[args.status as keyof typeof statusMessages] || "Status Updated"}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">ShopHub Order Update</h1>
        <p>Hello!</p>
        <p>Your order #${args.orderId.slice(-8)} has been updated.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin: 0 0 10px 0;">Order Status: ${args.status.toUpperCase()}</h2>
          <p style="margin: 0;">${statusMessages[args.status as keyof typeof statusMessages] || "Your order status has been updated."}</p>
        </div>
        <p><strong>Order Total:</strong> $${args.orderTotal.toFixed(2)}</p>
        <p>Thank you for shopping with ShopHub!</p>
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply.</p>
      </div>
    `;

    try {
      const { data, error } = await resend.emails.send({
        from: "ShopHub <orders@shophub.example.com>",
        to: args.email,
        subject,
        html,
      });

      if (error) {
        throw new Error(`Failed to send email: ${JSON.stringify(error)}`);
      }

      return data;
    } catch (error) {
      console.error("Email sending failed:", error);
      throw error;
    }
  },
});

export const sendWelcomeEmail = action({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">Welcome to ShopHub!</h1>
        <p>Hello ${args.name || "there"}!</p>
        <p>Thank you for joining ShopHub. We're excited to have you as part of our community!</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin: 0 0 10px 0;">Get Started</h2>
          <p style="margin: 0;">Browse our featured products and start shopping today!</p>
        </div>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Happy shopping!</p>
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply.</p>
      </div>
    `;

    try {
      const { data, error } = await resend.emails.send({
        from: "ShopHub <welcome@shophub.example.com>",
        to: args.email,
        subject: "Welcome to ShopHub!",
        html,
      });

      if (error) {
        throw new Error(`Failed to send email: ${JSON.stringify(error)}`);
      }

      return data;
    } catch (error) {
      console.error("Welcome email failed:", error);
      throw error;
    }
  },
});
