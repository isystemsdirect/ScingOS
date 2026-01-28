package com.scingular.spectrocap.spectrocap

/**
 * Image metadata and bytes for Phase 2B media transfer.
 */
data class ImageData(
    val bytes: ByteArray,
    val mime: String,               // "image/png", "image/jpeg"
    val width: Int = 0,             // 0 if unknown
    val height: Int = 0,            // 0 if unknown
    val filename: String? = null,   // Original filename
    val ext: String = "png"         // "png", "jpg", "jpeg"
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is ImageData) return false

        if (!bytes.contentEquals(other.bytes)) return false
        if (mime != other.mime) return false
        if (width != other.width) return false
        if (height != other.height) return false
        if (filename != other.filename) return false
        if (ext != other.ext) return false

        return true
    }

    override fun hashCode(): Int {
        var result = bytes.contentHashCode()
        result = 31 * result + mime.hashCode()
        result = 31 * result + width
        result = 31 * result + height
        result = 31 * result + (filename?.hashCode() ?: 0)
        result = 31 * result + ext.hashCode()
        return result
    }
}
