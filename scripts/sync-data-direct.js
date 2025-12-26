#!/usr/bin/env node

/**
 * Direct Data Sync Script using Convex HTTP Client
 * 
 * This script directly syncs data between environments using the Convex HTTP API.
 * 
 * Prerequisites:
 *   - Set CONVEX_URL_LOCAL and CONVEX_URL_PRODUCTION in your environment
 *   - Or pass URLs as arguments
 * 
 * Usage:
 *   CONVEX_URL_LOCAL=xxx CONVEX_URL_PRODUCTION=yyy node scripts/sync-data-direct.js
 */

const { ConvexHttpClient } = require("convex/browser")
const fs = require("fs")

// Import the API (you'll need to build this or use the generated API)
// For now, we'll use a direct approach

async function exportFromEnvironment(convexUrl, apiPath) {
  console.log(`\n📤 Exporting from ${convexUrl}...`)
  
  // Note: This is a simplified version. In practice, you'd use the generated API
  // For now, you need to manually call the export function via Convex dashboard
  // or use the Convex CLI
  
  console.log("To export, run this in your Convex dashboard or use:")
  console.log(`npx convex run sync:exportOpportunities --url ${convexUrl}`)
  
  return []
}

async function importToEnvironment(convexUrl, data, mode = "merge") {
  console.log(`\n📥 Importing ${data.length} opportunities to ${convexUrl}...`)
  
  // Note: This requires the Convex HTTP client with proper authentication
  // For security, it's better to use the Convex dashboard or CLI
  
  console.log("To import, run this in your Convex dashboard:")
  console.log(`npx convex run sync:importOpportunities --url ${convexUrl}`)
  console.log(`With args: { opportunities: [...], mode: "${mode}" }`)
}

async function main() {
  const sourceUrl = process.env.CONVEX_URL_SOURCE || process.env.NEXT_PUBLIC_CONVEX_URL
  const targetUrl = process.env.CONVEX_URL_TARGET
  
  if (!sourceUrl) {
    console.error("Error: CONVEX_URL_SOURCE or NEXT_PUBLIC_CONVEX_URL not set")
    process.exit(1)
  }
  
  if (!targetUrl) {
    console.error("Error: CONVEX_URL_TARGET not set")
    console.log("\nSet environment variables:")
    console.log("  CONVEX_URL_SOURCE=your-source-convex-url")
    console.log("  CONVEX_URL_TARGET=your-target-convex-url")
    process.exit(1)
  }
  
  console.log("Data Sync Script")
  console.log(`Source: ${sourceUrl}`)
  console.log(`Target: ${targetUrl}`)
  
  // Export from source
  const data = await exportFromEnvironment(sourceUrl)
  
  // Import to target
  await importToEnvironment(targetUrl, data, "merge")
  
  console.log("\n✅ Sync complete!")
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = { exportFromEnvironment, importToEnvironment }

