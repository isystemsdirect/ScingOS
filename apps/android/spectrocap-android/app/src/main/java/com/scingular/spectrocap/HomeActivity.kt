package com.scingular.spectrocap

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import com.scingular.spectrocap.cb.ClipboardBridgeSection
import com.scingular.spectrocap.cb.PlaceholderReceiverClient
import com.scingular.spectrocap.cb.ReceiverState
import com.scingular.spectrocap.cb.rememberClipboardBridgeController
import com.scingular.spectrocap.ui.theme.SpectroCAPTheme
import kotlinx.coroutines.flow.StateFlow

class HomeActivity : ComponentActivity() {
    @OptIn(ExperimentalMaterial3Api::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SpectroCAPTheme {
                val context = LocalContext.current
                val scope = rememberCoroutineScope()
                val receiver = PlaceholderReceiverClient(scope)
                val controller = rememberClipboardBridgeController(receiver = receiver)

                Scaffold(
                    topBar = {
                        TopAppBar(
                            title = { Text("SpectroCAP") },
                            actions = {
                                ConnectionIndicatorChip(receiver.receiverState)
                                IconButton(onClick = { context.startActivity(Intent(context, SettingsHubActivity::class.java)) }) {
                                    Icon(Icons.Default.Settings, contentDescription = "Settings")
                                }
                            }
                        )
                    }
                ) { padding ->
                    ClipboardBridgeSection(
                        controller = controller,
                        modifier = Modifier.padding(padding)
                    )
                }
            }
        }
    }
}

@Composable
private fun ConnectionIndicatorChip(receiverStateFlow: StateFlow<ReceiverState>) {
    val state by receiverStateFlow.collectAsState()
    val (text, color) = when (state) {
        is ReceiverState.Ready -> "Connected" to MaterialTheme.colorScheme.primary
        is ReceiverState.Waiting -> "Connecting..." to MaterialTheme.colorScheme.secondary
        else -> "Disconnected" to MaterialTheme.colorScheme.error
    }

    AssistChip(
        onClick = { /* TODO: Open Receiver screen directly */ },
        label = { Text(text) },
        colors = AssistChipDefaults.assistChipColors(labelColor = color)
    )
}
