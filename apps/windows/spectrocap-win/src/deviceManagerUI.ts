/**
 * Device Manager UI Component (Phase 2A)
 * 
 * Provides minimal BANE-ready interface for:
 * - Listing devices
 * - Viewing device status
 * - Revoking/activating devices
 */

export function createDeviceManagerUI(): HTMLElement {
  const container = document.createElement("div");
  container.id = "device-manager";
  container.className = "device-manager";
  container.innerHTML = `
    <div class="device-manager-panel">
      <div class="device-manager-header">
        <h2>🔐 Device Manager (Phase 2A)</h2>
        <button id="device-manager-refresh" class="btn btn-primary">
          🔄 Refresh
        </button>
      </div>

      <div id="device-manager-content" class="device-manager-content">
        <div class="loading">Loading devices...</div>
      </div>

      <div class="device-manager-footer">
        <small>
          📌 Revoked devices cannot decrypt new messages and will not receive envelopes.
        </small>
      </div>
    </div>
  `;

  // Add styles
  const style = document.createElement("style");
  style.textContent = `
    .device-manager {
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
      margin: 16px 0;
    }

    .device-manager-panel {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .device-manager-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .device-manager-header h2 {
      margin: 0;
      font-size: 18px;
    }

    .device-manager-content {
      padding: 16px;
      min-height: 200px;
    }

    .loading {
      text-align: center;
      color: #999;
      padding: 32px;
    }

    .device-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .device-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: #f9f9f9;
      border-left: 4px solid #667eea;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .device-item:hover {
      background: #f0f0f0;
    }

    .device-item.revoked {
      border-left-color: #e74c3c;
      opacity: 0.7;
    }

    .device-info {
      flex: 1;
    }

    .device-name {
      font-weight: 600;
      font-size: 16px;
      margin-bottom: 4px;
    }

    .device-meta {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: #666;
    }

    .device-meta span {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .device-key-fingerprint {
      font-family: monospace;
      font-size: 11px;
      background: #eee;
      padding: 4px 8px;
      border-radius: 3px;
    }

    .device-actions {
      display: flex;
      gap: 8px;
    }

    .btn {
      padding: 8px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      transition: background 0.2s;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background: #5568d3;
    }

    .btn-danger {
      background: #e74c3c;
      color: white;
    }

    .btn-danger:hover {
      background: #c0392b;
    }

    .btn-secondary {
      background: #95a5a6;
      color: white;
    }

    .btn-secondary:hover {
      background: #7f8c8d;
    }

    .device-manager-footer {
      padding: 12px 16px;
      background: #ecf0f1;
      border-top: 1px solid #e0e0e0;
      font-size: 12px;
      color: #555;
    }

    .empty-state {
      text-align: center;
      padding: 32px;
      color: #999;
    }

    .status-indicator {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 4px;
    }

    .status-indicator.active {
      background: #27ae60;
    }

    .status-indicator.revoked {
      background: #e74c3c;
    }
  `;
  document.head.appendChild(style);

  return container;
}

export function renderDeviceList(
  devices: Array<{
    deviceId: string;
    name: string;
    platform: "android" | "windows";
    status: "active" | "revoked";
    lastSeenAt: Date;
    pubSignKeyFingerprint: string;
    pubBoxKeyFingerprint: string;
  }>,
  onRevoke: (deviceId: string) => Promise<void>,
  onActivate: (deviceId: string) => Promise<void>
): HTMLElement {
  const container = document.createElement("div");

  if (devices.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>📭 No devices found</p>
      </div>
    `;
    return container;
  }

  const list = document.createElement("div");
  list.className = "device-list";

  for (const device of devices) {
    const item = document.createElement("div");
    item.className = `device-item ${device.status === "revoked" ? "revoked" : ""}`;

    const statusIndicator =
      device.status === "active"
        ? '<span class="status-indicator active"></span>'
        : '<span class="status-indicator revoked"></span>';

    const platformIcon = device.platform === "android" ? "📱" : "🪟";

    const lastSeenText = formatLastSeen(device.lastSeenAt);

    const actionButtons =
      device.status === "active"
        ? `
        <button class="btn btn-danger revoke-btn" data-device-id="${device.deviceId}">
          🔒 Revoke
        </button>
      `
        : `
        <button class="btn btn-secondary activate-btn" data-device-id="${device.deviceId}">
          🔓 Activate
        </button>
      `;

    item.innerHTML = `
      <div class="device-info">
        <div class="device-name">
          ${platformIcon} ${device.name}
          ${statusIndicator}
        </div>
        <div class="device-meta">
          <span>📌 Last: ${lastSeenText}</span>
          <span>🔑 Sign: <span class="device-key-fingerprint">${device.pubSignKeyFingerprint}</span></span>
          <span>🔑 Box: <span class="device-key-fingerprint">${device.pubBoxKeyFingerprint}</span></span>
        </div>
      </div>
      <div class="device-actions">
        ${actionButtons}
      </div>
    `;

    // Add event listeners
    const revokeBtn = item.querySelector(".revoke-btn");
    if (revokeBtn) {
      revokeBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        const deviceId = (e.target as HTMLElement).getAttribute("data-device-id");
        if (deviceId && confirm(`🔒 Revoke device "${device.name}"? This action cannot be undone easily.`)) {
          await onRevoke(deviceId);
        }
      });
    }

    const activateBtn = item.querySelector(".activate-btn");
    if (activateBtn) {
      activateBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        const deviceId = (e.target as HTMLElement).getAttribute("data-device-id");
        if (deviceId && confirm(`🔓 Activate device "${device.name}"? It will receive new messages again.`)) {
          await onActivate(deviceId);
        }
      });
    }

    list.appendChild(item);
  }

  container.appendChild(list);
  return container;
}

function formatLastSeen(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return "Just now";
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 30) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}
