import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

/**
 * Export all opportunities data for syncing between environments
 * This returns all opportunities in a format that can be imported
 */
export const exportOpportunities = query({
  args: {},
  handler: async (ctx) => {
    const opportunities = await ctx.db.query("opportunities").collect()
    
    // Return data without _id (will be regenerated on import)
    return opportunities.map((opp) => ({
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
      archivedBy: opp.archivedBy,
    }))
  },
})

/**
 * Bulk import opportunities from another environment
 * This will create new opportunities or update existing ones based on a unique identifier
 */
export const importOpportunities = mutation({
  args: {
    opportunities: v.array(
      v.object({
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
        regions: v.optional(v.array(v.string())),
        fundingTypes: v.optional(v.array(v.string())),
        eligibility: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
        verifiedAt: v.optional(v.number()),
        archivedAt: v.optional(v.number()),
        createdBy: v.string(),
        archivedBy: v.optional(v.string()),
      })
    ),
    mode: v.optional(v.union(v.literal("replace"), v.literal("merge"), v.literal("append"))),
  },
  handler: async (ctx, args) => {
    const mode = args.mode || "merge"
    const now = Date.now()
    
    // If replace mode, clear all existing opportunities first
    if (mode === "replace") {
      const existing = await ctx.db.query("opportunities").collect()
      for (const opp of existing) {
        await ctx.db.delete(opp._id)
      }
    }
    
    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
    }
    
    for (const oppData of args.opportunities) {
      try {
        if (mode === "merge") {
          // Try to find existing opportunity by title and provider (unique identifier)
          const existing = await ctx.db
            .query("opportunities")
            .filter((q) => q.eq(q.field("title"), oppData.title))
            .filter((q) => q.eq(q.field("provider"), oppData.provider))
            .first()
          
          if (existing) {
            // Update existing
            await ctx.db.patch(existing._id, {
              ...oppData,
              updatedAt: now,
            })
            results.updated++
          } else {
            // Create new
            await ctx.db.insert("opportunities", {
              ...oppData,
              updatedAt: now,
            })
            results.created++
          }
        } else {
          // Append mode - always create new
          await ctx.db.insert("opportunities", {
            ...oppData,
            updatedAt: now,
          })
          results.created++
        }
      } catch (error) {
        results.errors.push(`Failed to import ${oppData.title}: ${error instanceof Error ? error.message : "Unknown error"}`)
        results.skipped++
      }
    }
    
    return results
  },
})

/**
 * Sync opportunities - compares and syncs differences
 * This is a helper that can be used to ensure both environments have the same data
 */
export const syncOpportunities = mutation({
  args: {
    sourceOpportunities: v.array(
      v.object({
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
        regions: v.optional(v.array(v.string())),
        fundingTypes: v.optional(v.array(v.string())),
        eligibility: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
        verifiedAt: v.optional(v.number()),
        archivedAt: v.optional(v.number()),
        createdBy: v.string(),
        archivedBy: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("opportunities").collect()
    const now = Date.now()
    
    // Create a map of existing opportunities by title+provider
    const existingMap = new Map<string, typeof existing[0]>()
    for (const opp of existing) {
      const key = `${opp.title}::${opp.provider}`
      existingMap.set(key, opp)
    }
    
    const results = {
      created: 0,
      updated: 0,
      unchanged: 0,
      errors: [] as string[],
    }
    
    // Process source opportunities
    for (const sourceOpp of args.sourceOpportunities) {
      const key = `${sourceOpp.title}::${sourceOpp.provider}`
      const existingOpp = existingMap.get(key)
      
      try {
        if (existingOpp) {
          // Check if update is needed (compare updatedAt)
          if (sourceOpp.updatedAt > existingOpp.updatedAt) {
            await ctx.db.patch(existingOpp._id, {
              ...sourceOpp,
              updatedAt: now,
            })
            results.updated++
          } else {
            results.unchanged++
          }
        } else {
          // Create new
          await ctx.db.insert("opportunities", {
            ...sourceOpp,
            updatedAt: now,
          })
          results.created++
        }
      } catch (error) {
        results.errors.push(`Failed to sync ${sourceOpp.title}: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    }
    
    return results
  },
})

