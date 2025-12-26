import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

// Store opportunity submissions for admin review
export const create = mutation({
  args: {
    opportunityName: v.string(),
    opportunityType: v.string(),
    description: v.string(),
    link: v.string(),
    userName: v.optional(v.string()),
    userTwitter: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("submissions", {
      opportunityName: args.opportunityName,
      opportunityType: args.opportunityType,
      description: args.description,
      link: args.link,
      userName: args.userName,
      userTwitter: args.userTwitter,
      status: args.status,
      createdAt: Date.now(),
      reviewedAt: undefined,
    })
    return id
  },
})

// Query all submissions
export const list = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let submissions = await ctx.db.query("submissions").collect()

    if (args.status) {
      submissions = submissions.filter((s) => s.status === args.status)
    }

    return submissions.sort((a, b) => b.createdAt - a.createdAt)
  },
})

// Update submission status
export const updateStatus = mutation({
  args: {
    id: v.id("submissions"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      reviewedAt: Date.now(),
    })
    return args.id
  },
})
