/**
 * File Validation with Magic Bytes
 *
 * Security: NEVER trust file.type or file extension alone.
 * Always validate the actual file content using magic bytes (file signatures).
 *
 * Magic bytes are the first few bytes of a file that identify its type.
 * This prevents attacks where malicious files are renamed with safe extensions.
 */

/**
 * File type signatures (magic bytes)
 * First bytes of the file that uniquely identify the file format
 */
const FILE_SIGNATURES = {
  // Images
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], // .PNG....
  jpeg: [0xff, 0xd8, 0xff], // JPEG start
  webp: [0x52, 0x49, 0x46, 0x46], // RIFF (WebP container, need additional check)
  gif: [0x47, 0x49, 0x46, 0x38], // GIF8

  // SVG is XML-based, so we check for XML/SVG tags
  svg: null, // Special handling required (text-based)

  // Documents
  pdf: [0x25, 0x50, 0x44, 0x46], // %PDF

  // Compressed
  zip: [0x50, 0x4b, 0x03, 0x04], // PK.. (also used by docx, xlsx, etc)
} as const

type FileType = keyof typeof FILE_SIGNATURES

interface ValidationResult {
  valid: boolean
  detectedType: FileType | 'unknown'
  error?: string
}

/**
 * Reads the first N bytes from a File/Blob
 */
async function readFileBytes(file: File | Blob, numBytes: number): Promise<Uint8Array> {
  const slice = file.slice(0, numBytes)
  const buffer = await slice.arrayBuffer()
  return new Uint8Array(buffer)
}

/**
 * Checks if byte array matches the expected signature
 */
function matchesSignature(bytes: Uint8Array, signature: readonly number[]): boolean {
  if (bytes.length < signature.length) return false

  for (let i = 0; i < signature.length; i++) {
    if (bytes[i] !== signature[i]) return false
  }

  return true
}

/**
 * Detects file type by reading magic bytes
 */
async function detectFileType(file: File | Blob): Promise<FileType | 'unknown'> {
  // Read first 12 bytes (enough for most signatures)
  const bytes = await readFileBytes(file, 12)

  // Check PNG
  if (matchesSignature(bytes, FILE_SIGNATURES.png)) {
    return 'png'
  }

  // Check JPEG
  if (matchesSignature(bytes, FILE_SIGNATURES.jpeg)) {
    return 'jpeg'
  }

  // Check WebP (RIFF + need to verify WebP specifically)
  if (matchesSignature(bytes, FILE_SIGNATURES.webp)) {
    // WebP files have "WEBP" at bytes 8-11
    const webpBytes = await readFileBytes(file, 16)
    if (
      webpBytes[8] === 0x57 && // W
      webpBytes[9] === 0x45 && // E
      webpBytes[10] === 0x42 && // B
      webpBytes[11] === 0x50 // P
    ) {
      return 'webp'
    }
  }

  // Check GIF
  if (matchesSignature(bytes, FILE_SIGNATURES.gif)) {
    return 'gif'
  }

  // Check PDF
  if (matchesSignature(bytes, FILE_SIGNATURES.pdf)) {
    return 'pdf'
  }

  // Check ZIP
  if (matchesSignature(bytes, FILE_SIGNATURES.zip)) {
    return 'zip'
  }

  // Check SVG (text-based XML)
  // SVG files start with XML declaration or <svg tag
  const textDecoder = new TextDecoder('utf-8')
  const firstChars = textDecoder.decode(bytes)
  if (
    firstChars.includes('<?xml') ||
    firstChars.includes('<svg') ||
    firstChars.includes('<!DOCTYPE svg')
  ) {
    return 'svg'
  }

  return 'unknown'
}

/**
 * Validates a file against allowed types using magic bytes
 *
 * @param file - File or Blob to validate
 * @param allowedTypes - Array of allowed file types (e.g., ['png', 'jpeg', 'webp'])
 * @param maxSizeBytes - Maximum file size in bytes (optional)
 * @returns ValidationResult with validation status and detected type
 *
 * @example
 * ```ts
 * const result = await validateFile(file, ['png', 'jpeg', 'webp'], 2 * 1024 * 1024);
 * if (!result.valid) {
 *   console.error(result.error);
 * }
 * ```
 */
export async function validateFile(
  file: File | Blob,
  allowedTypes: FileType[],
  maxSizeBytes?: number
): Promise<ValidationResult> {
  // Check file size first (cheap operation)
  if (maxSizeBytes && file.size > maxSizeBytes) {
    const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(1)
    return {
      valid: false,
      detectedType: 'unknown',
      error: `File size exceeds maximum of ${maxSizeMB}MB`,
    }
  }

  // Check for empty file
  if (file.size === 0) {
    return {
      valid: false,
      detectedType: 'unknown',
      error: 'File is empty',
    }
  }

  // Detect actual file type by reading magic bytes
  const detectedType = await detectFileType(file)

  if (detectedType === 'unknown') {
    return {
      valid: false,
      detectedType: 'unknown',
      error: 'Unknown or unsupported file type',
    }
  }

  // Check if detected type is in allowed list
  if (!allowedTypes.includes(detectedType)) {
    return {
      valid: false,
      detectedType,
      error: `File type '${detectedType}' is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    }
  }

  return {
    valid: true,
    detectedType,
  }
}

/**
 * Validates an image file (common use case)
 */
export async function validateImageFile(
  file: File | Blob,
  maxSizeBytes: number = 2 * 1024 * 1024 // Default 2MB
): Promise<ValidationResult> {
  return validateFile(file, ['png', 'jpeg', 'webp', 'gif', 'svg'], maxSizeBytes)
}

/**
 * Validates a document file
 */
export async function validateDocumentFile(
  file: File | Blob,
  maxSizeBytes: number = 10 * 1024 * 1024 // Default 10MB
): Promise<ValidationResult> {
  return validateFile(file, ['pdf'], maxSizeBytes)
}

/**
 * Gets human-readable MIME type from detected file type
 */
export function getMimeType(fileType: FileType): string {
  const mimeTypes: Record<FileType, string> = {
    png: 'image/png',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
    zip: 'application/zip',
  }

  return mimeTypes[fileType] || 'application/octet-stream'
}
