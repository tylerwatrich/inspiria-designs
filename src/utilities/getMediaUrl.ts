import { getClientSideURL } from '@/utilities/getURL'

/**
 * Processes media resource URL to ensure proper formatting
 * @param url The original URL from the resource
 * @param cacheTag Optional cache tag to append to the URL
 * @returns Properly formatted URL with cache tag if provided
 */
export const getMediaUrl = (url: string | null | undefined, cacheTag?: string | null): string => {
  if (!url) return ''

  const isDevelopment = process.env.NODE_ENV === 'development'

  if (cacheTag && cacheTag !== '' && !isDevelopment) {
    cacheTag = encodeURIComponent(cacheTag)
  } else {
    cacheTag = null // Clear cache tag in development
  }

  // Check if URL already has http/https protocol
  if (url.startsWith('http://') || url.startsWith('https://')) {
    const urlObj = new URL(url)
    if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
      const relativePath = urlObj.pathname
      return cacheTag ? `${relativePath}?${cacheTag}` : relativePath
    }
    // For external URLs, keep them as-is
    return cacheTag ? `${url}?${cacheTag}` : url
  }

  if (isDevelopment) {
    return url // No cache tag, no base URL
  }

  // For relative paths, don't prepend baseUrl in development
  // Next.js Image component works better with relative paths
  if (process.env.NODE_ENV === 'development') {
    return cacheTag ? `${url}?${cacheTag}` : url
  }

  // Otherwise prepend client-side URL
  const baseUrl = getClientSideURL()
  return cacheTag ? `${baseUrl}${url}?${cacheTag}` : `${baseUrl}${url}`
}
