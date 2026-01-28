/**
 * Local History Store
 * 
 * Manages message history in localStorage
 * SpectroCAP™ Phase 1 — Windows Tauri Client
 */

const HISTORY_KEY = 'spectrocap.history';
const MAX_HISTORY = 100;

/**
 * Message history entry (local representation)
 */
export interface HistoryEntry {
  id: string;
  createdAt: number; // Unix timestamp
  text: string;
  senderDeviceId: string;
}

/**
 * Get message history from localStorage
 */
export function getHistory(): HistoryEntry[] {
  const stored = localStorage.getItem(HISTORY_KEY);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Add message to history (maintains max size)
 */
export function addToHistory(entry: HistoryEntry): void {
  const history = getHistory();
  history.unshift(entry); // newest first
  
  // Keep only the most recent MAX_HISTORY entries
  if (history.length > MAX_HISTORY) {
    history.splice(MAX_HISTORY);
  }
  
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

/**
 * Clear all history
 */
export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

/**
 * Get the most recent message text (for "Paste Last")
 */
export function getLastMessage(): string | null {
  const history = getHistory();
  return history.length > 0 ? history[0].text : null;
}

/**
 * Remove a specific message from history
 */
export function removeFromHistory(id: string): void {
  const history = getHistory();
  const filtered = history.filter((entry) => entry.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
}
