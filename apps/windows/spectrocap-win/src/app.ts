/**
 * Main App Component
 * 
 * Login and message history UI for SpectroCAP™ Phase 1
 * SpectroCAP™ Phase 1 — Windows Tauri Client
 */

import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { registerDevice } from './device';
import { subscribeToMessages } from './receive';
import { copyToClipboard } from './clipboard';
import { getHistory } from './historyStore';

// State management
let currentUser: any = null;
let messagesUnsubscribe: (() => void) | null = null;

/**
 * Initialize auth listener
 */
export function setupAuthListener(): void {
  onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    if (user) {
      console.log('[Auth] Signed in:', user.email);
      await onUserSignedIn(user.uid);
      renderUI();
    } else {
      console.log('[Auth] Signed out');
      if (messagesUnsubscribe) {
        messagesUnsubscribe();
      }
      renderUI();
    }
  });
}

/**
 * When user signs in
 */
async function onUserSignedIn(uid: string): Promise<void> {
  try {
    // Register device
    const device = await registerDevice(uid);
    console.log('[Device] Registered:', device.deviceId);

    // Subscribe to incoming messages
    messagesUnsubscribe = subscribeToMessages(uid, (entry) => {
      console.log('[Message] Received:', entry.id);
      renderHistory();
    });
  } catch (error) {
    console.error('[Auth] Failed to setup user:', error);
  }
}

/**
 * Login handler
 */
export async function handleLogin(email: string, password: string): Promise<void> {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    alert(`Login failed: ${error.message}`);
  }
}

/**
 * Logout handler
 */
export async function handleLogout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    alert(`Logout failed: ${error.message}`);
  }
}

/**
 * Copy message to clipboard and show confirmation
 */
export async function handleCopyMessage(text: string): Promise<void> {
  try {
    await copyToClipboard(text);
    alert('Copied to clipboard!');
  } catch (error: any) {
    alert(`Copy failed: ${error.message}`);
  }
}

/**
 * Render login screen
 */
function renderLoginScreen(): string {
  return `
    <div style="max-width: 400px; margin: 100px auto;">
      <h1>SpectroCAP™</h1>
      <p>Remote Paste — Phase 1</p>
      
      <input type="email" id="email" placeholder="Email" style="width: 100%; padding: 8px; margin: 10px 0;">
      <input type="password" id="password" placeholder="Password" style="width: 100%; padding: 8px; margin: 10px 0;">
      
      <button id="loginBtn" style="width: 100%; padding: 10px; background: #007bff; color: white; border: none; cursor: pointer;">
        Sign In
      </button>
      
      <p style="font-size: 12px; color: #666;">
        (Create account in Firebase Console → Authentication)
      </p>
    </div>
  `;
}

/**
 * Render history screen
 */
function renderHistoryScreen(): string {
  const history = getHistory();

  const historyHtml = history
    .map(
      (entry) => `
        <div style="border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 4px;">
          <p style="margin: 0 0 5px 0; word-break: break-word;">${escapeHtml(entry.text)}</p>
          <small style="color: #666;">
            ${new Date(entry.createdAt).toLocaleString()}
          </small>
          <br>
          <button onclick="window.handleCopyMessage('${escapeHtml(entry.text).replace(/'/g, '&#39;')}');"
            style="padding: 5px 10px; margin-top: 5px; background: #28a745; color: white; border: none; cursor: pointer;">
            Copy to Clipboard
          </button>
        </div>
      `
    )
    .join('');

  return `
    <div style="max-width: 600px; margin: 20px auto;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h1>SpectroCAP™ History</h1>
        <button id="logoutBtn" style="padding: 10px 20px; background: #dc3545; color: white; border: none; cursor: pointer;">
          Sign Out
        </button>
      </div>
      
      <p style="color: #666;">Signed in as: <strong>${escapeHtml(currentUser.email)}</strong></p>
      
      ${history.length === 0 ? '<p style="color: #999;">No messages yet. Copy text on another device to see it here.</p>' : `
        <div>
          <h3>Recent Messages</h3>
          ${historyHtml}
        </div>
      `}
    </div>
  `;
}

/**
 * Render main UI based on auth state
 */
function renderUI(): void {
  const app = document.getElementById('app');
  if (!app) return;

  if (currentUser) {
    app.innerHTML = renderHistoryScreen();
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
  } else {
    app.innerHTML = renderLoginScreen();
    document.getElementById('loginBtn')?.addEventListener('click', () => {
      const email = (document.getElementById('email') as HTMLInputElement)?.value || '';
      const password = (document.getElementById('password') as HTMLInputElement)?.value || '';
      handleLogin(email, password);
    });
  }
}

/**
 * Refresh history display
 */
function renderHistory(): void {
  const app = document.getElementById('app');
  if (currentUser && app) {
    app.innerHTML = renderHistoryScreen();
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
  }
}

/**
 * Utility: escape HTML
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Expose to global scope for event handlers
(window as any).handleCopyMessage = handleCopyMessage;
