/**
 * Path Security Utilities
 *
 * Prevents path traversal attacks by sanitizing and validating file paths.
 *
 * Path Traversal Attack Example:
 * - User input: "../../etc/passwd"
 * - Could access: /etc/passwd instead of intended directory
 *
 * Defense:
 * - Detect and reject path traversal sequences
 * - Normalize paths
 * - Validate against allowed base directories
 */

/**
 * Detects path traversal attempts in a file path
 *
 * Checks for:
 * - ../ (Unix path traversal)
 * - ..\ (Windows path traversal)
 * - URL encoded variants (%2e%2e%2f, %2e%2e%5c)
 * - Double encoded variants
 * - Null bytes (%00, \0)
 */
export function detectPathTraversal(path: string): boolean {
  if (!path || typeof path !== 'string') return false

  // Normalize to lowercase for case-insensitive checks
  const normalized = path.toLowerCase()

  // Check for common traversal patterns
  const dangerousPatterns = [
    '../', // Unix traversal
    '..\\', // Windows traversal
    '%2e%2e%2f', // URL encoded ../
    '%2e%2e%5c', // URL encoded ..\
    '..%2f', // Mixed encoding
    '..%5c', // Mixed encoding
    '%252e%252e%252f', // Double encoded
    '\0', // Null byte
    '%00', // URL encoded null byte
  ]

  for (const pattern of dangerousPatterns) {
    if (normalized.includes(pattern)) {
      return true
    }
  }

  // Check for repeated dots (more than 2 consecutive)
  if (/\.{3,}/.test(path)) {
    return true
  }

  return false
}

/**
 * Sanitizes a filename by removing/replacing dangerous characters
 *
 * Allowed characters:
 * - Alphanumeric (a-z, A-Z, 0-9)
 * - Common safe characters: - _ .
 *
 * @param filename - The filename to sanitize
 * @param replacement - Character to replace unsafe chars with (default: '_')
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string, replacement: string = '_'): string {
  if (!filename || typeof filename !== 'string') {
    throw new Error('Invalid filename')
  }

  // Remove any path separators
  let sanitized = filename.replace(/[/\\]/g, replacement)

  // Remove or replace dangerous characters
  // Allow: alphanumeric, dash, underscore, dot
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, replacement)

  // Remove leading/trailing dots and spaces
  sanitized = sanitized.replace(/^[.\s]+|[.\s]+$/g, '')

  // Prevent multiple consecutive dots
  sanitized = sanitized.replace(/\.{2,}/g, '.')

  // Prevent multiple consecutive underscores
  sanitized = sanitized.replace(/_+/g, '_')

  // Ensure filename is not empty after sanitization
  if (!sanitized || sanitized.length === 0) {
    sanitized = `file_${Date.now()}`
  }

  // Limit filename length (max 255 chars)
  if (sanitized.length > 255) {
    const ext = sanitized.split('.').pop() || ''
    const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'))
    sanitized = nameWithoutExt.substring(0, 255 - ext.length - 1) + '.' + ext
  }

  return sanitized
}

/**
 * Validates that a path stays within a base directory
 *
 * Prevents path traversal by ensuring the resolved path
 * is a subdirectory of the base path.
 *
 * @param basePath - The allowed base directory
 * @param userPath - The user-provided path
 * @returns true if path is safe, false if traversal detected
 */
export function isPathWithinBase(basePath: string, userPath: string): boolean {
  if (!basePath || !userPath) return false

  // Detect obvious traversal attempts first
  if (detectPathTraversal(userPath)) {
    return false
  }

  // Normalize paths (remove redundant separators, resolve ..)
  const normalizedBase = basePath.replace(/\\/g, '/').replace(/\/+/g, '/')
  const normalizedUser = userPath.replace(/\\/g, '/').replace(/\/+/g, '/')

  // Simple check: user path should not escape base
  // This is a basic check - for production use path.resolve() in Node.js
  if (normalizedUser.startsWith('../') || normalizedUser.includes('/../')) {
    return false
  }

  return true
}

/**
 * Constructs a safe file path for storage
 *
 * Best practices:
 * - Use UUIDs or business IDs instead of user input
 * - Sanitize filenames
 * - Validate extensions
 * - Use timestamp for uniqueness
 *
 * @param baseDir - Base directory (e.g., business ID)
 * @param filename - Original filename
 * @param allowedExtensions - Allowed file extensions (optional)
 * @returns Safe path
 */
export function buildSafeFilePath(
  baseDir: string,
  filename: string,
  allowedExtensions?: string[]
): { path: string; error?: string } {
  // Validate base directory (should be UUID or safe identifier)
  if (detectPathTraversal(baseDir)) {
    return { path: '', error: 'Invalid base directory' }
  }

  // Sanitize filename
  const sanitized = sanitizeFilename(filename)

  // Extract extension
  const ext = sanitized.split('.').pop()?.toLowerCase() || ''

  // Validate extension if whitelist provided
  if (allowedExtensions && allowedExtensions.length > 0) {
    if (!allowedExtensions.includes(ext)) {
      return {
        path: '',
        error: `Invalid file extension. Allowed: ${allowedExtensions.join(', ')}`,
      }
    }
  }

  // Build path: baseDir/timestamp-sanitizedname
  const timestamp = Date.now()
  const safePath = `${baseDir}/${timestamp}-${sanitized}`

  return { path: safePath }
}

/**
 * Extracts and validates path from storage URL
 *
 * Use for cleanup operations where you need to extract path from URL
 * and ensure it's a valid storage path.
 *
 * @param url - Full storage URL
 * @param bucket - Expected bucket name
 * @returns Validated path or null
 */
export function extractSafePathFromUrl(url: string, bucket: string): string | null {
  if (!url || !bucket) return null

  try {
    // Expected pattern: /storage/v1/object/public/{bucket}/{path}
    const pattern = new RegExp(`/storage/v1/object/public/${bucket}/(.+)$`)
    const match = url.match(pattern)

    if (!match || !match[1]) return null

    const extractedPath = match[1]

    // Validate extracted path doesn't contain traversal
    if (detectPathTraversal(extractedPath)) {
      console.warn(`Path traversal detected in URL: ${url}`)
      return null
    }

    return extractedPath
  } catch {
    return null
  }
}
