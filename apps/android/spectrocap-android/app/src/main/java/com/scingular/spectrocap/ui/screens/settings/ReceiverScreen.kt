package com.scingular.spectrocap.ui.screens.settings

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel

@Composable
fun ReceiverScreen(viewModel: SettingsViewModel = viewModel()) {
    val settings by viewModel.settingsState.collectAsState()

    // Do not render until settings are loaded
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
        LiveStatusCard()
        ReceiverTargetCard(settings!!, viewModel)
        ConnectionToolsCard()
        SafetyNotes()
    }
}

@Composable
private fun LiveStatusCard() {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Receiver Status", style = MaterialTheme.typography.titleLarge)
                IconButton(onClick = { /* TODO: Refresh */ }) {
                    Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
            StatusRow("State", "Connected")
            StatusRow("Transport", "Wi-Fi")
            StatusRow("Device IP (This phone)", "192.168.1.123")
            StatusRow("Receiver IP", "192.168.1.100")
            StatusRow("Port", "9443")
            StatusRow("Latency", "12 ms")
            StatusRow("Last handshake", "Jan 30, 2026 • 10:14 AM")
        }
    }
}

@Composable
private fun StatusRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(label, fontWeight = FontWeight.Bold)
        Text(value)
    }
}

@Composable
private fun ReceiverTargetCard(settings: com.scingular.spectrocap.data.AppSettings, viewModel: SettingsViewModel) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text("Receiver Target", style = MaterialTheme.typography.titleLarge)
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Auto-discover receiver")
                Switch(
                    checked = settings.autoDiscoverReceiver,
                    onCheckedChange = { viewModel.setAutoDiscoverReceiver(it) }
                )
            }
            HorizontalDivider()
            if (settings.autoDiscoverReceiver) {
                Text("Scanning for receivers...", style = MaterialTheme.typography.bodyMedium)
                 Spacer(modifier = Modifier.height(8.dp))
                Button(onClick = { /* TODO: Scan */ }, modifier = Modifier.fillMaxWidth()) {
                    Text("Scan now")
                }
            } else {
                OutlinedTextField(
                    value = settings.receiverIp,
                    onValueChange = { viewModel.setReceiverIp(it) },
                    label = { Text("Receiver IP address") },
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = settings.receiverPort,
                    onValueChange = { viewModel.setReceiverPort(it) },
                    label = { Text("Port") },
                    modifier = Modifier.fillMaxWidth()
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(onClick = { /* TODO: Test */ }, modifier = Modifier.weight(1f)) {
                        Text("Test Connection")
                    }
                    Button(onClick = { /* TODO: Save */ }, modifier = Modifier.weight(1f)) {
                        Text("Save")
                    }
                }
            }
        }
    }
}

@Composable
private fun ConnectionToolsCard() {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text("Tools", style = MaterialTheme.typography.titleLarge)
            Button(onClick = { /* TODO: Start/Stop Listening */ }, modifier = Modifier.fillMaxWidth()) {
                Text("Stop Listening")
            }
            Button(onClick = { /* TODO: Send Test Ping */ }, modifier = Modifier.fillMaxWidth()) {
                Text("Send Test Ping")
            }
        }
    }
}

@Composable
private fun SafetyNotes() {
    Text(
        text = "Receiver controls affect connectivity and debugging. Use Advanced for diagnostics.",
        style = MaterialTheme.typography.bodySmall,
        color = MaterialTheme.colorScheme.onSurfaceVariant
    )
}
