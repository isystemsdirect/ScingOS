package com.scingular.spectrocap.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun SettingsScreen(
    onOpenLegal: () -> Unit,
    onBack: () -> Unit
) {
    Surface(color = MaterialTheme.colorScheme.background) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 20.dp, vertical = 18.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // HEADER
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Settings", color = MaterialTheme.colorScheme.onBackground, style = MaterialTheme.typography.titleLarge)
                TextButton(onClick = onBack) { Text("Back") }
            }
            HorizontalDivider()

            // CORE
            SettingsSection(title = "Core") {
                SettingsRow(label = "Behavior")
                HorizontalDivider()
                SettingsRow(label = "Appearance")
                HorizontalDivider()
                SettingsRow(label = "Clipboard Rules")
            }

            // SYSTEM
            SettingsSection(title = "System") {
                SettingsRow(label = "Documents & Legal", onClick = onOpenLegal)
                HorizontalDivider()
                SettingsRow(label = "Diagnostics (read-only)")
                HorizontalDivider()
                SettingsRow(label = "About SpectroCAP™")
            }

            Spacer(modifier = Modifier.weight(1f))

            // FOOTER
            HorizontalDivider()
            Text(
                "Build ID • SCINGULAR Mark",
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                style = MaterialTheme.typography.labelLarge,
                modifier = Modifier.padding(top = 16.dp).align(Alignment.CenterHorizontally)
            )
        }
    }
}

@Composable
private fun SettingsSection(title: String, content: @Composable ColumnScope.() -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(
            title,
            color = MaterialTheme.colorScheme.primary,
            style = MaterialTheme.typography.labelLarge,
            modifier = Modifier.padding(start = 16.dp)
        )
        Surface(tonalElevation = 1.dp, shape = MaterialTheme.shapes.medium) {
            Column(modifier = Modifier.fillMaxWidth()) {
                content()
            }
        }
    }
}


@Composable
private fun SettingsRow(label: String, onClick: (() -> Unit)? = null) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .then(if (onClick != null) Modifier.clickable { onClick() } else Modifier)
            .padding(horizontal = 16.dp, vertical = 14.dp)
    ) {
        Text(label, style = MaterialTheme.typography.bodyLarge)
    }
}
