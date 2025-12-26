"use client"

import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Loader2, Download, Upload, RefreshCw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function DataSyncPanel() {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importData, setImportData] = useState("")
  const [result, setResult] = useState<{
    type: "success" | "error"
    message: string
    details?: any
  } | null>(null)

  const exportData = useQuery(api.sync.exportOpportunities)
  const importMutation = useMutation(api.sync.importOpportunities)
  const syncMutation = useMutation(api.sync.syncOpportunities)

  const handleExport = async () => {
    setIsExporting(true)
    setResult(null)
    try {
      if (!exportData) {
        throw new Error("No data available to export")
      }
      
      const jsonData = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonData], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `opportunities-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      setResult({
        type: "success",
        message: `Exported ${exportData.length} opportunities successfully`,
        details: { count: exportData.length },
      })
    } catch (error) {
      setResult({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to export data",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async (mode: "merge" | "replace" | "append" = "merge") => {
    if (!importData.trim()) {
      setResult({
        type: "error",
        message: "Please paste JSON data to import",
      })
      return
    }

    setIsImporting(true)
    setResult(null)

    try {
      const data = JSON.parse(importData)
      const opportunities = Array.isArray(data) ? data : data.opportunities || []

      if (!Array.isArray(opportunities) || opportunities.length === 0) {
        throw new Error("Invalid data format. Expected an array of opportunities.")
      }

      const result = await importMutation({
        opportunities,
        mode,
      })

      setResult({
        type: "success",
        message: `Import completed: ${result.created} created, ${result.updated} updated, ${result.skipped} skipped`,
        details: result,
      })

      // Clear import data
      setImportData("")
    } catch (error) {
      setResult({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to import data",
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setImportData(text)
      setResult({
        type: "success",
        message: "Data pasted from clipboard",
      })
    } catch (error) {
      setResult({
        type: "error",
        message: "Failed to read from clipboard. Please paste manually.",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Data Synchronization
          </CardTitle>
          <CardDescription>
            Export and import opportunities data to sync between local and production environments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Export Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Data
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                Export all opportunities from this environment as JSON. You can then import this into another environment.
              </p>
              <div className="flex items-center gap-2">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleExport}
                    disabled={isExporting || !exportData}
                    className="cursor-pointer"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Export Opportunities
                      </>
                    )}
                  </Button>
                </motion.div>
                {exportData && (
                  <span className="text-xs text-muted-foreground">
                    ({exportData.length} opportunities available)
                  </span>
                )}
              </div>
            </div>

            {/* Import Section */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Import Data
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                Paste JSON data from another environment to import opportunities.
              </p>
              
              <div className="space-y-3">
                <div className="flex gap-2">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePasteFromClipboard}
                      className="cursor-pointer"
                    >
                      Paste from Clipboard
                    </Button>
                  </motion.div>
                </div>
                
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder='Paste JSON data here, e.g., [{"title": "...", "provider": "..."}] or {"opportunities": [...]}'
                  className="w-full min-h-[200px] px-3 py-2 border border-border rounded-md text-sm font-mono bg-muted/30 focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none"
                />
                
                <div className="flex gap-2">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => handleImport("merge")}
                      disabled={isImporting || !importData.trim()}
                      variant="default"
                      className="cursor-pointer"
                    >
                      {isImporting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Import (Merge)
                        </>
                      )}
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => handleImport("append")}
                      disabled={isImporting || !importData.trim()}
                      variant="outline"
                      className="cursor-pointer"
                    >
                      Append
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => {
                        if (confirm("⚠️ Replace mode will DELETE all existing opportunities. Are you sure?")) {
                          handleImport("replace")
                        }
                      }}
                      disabled={isImporting || !importData.trim()}
                      variant="destructive"
                      className="cursor-pointer"
                    >
                      Replace (⚠️)
                    </Button>
                  </motion.div>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  <strong>Merge:</strong> Updates existing, creates new • <strong>Append:</strong> Always creates new • <strong>Replace:</strong> Deletes all, then imports
                </p>
              </div>
            </div>

            {/* Result Display */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 rounded-md border flex gap-3 ${
                    result.type === "success"
                      ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900"
                      : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900"
                  }`}
                >
                  {result.type === "success" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        result.type === "success"
                          ? "text-green-800 dark:text-green-200"
                          : "text-red-800 dark:text-red-200"
                      }`}
                    >
                      {result.message}
                    </p>
                    {result.details && (
                      <pre className="text-xs mt-2 text-muted-foreground overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    )}
                  </div>
                  <button
                    onClick={() => setResult(null)}
                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    ×
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

