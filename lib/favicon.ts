/**
 * Generates a data URL for a deterministic fallback favicon with domain initial
 * Uses the first alphabetic character of the domain name, white on black background
 */
function generatePlaceholderFavicon(domain: string): string {
  // Extract the first alphabetic character from the domain
  // Remove www. prefix if present, then get first letter
  const cleanDomain = domain.replace(/^www\./, "")
  const firstAlphabetic = cleanDomain.match(/[a-zA-Z]/)?.[0]?.toUpperCase() || "?"
  
  // Create a clean SVG favicon with white text on black background
  const svg = `<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" fill="#000000"/>
    <text x="32" y="42" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" 
          font-size="36" font-weight="bold" fill="#FFFFFF" 
          text-anchor="middle" dominant-baseline="middle">${firstAlphabetic}</text>
  </svg>`
  
  // Use encodeURIComponent for proper SVG encoding
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/**
 * Extracts domain from URL
 */
function extractDomain(websiteUrl: string): string | null {
  try {
    const url = new URL(websiteUrl)
    return url.hostname.replace("www.", "")
  } catch {
    const match = websiteUrl.match(/(?:https?:\/\/)?(?:www\.)?([^\/]+)/)
    return match ? match[1] : null
  }
}

/**
 * Known patterns for generic/invalid favicon URLs
 * These indicate that the favicon is a placeholder or default icon
 */
const GENERIC_FAVICON_PATTERNS = [
  /google\.com\/s2\/favicons/i,
  /favicon\.ico$/i,
  /default.*favicon/i,
  /placeholder/i,
]

/**
 * Checks if a favicon URL appears to be a generic placeholder
 */
function isGenericFaviconUrl(url: string): boolean {
  return GENERIC_FAVICON_PATTERNS.some(pattern => pattern.test(url))
}

/**
 * Validates if a favicon image is valid by checking:
 * - Image loads successfully
 * - Image is not empty (has content)
 * Uses image loading as the primary validation method
 */
async function validateFavicon(url: string): Promise<boolean> {
  try {
    // Use image loading as the primary validation method
    // This works even with CORS restrictions
    return new Promise((resolve) => {
      const img = new Image()
      let resolved = false
      
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true
          resolve(false)
        }
      }, 3000)
      
      img.onload = () => {
        if (!resolved) {
          resolved = true
          clearTimeout(timeout)
          // Image loaded successfully
          // Additional check: ensure image has dimensions (not a broken/empty image)
          if (img.width > 0 && img.height > 0) {
            resolve(true)
          } else {
            resolve(false)
          }
        }
      }
      
      img.onerror = () => {
        if (!resolved) {
          resolved = true
          clearTimeout(timeout)
          resolve(false)
        }
      }
      
      // Try without crossOrigin first (for same-origin requests)
      // If that fails, the error handler will catch it
      img.src = url
    })
  } catch (error) {
    // Any error means invalid favicon
    return false
  }
}

/**
 * Attempts to fetch a favicon from a website URL
 * Tries multiple strategies before falling back to generated initial-based favicon
 */
async function fetchFaviconUrl(websiteUrl: string): Promise<string | null> {
  const domain = extractDomain(websiteUrl)
  if (!domain) {
    return null
  }

  try {
    const url = new URL(websiteUrl)
    const baseUrl = `${url.protocol}//${url.hostname}`
    
    // Strategy 1: Try /favicon.ico (most common location)
    const faviconIcoUrl = `${baseUrl}/favicon.ico`
    const isValid1 = await validateFavicon(faviconIcoUrl)
    if (isValid1) {
      return faviconIcoUrl
    }
    
    // Strategy 2: Try /favicon.png
    const faviconPngUrl = `${baseUrl}/favicon.png`
    const isValid2 = await validateFavicon(faviconPngUrl)
    if (isValid2) {
      return faviconPngUrl
    }
    
    // Strategy 3: Try /apple-touch-icon.png (often available)
    const appleTouchIconUrl = `${baseUrl}/apple-touch-icon.png`
    const isValid3 = await validateFavicon(appleTouchIconUrl)
    if (isValid3) {
      return appleTouchIconUrl
    }
    
    // Strategy 4: Try to parse HTML for favicon link tags (more complex, skip for now)
    // If all strategies fail, return null to trigger fallback
    
    return null
  } catch (error) {
    // Invalid URL or other error
    return null
  }
}

/**
 * Gets favicon URL with deterministic fallback
 * Attempts to fetch actual favicon, falls back to generated initial-based favicon
 * This is the recommended function to use in components
 */
export async function getFaviconUrlWithFallback(websiteUrl: string): Promise<string> {
  const domain = extractDomain(websiteUrl)
  if (!domain) {
    return generatePlaceholderFavicon("?")
  }

  try {
    // Attempt to fetch a real favicon
    const faviconUrl = await fetchFaviconUrl(websiteUrl)
    
    if (faviconUrl) {
      // Double-check it's still valid (in case of race conditions)
      const isValid = await validateFavicon(faviconUrl)
      if (isValid) {
        return faviconUrl
      }
    }
    
    // Fall back to generated initial-based favicon
    return generatePlaceholderFavicon(domain)
  } catch (error) {
    // Any error means we use the generated fallback
    return generatePlaceholderFavicon(domain)
  }
}

/**
 * Synchronous version that returns a generated favicon immediately
 * Useful for instant display while async validation happens
 * Always returns the deterministic initial-based favicon
 */
export function getFaviconUrlSync(websiteUrl: string): string {
  const domain = extractDomain(websiteUrl)
  if (!domain) {
    return generatePlaceholderFavicon("?")
  }
  
  // Return generated favicon immediately (deterministic)
  return generatePlaceholderFavicon(domain)
}

/**
 * Legacy function - kept for backwards compatibility
 * Now just calls getFaviconUrlWithFallback
 */
export async function getFaviconUrl(websiteUrl: string): Promise<string> {
  return getFaviconUrlWithFallback(websiteUrl)
}
