package com.scingular.spectrocap.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "settings")

data class AppSettings(
    val autoDiscoverReceiver: Boolean,
    val receiverIp: String,
    val receiverPort: String,
    val verboseLogging: Boolean,
    val networkTimeoutMs: Int,
    val networkRetryAttempts: Int,
    val autoSendClipboard: Boolean,
    val confirmBeforeSend: Boolean,
    val clearClipboardAfterSend: Boolean
)

class SettingsRepository(private val context: Context) {

    private object Keys {
        val AUTO_DISCOVER_RECEIVER = booleanPreferencesKey("receiver_auto_discover")
        val RECEIVER_IP = stringPreferencesKey("receiver_manual_ip")
        val RECEIVER_PORT = stringPreferencesKey("receiver_manual_port")
        val VERBOSE_LOGGING = booleanPreferencesKey("diagnostics_verbose_logging")
        val NETWORK_TIMEOUT_MS = intPreferencesKey("network_timeout_ms")
        val NETWORK_RETRY_ATTEMPS = intPreferencesKey("network_retry_attempts")
        val AUTO_SEND_CLIPBOARD = booleanPreferencesKey("clipboard_auto_send")
        val CONFIRM_BEFORE_SEND = booleanPreferencesKey("clipboard_confirm_send")
        val CLEAR_CLIPBOARD_AFTER_SEND = booleanPreferencesKey("clipboard_clear_after_send")
    }

    val settingsFlow: Flow<AppSettings> = context.dataStore.data.map {
        val autoDiscover = it[Keys.AUTO_DISCOVER_RECEIVER] ?: true
        val ip = it[Keys.RECEIVER_IP] ?: "192.168.1.100"
        val port = it[Keys.RECEIVER_PORT] ?: "9443"
        val verbose = it[Keys.VERBOSE_LOGGING] ?: false
        val timeout = it[Keys.NETWORK_TIMEOUT_MS] ?: 1500
        val retries = it[Keys.NETWORK_RETRY_ATTEMPS] ?: 3
        val autoSend = it[Keys.AUTO_SEND_CLIPBOARD] ?: false
        val confirmSend = it[Keys.CONFIRM_BEFORE_SEND] ?: true
        val clearAfter = it[Keys.CLEAR_CLIPBOARD_AFTER_SEND] ?: false

        AppSettings(autoDiscover, ip, port, verbose, timeout, retries, autoSend, confirmSend, clearAfter)
    }

    suspend fun setAutoDiscoverReceiver(value: Boolean) {
        context.dataStore.edit { it[Keys.AUTO_DISCOVER_RECEIVER] = value }
    }

    suspend fun setReceiverIp(value: String) {
        context.dataStore.edit { it[Keys.RECEIVER_IP] = value }
    }
    
    // ... other setters would be implemented here
}
