/**
 * Fetches favicon URL from a website URL
 * Uses Google's favicon service as primary, with fallbacks
 */
export async function getFaviconUrl(websiteUrl: string): Promise<string> {
  try {
    // Extract domain from URL
    let domain: string
    try {
      const url = new URL(websiteUrl)
      domain = url.hostname.replace("www.", "")
    } catch {
      // If URL parsing fails, try to extract domain manually
      const match = websiteUrl.match(/(?:https?:\/\/)?(?:www\.)?([^\/]+)/)
      if (!match) throw new Error("Invalid URL")
      domain = match[1]
    }

    // Try Google's favicon service first (most reliable)
    const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    
    // Verify the favicon exists by checking if the request succeeds
    try {
      const response = await fetch(googleFaviconUrl, { method: "HEAD", mode: "no-cors" })
      // If we can't verify (CORS), we'll still use it as it's generally reliable
      return googleFaviconUrl
    } catch {
      // Fallback to direct favicon.ico
      try {
        const url = new URL(websiteUrl)
        const faviconUrl = `${url.protocol}//${url.hostname}/favicon.ico`
        return faviconUrl
      } catch {
        return googleFaviconUrl
      }
    }
  } catch (error) {
    console.error("Error fetching favicon:", error)
    // Return Google's favicon service URL as fallback (it usually works)
    try {
      const match = websiteUrl.match(/(?:https?:\/\/)?(?:www\.)?([^\/]+)/)
      if (match) {
        return `https://www.google.com/s2/favicons?domain=${match[1]}&sz=64`
      }
    } catch {
      // Final fallback
    }
    return `https://www.google.com/s2/favicons?domain=example.com&sz=64`
  }
}

/**
 * Synchronous version that returns a favicon URL without verification
 * Useful for immediate display while async fetch happens
 */
export function getFaviconUrlSync(websiteUrl: string): string {
  try {
    const url = new URL(websiteUrl)
    const domain = url.hostname.replace("www.", "")
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
  } catch {
    try {
      const match = websiteUrl.match(/(?:https?:\/\/)?(?:www\.)?([^\/]+)/)
      if (match) {
        return `https://www.google.com/s2/favicons?domain=${match[1]}&sz=64`
      }
    } catch {
      // Ignore
    }
    return ""
  }
}

