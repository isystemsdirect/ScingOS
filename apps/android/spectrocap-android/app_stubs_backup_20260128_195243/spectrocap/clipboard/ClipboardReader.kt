package com.scingular.spectrocap.clipboard

import android.content.ClipboardManager
import android.content.Context

/**
 * Clipboard Reader
 * 
 * Reads clipboard text from the system clipboard
 * SpectroCAP™ Phase 1 — Android Kotlin Client
 */
object ClipboardReader {
    
    /**
     * Read clipboard text (foreground access only)
     * Returns null if clipboard is empty or doesn't contain text
     */
    fun readClipboardText(context: Context): String? {
        return try {
            val clipboardManager = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            val primaryClip = clipboardManager.primaryClip
            
            if (primaryClip != null && primaryClip.itemCount > 0) {
                val clipData = primaryClip.getItemAt(0)
                clipData.text?.toString()
            } else {
                null
            }
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}
