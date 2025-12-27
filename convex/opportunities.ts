import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

// Query all opportunities
export const list = query({
  args: {
    status: v.optional(v.union(v.literal("all"), v.literal("active"), v.literal("inactive"), v.literal("archived"))),
    search: v.optional(v.string()),
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let opportunities = await ctx.db.query("opportunities").collect()

    // Filter by status
    if (args.status && args.status !== "all") {
      if (args.status === "archived") {
        // For archived, filter by archivedAt instead of status
        opportunities = opportunities.filter((opp) => !!opp.archivedAt)
      } else {
        // For active/inactive, filter by status and exclude archived
        opportunities = opportunities.filter((opp) => opp.status === args.status && !opp.archivedAt)
      }
    } else {
      // For "all", filter out archived opportunities unless explicitly requested
      if (!args.includeArchived) {
        opportunities = opportunities.filter((opp) => !opp.archivedAt)
      }
    }

    // Filter by search query
    if (args.search) {
      const query = args.search.toLowerCase()
      opportunities = opportunities.filter(
        (opp) =>
          opp.title.toLowerCase().includes(query) ||
          opp.provider.toLowerCase().includes(query) ||
          opp.description.toLowerCase().includes(query),
      )
    }

    // Sort by deadline (nearest first)
    opportunities.sort((a, b) => a.deadline - b.deadline)

    return opportunities.map((opp) => ({
      _id: opp._id,
      title: opp.title,
      description: opp.description,
      description_full: opp.description_full,
      provider: opp.provider,
      logoUrl: opp.logoUrl,
      categoryTags: opp.categoryTags,
      applicableGroups: opp.applicableGroups,
      applyUrl: opp.applyUrl,
      deadline: opp.deadline,
      status: opp.status,
      regions: opp.regions,
      fundingTypes: opp.fundingTypes,
      eligibility: opp.eligibility,
      createdAt: opp.createdAt,
      updatedAt: opp.updatedAt,
      verifiedAt: opp.verifiedAt,
      archivedAt: opp.archivedAt,
      createdBy: opp.createdBy,
    }))
  },
})

// Query single opportunity
export const get = query({
  args: { id: v.id("opportunities") },
  handler: async (ctx, args) => {
    const opp = await ctx.db.get(args.id)
    if (!opp) return null
    return {
      _id: opp._id,
      title: opp.title,
      description: opp.description,
      description_full: opp.description_full,
      provider: opp.provider,
      logoUrl: opp.logoUrl,
      categoryTags: opp.categoryTags,
      applicableGroups: opp.applicableGroups,
      applyUrl: opp.applyUrl,
      deadline: opp.deadline,
      status: opp.status,
      regions: opp.regions,
      fundingTypes: opp.fundingTypes,
      eligibility: opp.eligibility,
      createdAt: opp.createdAt,
      updatedAt: opp.updatedAt,
      verifiedAt: opp.verifiedAt,
      archivedAt: opp.archivedAt,
      createdBy: opp.createdBy,
    }
  },
})

// Create opportunity
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    description_full: v.string(),
    provider: v.string(),
    logoUrl: v.string(),
    categoryTags: v.array(v.string()),
    applicableGroups: v.array(v.string()),
    applyUrl: v.string(),
    deadline: v.number(),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("archived")),
    regions: v.array(v.string()),
    fundingTypes: v.array(v.string()),
    eligibility: v.string(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const id = await ctx.db.insert("opportunities", {
      ...args,
      deadline: args.deadline,
      createdAt: now,
      updatedAt: now,
      createdBy: args.createdBy,
    })
    return id
  },
})

// Update opportunity
export const update = mutation({
  args: {
    id: v.id("opportunities"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    description_full: v.optional(v.string()),
    provider: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    categoryTags: v.optional(v.array(v.string())),
    applicableGroups: v.optional(v.array(v.string())),
    applyUrl: v.optional(v.string()),
    deadline: v.optional(v.number()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("archived"))),
    verifiedAt: v.optional(v.number()),
    regions: v.optional(v.array(v.string())),
    fundingTypes: v.optional(v.array(v.string())),
    eligibility: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args
    const existing = await ctx.db.get(id)
    if (!existing) throw new Error("Opportunity not found")

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    })
    return id
  },
})

// Archive opportunity instead of hard delete
export const archive = mutation({
  args: { 
    id: v.id("opportunities"), 
    adminId: v.string(),
    adminEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id)
    if (!existing) throw new Error("Opportunity not found")

    const now = Date.now()
    await ctx.db.patch(args.id, {
      archivedAt: now,
      archivedBy: args.adminId,
      status: "archived",
      updatedAt: now,
    })

    // Log the action
    await ctx.db.insert("auditLog", {
      adminId: args.adminId,
      adminEmail: args.adminEmail || args.adminId,
      action: "archived",
      resourceType: "opportunity",
      resourceId: args.id.toString(),
      changes: { archivedAt: now },
      timestamp: now,
    })

    return args.id
  },
})

// Unarchive opportunity
export const unarchive = mutation({
  args: { 
    id: v.id("opportunities"), 
    adminId: v.string(),
    adminEmail: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id)
    if (!existing) throw new Error("Opportunity not found")

    const now = Date.now()
    await ctx.db.patch(args.id, {
      archivedAt: undefined,
      archivedBy: undefined,
      status: args.status || "inactive",
      updatedAt: now,
    })

    await ctx.db.insert("auditLog", {
      adminId: args.adminId,
      adminEmail: args.adminEmail || args.adminId,
      action: "unarchived",
      resourceType: "opportunity",
      resourceId: args.id.toString(),
      changes: { archivedAt: null },
      timestamp: now,
    })

    return args.id
  },
})

// Duplicate opportunity
export const duplicate = mutation({
  args: {
    id: v.id("opportunities"),
    adminId: v.string(),
    adminEmail: v.optional(v.string()),
    titleSuffix: v.string(),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("archived")),
  },
  handler: async (ctx, args) => {
    const original = await ctx.db.get(args.id)
    if (!original) throw new Error("Opportunity not found")

    const now = Date.now()
    const newId = await ctx.db.insert("opportunities", {
      title: `${original.title}${args.titleSuffix}`,
      description: original.description,
      description_full: original.description_full,
      provider: original.provider,
      logoUrl: original.logoUrl,
      categoryTags: original.categoryTags,
      applicableGroups: original.applicableGroups,
      applyUrl: original.applyUrl,
      deadline: original.deadline,
      status: args.status,
      regions: original.regions,
      fundingTypes: original.fundingTypes,
      eligibility: original.eligibility,
      createdAt: now,
      updatedAt: now,
      createdBy: args.adminId,
    })

    await ctx.db.insert("auditLog", {
      adminId: args.adminId,
      adminEmail: args.adminEmail || args.adminId,
      action: "duplicated",
      resourceType: "opportunity",
      resourceId: newId.toString(),
      changes: { duplicatedFrom: args.id.toString() },
      timestamp: now,
    })

    return newId
  },
})

// Verify opportunity
export const verify = mutation({
  args: { id: v.id("opportunities") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id)
    if (!existing) throw new Error("Opportunity not found")
    await ctx.db.patch(args.id, {
      verifiedAt: Date.now(),
      updatedAt: Date.now(),
    })
    return args.id
  },
})

// Batch update status
export const updateStatus = mutation({
  args: {
    id: v.id("opportunities"),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("archived")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id)
    if (!existing) throw new Error("Opportunity not found")
    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    })
    return args.id
  },
})

// Hard delete opportunity (permanently remove from database)
export const hardDelete = mutation({
  args: {
    id: v.id("opportunities"),
    adminId: v.string(),
    adminEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id)
    if (!existing) throw new Error("Opportunity not found")

    // Log the action before deletion
    await ctx.db.insert("auditLog", {
      adminId: args.adminId,
      adminEmail: args.adminEmail || args.adminId,
      action: "deleted",
      resourceType: "opportunity",
      resourceId: args.id.toString(),
      changes: { deleted: true, title: existing.title, provider: existing.provider },
      timestamp: Date.now(),
    })

    // Permanently delete the opportunity
    await ctx.db.delete(args.id)
    return args.id
  },
})
