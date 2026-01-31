package com.scingular.spectrocap.cb

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * A placeholder implementation of the ClipboardReceiverClient for UI development and testing.
 * This simulates network conditions without a real backend.
 */
class PlaceholderReceiverClient(private val scope: CoroutineScope) : ClipboardReceiverClient {

    private val _receiverState = MutableStateFlow<ReceiverState>(ReceiverState.Unknown)
    override val receiverState: StateFlow<ReceiverState> = _receiverState.asStateFlow()

    init {
        // Simulate a connection lifecycle
        scope.launch {
            delay(1500)
            _receiverState.value = ReceiverState.Waiting("Awaiting handshake...")
            delay(2000)
            _receiverState.value = ReceiverState.Ready
        }
    }

    override suspend fun ensureReady(timeoutMs: Int): ReceiverState {
        delay(500) // Simulate network latency
        return receiverState.value
    }

    override suspend fun sendClipboard(payload: ByteArray, timeoutMs: Int): SendResult {
        delay(1000) // Simulate upload time
        // Simulate a potential failure
        return if (Math.random() > 0.2) {
            SendResult(success = true)
        } else {
            SendResult(success = false, error = "Simulated network failure")
        }
    }
}