/**
 * Media Display Component for Phase 2B Images
 * 
 * Handles image decryption result display with:
 * - Image preview (PNG/JPEG)
 * - Copy to clipboard button (via Tauri command)
 * - Save As dialog button (via Tauri command)
 * - Image metadata display (dimensions, MIME type, size)
 */

import { invoke } from '@tauri-apps/api/core';
import { save } from '@tauri-apps/api/dialog';

export interface MediaDisplayResult {
    imageBytes: Uint8Array;
    messageId: string;
    senderDeviceId: string;
    messageType: 'image';
    mime: string;
    width?: number;
    height?: number;
    filename?: string;
}

/**
 * Display decrypted image with control buttons
 */
export async function displayImage(result: MediaDisplayResult): Promise<void> {
    const container = document.getElementById('media-display') || createMediaContainer();
    
    // Create data URL for image preview
    const blob = new Blob([new Uint8Array(result.imageBytes)], { type: result.mime });
    const imageUrl = URL.createObjectURL(blob);
    
    // Create image element
    const imgElement = document.createElement('img');
    imgElement.src = imageUrl;
    imgElement.alt = `Message from ${result.senderDeviceId}`;
    imgElement.style.maxWidth = '100%';
    imgElement.style.maxHeight = '600px';
    imgElement.style.marginBottom = '16px';
    
    // Create controls section
    const controls = document.createElement('div');
    controls.style.display = 'flex';
    controls.style.gap = '8px';
    controls.style.marginBottom = '16px';
    
    // Copy to Clipboard button
    const clipboardBtn = document.createElement('button');
    clipboardBtn.textContent = '📋 Copy to Clipboard';
    clipboardBtn.style.padding = '8px 16px';
    clipboardBtn.onclick = () => copyImageToClipboard(result.imageBytes);
    controls.appendChild(clipboardBtn);
    
    // Save As button
    const saveBtn = document.createElement('button');
    saveBtn.textContent = '💾 Save As...';
    saveBtn.style.padding = '8px 16px';
    saveBtn.onclick = () => saveImageToFile(result.imageBytes, result.filename || 'image.png');
    controls.appendChild(saveBtn);
    
    // Create metadata section
    const metadata = document.createElement('div');
    metadata.style.fontSize = '14px';
    metadata.style.color = '#666';
    metadata.style.lineHeight = '1.6';
    metadata.innerHTML = `
        <p><strong>Message ID:</strong> ${escapeHtml(result.messageId)}</p>
        <p><strong>From Device:</strong> ${escapeHtml(result.senderDeviceId)}</p>
        <p><strong>MIME Type:</strong> ${escapeHtml(result.mime)}</p>
        <p><strong>Size:</strong> ${(result.imageBytes.byteLength / 1024).toFixed(2)} KB</p>
        ${result.width && result.height ? `<p><strong>Dimensions:</strong> ${result.width}×${result.height} px</p>` : ''}
        ${result.filename ? `<p><strong>Filename:</strong> ${escapeHtml(result.filename)}</p>` : ''}
    `;
    
    // Clear and populate container
    container.innerHTML = '';
    container.appendChild(imgElement);
    container.appendChild(controls);
    container.appendChild(metadata);
}

/**
 * Copy image to Windows clipboard via Tauri
 */
async function copyImageToClipboard(imageBytes: Uint8Array): Promise<void> {
    try {
        const tempDir = await getTempDir();
        await invoke('copy_image_to_clipboard', {
            imageBytes: Array.from(imageBytes),
            tempDir,
        });
        showNotification('✅ Image copied to clipboard');
    } catch (error) {
        showNotification(`❌ Failed to copy: ${error}`);
    }
}

/**
 * Save image to file via dialog and Tauri
 */
async function saveImageToFile(imageBytes: Uint8Array, filename: string): Promise<void> {
    try {
        // Determine extension from filename
        const ext = filename.endsWith('.png') ? '.png' : 
                    filename.endsWith('.jpg') ? '.jpg' : 
                    filename.endsWith('.jpeg') ? '.jpeg' : 
                    '.png';
        
        const filePath = await save({
            defaultPath: filename || `spectrocap-image${ext}`,
            filters: [
                { name: 'Image', extensions: ['png', 'jpg', 'jpeg'] },
                { name: 'All Files', extensions: ['*'] },
            ],
        });
        
        if (filePath) {
            await invoke('save_image_to_file', {
                imageBytes: Array.from(imageBytes),
                filePath,
            });
            showNotification(`✅ Image saved to ${filePath}`);
        }
    } catch (error) {
        showNotification(`❌ Failed to save: ${error}`);
    }
}

/**
 * Get system temp directory
 */
async function getTempDir(): Promise<string> {
    // Tauri will resolve temp directory at runtime
    return '/tmp';
}

/**
 * Create media display container if it doesn't exist
 */
function createMediaContainer(): HTMLElement {
    const container = document.createElement('div');
    container.id = 'media-display';
    container.style.padding = '16px';
    container.style.border = '1px solid #ddd';
    container.style.borderRadius = '8px';
    container.style.marginBottom = '16px';
    document.body.appendChild(container);
    return container;
}

/**
 * Show temporary notification
 */
function showNotification(message: string): void {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.bottom = '16px';
    notification.style.right = '16px';
    notification.style.padding = '12px 16px';
    notification.style.backgroundColor = message.includes('✅') ? '#4caf50' : '#f44336';
    notification.style.color = 'white';
    notification.style.borderRadius = '4px';
    notification.style.zIndex = '10000';
    notification.style.fontSize = '14px';
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => notification.remove(), 3000);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Detect MIME type from image bytes
 */
export async function detectImageMime(imageBytes: Uint8Array): Promise<string> {
    try {
        const mime = await invoke<string>('detect_image_mime', {
            imageBytes: Array.from(imageBytes),
        });
        return mime;
    } catch {
        return 'image/octet-stream';
    }
}
