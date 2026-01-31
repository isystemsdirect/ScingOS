package com.scingular.spectrocap.ui.screens.settings

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel

@Composable
fun AdvancedScreen(viewModel: SettingsViewModel = viewModel()) {
    val settings by viewModel.settingsState.collectAsState()

    if (settings == null) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator()
        }
        return
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        DiagnosticsCard(settings!!, viewModel)
        NetworkTuningCard(settings!!, viewModel)
        ClipboardBehaviorCard(settings!!, viewModel)
        FeatureFlagsCard()
    }
}

@Composable
private fun DiagnosticsCard(settings: com.scingular.spectrocap.data.AppSettings, viewModel: SettingsViewModel) {
    var previewPayload by remember { mutableStateOf(false) } // This is a UI-only state for now

    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("Diagnostics", style = MaterialTheme.typography.titleLarge)
            SwitchRow("Verbose logging", settings.verboseLogging) { viewModel.setVerboseLogging(it) }
            Button(onClick = { /* TODO: Export logs */ }, modifier = Modifier.fillMaxWidth()) {
                Text("Export logs")
            }
            Button(onClick = { /* TODO: Copy log snippet */ }, modifier = Modifier.fillMaxWidth()) {
                Text("Copy latest log snippet")
            }
            HorizontalDivider()
            SwitchRow("Preview payload before send", previewPayload) { previewPayload = it }
            if (previewPayload) {
                Text(
                    text = "{ \"id\": \"...\", \"payload\": \"...\" }",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(8.dp)
                )
            }
        }
    }
}

@Composable
private fun NetworkTuningCard(settings: com.scingular.spectrocap.data.AppSettings, viewModel: SettingsViewModel) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("Network Tuning", style = MaterialTheme.typography.titleLarge)
            OutlinedTextField(
                value = settings.networkTimeoutMs.toString(),
                onValueChange = { viewModel.setNetworkTimeoutMs(it.toIntOrNull() ?: 1500) },
                label = { Text("Timeout (ms)") },
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = settings.networkRetryAttempts.toString(),
                onValueChange = { viewModel.setNetworkRetryAttempts(it.toIntOrNull() ?: 3) },
                label = { Text("Retry attempts") },
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}

@Composable
private fun ClipboardBehaviorCard(settings: com.scingular.spectrocap.data.AppSettings, viewModel: SettingsViewModel) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("Clipboard Behavior", style = MaterialTheme.typography.titleLarge)
            SwitchRow("Auto-send on copy", settings.autoSendClipboard) { viewModel.setAutoSendClipboard(it) }
            SwitchRow("Confirm before sending", settings.confirmBeforeSend) { viewModel.setConfirmBeforeSend(it) }
            SwitchRow("Clear clipboard after send", settings.clearClipboardAfterSend) { viewModel.setClearClipboardAfterSend(it) }
        }
    }
}

@Composable
private fun FeatureFlagsCard() {
    var qrPairing by remember { mutableStateOf(false) }

    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("Experimental", style = MaterialTheme.typography.titleLarge)
            SwitchRow("Enable QR receiver pairing", qrPairing) { qrPairing = it }
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Enable media pipeline", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.38f))
                Switch(checked = false, onCheckedChange = null, enabled = false)
            }
        }
    }
}

@Composable
private fun SwitchRow(label: String, checked: Boolean, onCheckedChange: (Boolean) -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(label)
        Switch(checked = checked, onCheckedChange = onCheckedChange)
    }
}
