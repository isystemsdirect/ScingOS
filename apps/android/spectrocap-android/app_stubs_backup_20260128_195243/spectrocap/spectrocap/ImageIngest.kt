package com.scingular.spectrocap.spectrocap

import android.content.Context
import android.net.Uri

/**
 * Image ingest for Phase 2B.
 */
object ImageIngest {
    suspend fun fromUri(context: Context, uri: Uri): ImageData? = null
}
     * Acquires image from content URI and validates format.
     *
     * @param context Android context for ContentResolver
     * @param uri Content URI to image file
     * @return ImageData if valid and supported, null otherwise
     */
    fun acquireImage(context: Context, uri: Uri): ImageData? {
        return try {
            // Read bytes from URI
            val bytes = context.contentResolver.openInputStream(uri)?.use {
                it.readBytes()
            } ?: return null

            // Determine MIME type
            val mime = context.contentResolver.getType(uri) ?: "image/octet-stream"

            // Validate: Only PNG and JPEG in Phase 2B.1
            if (mime !in SUPPORTED_MIMES) {
                return null  // Unsupported format
            }

            // Extract dimensions (best-effort)
            val (width, height) = extractImageDimensions(bytes)

            // Extract filename from URI
            val filename = getFileName(context, uri)

            // Determine extension
            val ext = MIME_TO_EXT[mime] ?: "png"

            ImageData(
                bytes = bytes,
                mime = mime,
                width = width,
                height = height,
                filename = filename,
                ext = ext
            )
        } catch (e: Exception) {
            null  // Silently fail on any error
        }
    }

    /**
     * Extracts image dimensions using BitmapFactory.
     *
     * Uses inJustDecodeBounds to avoid loading full bitmap into memory.
     *
     * @param bytes Raw image bytes
     * @return Pair of (width, height); (0, 0) if unknown
     */
    private fun extractImageDimensions(bytes: ByteArray): Pair<Int, Int> {
        return try {
            val options = BitmapFactory.Options().apply {
                inJustDecodeBounds = true
            }
            BitmapFactory.decodeByteArray(bytes, 0, bytes.size, options)
            Pair(options.outWidth, options.outHeight)
        } catch (e: Exception) {
            Pair(0, 0)  // Fallback: dimensions unknown
        }
    }

    /**
     * Extracts filename from content URI.
     *
     * Uses ContentResolver query to get DISPLAY_NAME column.
     *
     * @param context Android context
     * @param uri Content URI
     * @return Filename or null if not available
     */
    private fun getFileName(context: Context, uri: Uri): String? {
        return try {
            var cursor: Cursor? = null
            try {
                cursor = context.contentResolver.query(
                    uri,
                    arrayOf(OpenableColumns.DISPLAY_NAME),
                    null,
                    null,
                    null
                )

                if (cursor != null && cursor.moveToFirst()) {
                    val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                    if (nameIndex >= 0) {
                        return cursor.getString(nameIndex)
                    }
                }
            } finally {
                cursor?.close()
            }
            null
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Validates image magic bytes (PNG/JPEG).
     *
     * Used after decryption to ensure image integrity.
     *
     * @param bytes Image data bytes
     * @return true if valid PNG or JPEG header, false otherwise
     */
    fun validateImageMagic(bytes: ByteArray): Boolean {
        if (bytes.size < 3) return false

        // PNG: 89 50 4E 47 0D 0A 1A 0A (first 8 bytes)
        if (bytes.size >= 8 &&
            bytes[0] == 0x89.toByte() &&
            bytes[1] == 0x50.toByte() &&
            bytes[2] == 0x4E.toByte() &&
            bytes[3] == 0x47.toByte() &&
            bytes[4] == 0x0D.toByte() &&
            bytes[5] == 0x0A.toByte() &&
            bytes[6] == 0x1A.toByte() &&
            bytes[7] == 0x0A.toByte()
        ) {
            return true
        }

        // JPEG: FF D8 FF (first 3 bytes)
        if (bytes[0] == 0xFF.toByte() &&
            bytes[1] == 0xD8.toByte() &&
            bytes[2] == 0xFF.toByte()
        ) {
            return true
        }

        return false
    }
}
