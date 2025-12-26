#!/usr/bin/env node

/**
 * Data Sync Script
 * 
 * This script helps sync data between local and production Convex environments.
 * 
 * Usage:
 *   node scripts/sync-data.js export local > data.json
 *   node scripts/sync-data.js import production < data.json
 *   node scripts/sync-data.js sync local production
 */

const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

const ENVIRONMENTS = {
  local: {
    name: "local",
    description: "Local development environment",
  },
  production: {
    name: "production",
    description: "Production environment",
  },
}

function runConvexCommand(command, env = "local") {
  try {
    const envFlag = env === "production" ? "--prod" : ""
    const fullCommand = `npx convex ${command} ${envFlag}`.trim()
    console.log(`Running: ${fullCommand}`)
    return execSync(fullCommand, { encoding: "utf-8", stdio: "inherit" })
  } catch (error) {
    console.error(`Error running command: ${error.message}`)
    process.exit(1)
  }
}

function exportData(env) {
  console.log(`\n📤 Exporting data from ${env} environment...`)
  console.log("Note: You'll need to call the export function manually via Convex dashboard or API")
  console.log("\nTo export data, use one of these methods:")
  console.log("\n1. Via Convex Dashboard:")
  console.log(`   - Go to your ${env} Convex dashboard`)
  console.log("   - Open the Functions tab")
  console.log("   - Run: sync:exportOpportunities")
  console.log("\n2. Via API (create a temporary script):")
  console.log("   const { ConvexHttpClient } = require('convex/browser')")
  console.log(`   const client = new ConvexHttpClient('${process.env.NEXT_PUBLIC_CONVEX_URL || 'YOUR_CONVEX_URL'}')`)
  console.log("   const data = await client.query(api.sync.exportOpportunities, {})")
  console.log("   console.log(JSON.stringify(data, null, 2))")
}

function importData(env, filePath) {
  console.log(`\n📥 Importing data to ${env} environment...`)
  
  if (!filePath || !fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`)
    process.exit(1)
  }
  
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"))
  console.log(`Found ${data.length} opportunities to import`)
  
  console.log("\nTo import data, use one of these methods:")
  console.log("\n1. Via Convex Dashboard:")
  console.log(`   - Go to your ${env} Convex dashboard`)
  console.log("   - Open the Functions tab")
  console.log(`   - Run: sync:importOpportunities with args: { opportunities: [...], mode: "merge" }`)
  console.log("\n2. Create a temporary import script (see DATA_SYNC.md for details)")
}

function syncEnvironments(sourceEnv, targetEnv) {
  console.log(`\n🔄 Syncing data from ${sourceEnv} to ${targetEnv}...`)
  console.log("\nThis is a two-step process:")
  console.log(`1. Export from ${sourceEnv}: node scripts/sync-data.js export ${sourceEnv} > data.json`)
  console.log(`2. Import to ${targetEnv}: node scripts/sync-data.js import ${targetEnv} data.json`)
}

function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  const env = args[1]
  const filePath = args[2]

  if (!command) {
    console.log(`
Data Sync Script for Convex

Usage:
  node scripts/sync-data.js <command> [environment] [file]

Commands:
  export <env>          Export data from environment (local/production)
  import <env> <file>   Import data to environment from JSON file
  sync <source> <target> Show instructions for syncing between environments

Environments:
  local       Local development environment
  production  Production environment

Examples:
  # Export from local
  node scripts/sync-data.js export local

  # Import to production
  node scripts/sync-data.js import production data.json

  # Get sync instructions
  node scripts/sync-data.js sync local production
`)
    process.exit(0)
  }

  if (command === "export") {
    if (!env || !ENVIRONMENTS[env]) {
      console.error(`Error: Invalid environment. Use 'local' or 'production'`)
      process.exit(1)
    }
    exportData(env)
  } else if (command === "import") {
    if (!env || !ENVIRONMENTS[env]) {
      console.error(`Error: Invalid environment. Use 'local' or 'production'`)
      process.exit(1)
    }
    if (!filePath) {
      console.error(`Error: Please provide a JSON file path`)
      process.exit(1)
    }
    importData(env, filePath)
  } else if (command === "sync") {
    const sourceEnv = args[1]
    const targetEnv = args[2]
    if (!sourceEnv || !targetEnv || !ENVIRONMENTS[sourceEnv] || !ENVIRONMENTS[targetEnv]) {
      console.error(`Error: Please provide valid source and target environments`)
      process.exit(1)
    }
    syncEnvironments(sourceEnv, targetEnv)
  } else {
    console.error(`Error: Unknown command: ${command}`)
    process.exit(1)
  }
}

main()

