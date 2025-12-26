import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

// Check if email is admin
export const isAdmin = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first()
    return !!admin && admin.isActive
  },
})

// Add admin (secure operation - should only be called by existing admins)
export const add = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("editor"), v.literal("manager"), v.literal("admin")),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    // TODO: Add auth verification here
    const existing = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first()

    if (existing) {
      // Reactivate if deactivated
      await ctx.db.patch(existing._id, { 
        isActive: args.isActive,
        role: args.role,
      })
      return existing._id
    }

    const id = await ctx.db.insert("admins", {
      email: args.email,
      name: args.name,
      role: args.role,
      createdAt: Date.now(),
      isActive: args.isActive,
    })
    return id
  },
})

// List admins
export const list = query({
  handler: async (ctx) => {
    // TODO: Add auth verification
    return await ctx.db.query("admins").collect()
  },
})

// Deactivate admin
export const deactivate = mutation({
  args: { 
    id: v.id("admins"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    // TODO: Add auth verification
    const existing = await ctx.db.get(args.id)
    if (!existing) throw new Error("Admin not found")
    await ctx.db.patch(args.id, { isActive: args.isActive })
    return args.id
  },
})
