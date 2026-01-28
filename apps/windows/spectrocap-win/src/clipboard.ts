/**
 * Clipboard Module
 * 
 * Uses Tauri API for clipboard operations
 * SpectroCAP™ Phase 1 — Windows Tauri Client
 */

import { writeText } from '@tauri-apps/api/core';
import { finalizePaste } from './lariCap';

/**
 * Copy text to clipboard via Tauri
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    // Apply LARI-CAP finalization (Phase 1: pass-through)
    const finalizedText = await finalizePaste(text);
    
    // Write to clipboard
    await writeText(finalizedText);
    console.log('[Clipboard] Text copied to clipboard');
  } catch (error) {
    console.error('[Clipboard] Failed to copy to clipboard:', error);
    throw error;
  }
}

/**
 * Paste last message from history
 */
export async function pasteLastMessage(text: string): Promise<void> {
  await copyToClipboard(text);
  // TODO: Phase 2 — Optionally simulate Ctrl+V in target application
  // This requires native command bridge or accessibility APIs
}
