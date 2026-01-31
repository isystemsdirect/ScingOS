
// ONE GIANT CB (Clipboard Bridge) for Android (Jetpack Compose + DataStore + Flow)
// Drop-in module-style code. Replace TODOs with your real networking/receiver stack.

@file:OptIn(
  androidx.compose.foundation.ExperimentalFoundationApi::class,
  androidx.compose.material3.ExperimentalMaterial3Api::class
)

package com.scingular.spectrocap.cb

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PowerSettingsNew
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import java.util.concurrent.atomic.AtomicReference

// ---------------------------------------------
// DataStore
// ---------------------------------------------

private val Context.cbDataStore by preferencesDataStore(name = "clipboard_bridge_settings")

object CbPrefsKeys {
  val CB_ENABLED = booleanPreferencesKey("cb_enabled") // ONE GIANT CB
  val TIMEOUT_MS = intPreferencesKey("cb_timeout_ms")  // internal default, not user-facing
  val RETRY_ATTEMPTS = intPreferencesKey("cb_retry_attempts") // internal default
}

data class ClipboardBridgeSettings(
  val enabled: Boolean = false,
  val timeoutMs: Int = 1500,
  val retryAttempts: Int = 3,
)

class ClipboardBridgeSettingsRepository(
  private val store: DataStore<Preferences>
) {
  val settings: Flow<ClipboardBridgeSettings> =
    store.data
      .catch { emit(androidx.datastore.preferences.core.emptyPreferences()) }
      .map { p ->
        ClipboardBridgeSettings(
          enabled = p[CbPrefsKeys.CB_ENABLED] ?: false,
          timeoutMs = p[CbPrefsKeys.TIMEOUT_MS] ?: 1500,
          retryAttempts = p[CbPrefsKeys.RETRY_ATTEMPTS] ?: 3
        )
      }
      .distinctUntilChanged()

  suspend fun setEnabled(enabled: Boolean) {
    store.edit { it[CbPrefsKeys.CB_ENABLED] = enabled }
  }

  suspend fun seedInternalDefaultsIfMissing() {
    store.edit { p ->
      if (!p.contains(CbPrefsKeys.TIMEOUT_MS)) p[CbPrefsKeys.TIMEOUT_MS] = 1500
      if (!p.contains(CbPrefsKeys.RETRY_ATTEMPTS)) p[CbPrefsKeys.RETRY_ATTEMPTS] = 3
      if (!p.contains(CbPrefsKeys.CB_ENABLED)) p[CbPrefsKeys.CB_ENABLED] = false
    }
  }
}

// ---------------------------------------------
// Receiver / Sender abstraction (plug your stack here)
// ---------------------------------------------

sealed class ReceiverState {
  object Unknown : ReceiverState()
  object Ready : ReceiverState()
  data class Waiting(val reason: String) : ReceiverState()
}

interface ClipboardReceiverClient {
  val receiverState: StateFlow<ReceiverState>
  suspend fun ensureReady(timeoutMs: Int): ReceiverState
  suspend fun sendClipboard(payload: ByteArray, timeoutMs: Int): SendResult
}

data class SendResult(val success: Boolean, val error: String? = null)

// ---------------------------------------------
// Clipboard source
// ---------------------------------------------

data class ClipboardSnapshot(
  val text: String,
  val timestampMs: Long = System.currentTimeMillis()
)

interface ClipboardSource {
  val latest: StateFlow<ClipboardSnapshot?>
  fun start()
  fun stop()
  fun clear()
}

class AndroidClipboardSource(
  private val context: Context
) : ClipboardSource {
  private val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
  private val _latest = MutableStateFlow<ClipboardSnapshot?>(null)
  override val latest: StateFlow<ClipboardSnapshot?> = _latest.asStateFlow()

  private val listener = ClipboardManager.OnPrimaryClipChangedListener {
    val clip = clipboard.primaryClip
    val item = clip?.getItemAt(0)
    val text = item?.coerceToText(context)?.toString() ?: return@OnPrimaryClipChangedListener
    if (text.isNotBlank()) _latest.value = ClipboardSnapshot(text = text)
  }

  private var running = false

  override fun start() {
    if (running) return
    running = true
    clipboard.addPrimaryClipChangedListener(listener)
  }

  override fun stop() {
    if (!running) return
    running = false
    clipboard.removePrimaryClipChangedListener(listener)
  }

  override fun clear() {
    clipboard.setPrimaryClip(ClipData.newPlainText("", ""))
    _latest.value = null
  }
}

// ---------------------------------------------
// Busy / Status Overlay model (CB-only)
// ---------------------------------------------

sealed class CbUiStatus {
  object Idle : CbUiStatus()
  data class Working(
    val message: String,
    val progress: Float? = null // null => indeterminate
  ) : CbUiStatus()
  data class Error(val message: String) : CbUiStatus()
  object Success : CbUiStatus()
}

// ---------------------------------------------
// ViewModel-like controller (works with or without AndroidX ViewModel)
// ---------------------------------------------

class ClipboardBridgeController(
  private val scope: CoroutineScope,
  private val repo: ClipboardBridgeSettingsRepository,
  private val clipboard: ClipboardSource,
  private val receiver: ClipboardReceiverClient
) {
  private val _status = MutableStateFlow<CbUiStatus>(CbUiStatus.Idle)
  val status: StateFlow<CbUiStatus> = _status.asStateFlow()

  private val _enabled = MutableStateFlow(false)
  val enabled: StateFlow<Boolean> = _enabled.asStateFlow()

  val receiverState: StateFlow<ReceiverState> = receiver.receiverState

  val latestClipboard: StateFlow<ClipboardSnapshot?> = clipboard.latest

  private val sendJob = AtomicReference<Job?>(null)

  init {
    scope.launch { repo.seedInternalDefaultsIfMissing() }

    scope.launch {
      repo.settings.collect { s ->
        _enabled.value = s.enabled
        if (s.enabled) clipboard.start() else clipboard.stop()
        if (!s.enabled) {
          cancelInFlight("Clipboard Bridge disabled")
          _status.value = CbUiStatus.Idle
        }
      }
    }

    // ONE GIANT CB behavior: auto-react to clipboard changes when enabled
    scope.launch {
      combine(repo.settings, clipboard.latest) { s, clip -> s to clip }
        .collectLatest { (s, clip) ->
          if (!s.enabled) return@collectLatest
          if (clip == null) return@collectLatest

          // Auto-send is implicit while CB is ON
          sendClipboardInternal(clip.text, s.timeoutMs, s.retryAttempts)
        }
    }
  }

  fun toggleEnabled() {
    scope.launch {
      repo.setEnabled(!enabled.value)
    }
  }

  fun sendNow() {
    scope.launch {
      val s = repo.settings.first()
      val clip = clipboard.latest.value ?: run {
        _status.value = CbUiStatus.Error("Clipboard is empty")
        return@launch
      }
      sendClipboardInternal(clip.text, s.timeoutMs, s.retryAttempts)
    }
  }

  fun clearClipboard() {
    clipboard.clear()
  }

  fun cancelInFlight(reason: String = "Cancelled") {
    sendJob.getAndSet(null)?.cancel(CancellationException(reason))
  }

  private suspend fun sendClipboardInternal(text: String, timeoutMs: Int, retries: Int) {
    // Cancel any in-flight send and replace (clipboard updates rapidly)
    sendJob.getAndSet(null)?.cancel(CancellationException("Replaced by new clipboard"))
    val job = scope.launch {
      _status.value = CbUiStatus.Working("Checking receiver…")
      val ready = receiver.ensureReady(timeoutMs)
      if (ready !is ReceiverState.Ready) {
        val msg = when (ready) {
          is ReceiverState.Waiting -> "Waiting for receiver: ${'$'}{ready.reason}"
          else -> "Waiting for receiver"
        }
        _status.value = CbUiStatus.Working(msg)
        return@launch
      }

      val payload = buildPayload(text)

      var lastError: String? = null
      val attempts = retries.coerceAtLeast(1)
      repeat(attempts) { idx ->
        val attempt = idx + 1
        _status.value = CbUiStatus.Working("Sending… (attempt ${'$'}attempt/${'$'}attempts)")
        val res = receiver.sendClipboard(payload, timeoutMs)
        if (res.success) {
          _status.value = CbUiStatus.Success
          delay(250)
          _status.value = CbUiStatus.Idle
          return@launch
        } else {
          lastError = res.error ?: "Unknown error"
        }
      }

      _status.value = CbUiStatus.Error("Send failed: ${'$'}{lastError ?: "Unknown error"}")
      delay(1200)
      _status.value = CbUiStatus.Idle
    }
    sendJob.set(job)
  }

  private fun buildPayload(text: String): ByteArray {
    // TODO: apply your real protocol: encode/encrypt/sign/compress
    return text.toByteArray(Charsets.UTF_8)
  }
}

// ---------------------------------------------
// Compose UI: ONE GIANT CB card + CB-only overlay
// ---------------------------------------------

@Composable
fun ClipboardBridgeSection(
  controller: ClipboardBridgeController,
  modifier: Modifier = Modifier
) {
  val enabled by controller.enabled.collectAsState()
  val status by controller.status.collectAsState()
  val receiverState by controller.receiverState.collectAsState()
  val latest by controller.latestClipboard.collectAsState()

  ClipboardBridgeStatusOverlay(
    status = status,
    onCancel = { controller.cancelInFlight() }
  )

  Column(modifier.padding(horizontal = 16.dp, vertical = 12.dp)) {
    OneGiantCbCard(
      enabled = enabled,
      receiverState = receiverState,
      status = status,
      onToggle = { controller.toggleEnabled() }
    )

    Spacer(Modifier.height(14.dp))

    // CB action buttons (only meaningful when enabled)
    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
      Button(
        onClick = { controller.sendNow() },
        enabled = enabled,
        modifier = Modifier.weight(1f)
      ) { Text("Send Clipboard", maxLines = 1, overflow = TextOverflow.Ellipsis) }

      OutlinedButton(
        onClick = { controller.clearClipboard() },
        enabled = enabled,
        modifier = Modifier.weight(1f)
      ) { Text("Clear Clipboard", maxLines = 1, overflow = TextOverflow.Ellipsis) }
    }

    AnimatedVisibility(visible = enabled) {
      Column(Modifier.padding(top = 10.dp)) {
        val preview = latest?.text?.take(160)?.replace("
", " ") ?: "—"
        Text(
          text = "Latest clipboard: ${'$'}preview",
          style = MaterialTheme.typography.bodySmall,
          maxLines = 2,
          overflow = TextOverflow.Ellipsis
        )
      }
    }
  }
}

@Composable
private fun OneGiantCbCard(
  enabled: Boolean,
  receiverState: ReceiverState,
  status: CbUiStatus,
  onToggle: () -> Unit
) {
  val subtitle = when {
    !enabled -> "Disabled"
    status is CbUiStatus.Working -> "Active • ${'$'}{status.message}"
    receiverState is ReceiverState.Ready -> "Active • Ready"
    receiverState is ReceiverState.Waiting -> "Active • Waiting for receiver"
    else -> "Active • Checking…"
  }

  val icon = when {
    !enabled -> Icons.Filled.PowerSettingsNew
    status is CbUiStatus.Working -> Icons.Filled.Sync
    else -> Icons.Filled.PowerSettingsNew
  }

  ElevatedCard(
    shape = RoundedCornerShape(18.dp),
    modifier = Modifier
      .fillMaxWidth()
      .animateContentSize()
      .clickable { onToggle() }
  ) {
    Row(
      modifier = Modifier.padding(18.dp),
      verticalAlignment = Alignment.CenterVertically
    ) {
      Icon(icon, contentDescription = null, modifier = Modifier.size(28.dp))
      Spacer(Modifier.width(12.dp))

      Column(Modifier.weight(1f)) {
        Text("Clipboard Bridge", style = MaterialTheme.typography.titleLarge)
        Spacer(Modifier.height(2.dp))
        Text(subtitle, style = MaterialTheme.typography.bodyMedium)
      }

      Switch(
        checked = enabled,
        onCheckedChange = { onToggle() }
      )
    }
  }
}

@Composable
private fun ClipboardBridgeStatusOverlay(
  status: CbUiStatus,
  onCancel: () -> Unit
) {
  val working = status as? CbUiStatus.Working ?: return

  Dialog(onDismissRequest = { /* blocked */ }) {
    Surface(shape = RoundedCornerShape(16.dp)) {
      Column(
        modifier = Modifier.padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally
      ) {
        Text(working.message, style = MaterialTheme.typography.titleMedium)
        Spacer(Modifier.height(14.dp))
        if (working.progress == null) {
          CircularProgressIndicator()
        } else {
          LinearProgressIndicator(progress = { working.progress!! })
        }
        Spacer(Modifier.height(16.dp))
        TextButton(onClick = onCancel) { Text("Cancel") }
      }
    }
  }
}

// ---------------------------------------------
// Simple factory for Compose screens (no AndroidX ViewModel required)
// ---------------------------------------------

@Composable
fun rememberClipboardBridgeController(
  receiver: ClipboardReceiverClient,
): ClipboardBridgeController {
  val context = LocalContext.current
  val scope = rememberCoroutineScope()

  val repo = remember {
    ClipboardBridgeSettingsRepository(context.cbDataStore)
  }
  val clipboard = remember {
    AndroidClipboardSource(context)
  }

  return remember {
    ClipboardBridgeController(
      scope = scope,
      repo = repo,
      clipboard = clipboard,
      receiver = receiver
    )
  }
}
