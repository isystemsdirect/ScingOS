package com.scingular.spectrocap.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Divider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.scingular.spectrocap.ui.theme.IonMetalColor
import com.scingular.spectrocap.ui.theme.IonDivider
import com.scingular.spectrocap.ui.theme.IonSurface
import com.scingular.spectrocap.ui.theme.IonPressable
import com.scingular.spectrocap.ui.theme.ionEnter

@Composable
fun SettingsScreen(
    onOpenLegal: () -> Unit,
    onBack: () -> Unit
) {
    Surface(color = IonMetalColor.BG_PRIMARY) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 20.dp, vertical = 18.dp)
                .ionEnter(),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // HEADER
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Settings", color = IonMetalColor.TEXT_PRIMARY, style = MaterialTheme.typography.titleLarge)
                TextButton(onClick = onBack) { Text("Back", color = IonMetalColor.TEXT_SECONDARY) }
            }
            Divider(color = IonMetalColor.STROKE_SUBTLE)

            // CORE
            IonSection(title = "Core") {
                IonSurface { Column {
                    IonRow("Behavior"); IonDivider()
                    IonRow("Appearance"); IonDivider()
                    IonRow("Clipboard Rules")
                } }
            }

            // SYSTEM
            IonSection(title = "System") {
                IonSurface { Column {
                    IonRow("Documents & Legal", onClick = onOpenLegal); IonDivider()
                    IonRow("Diagnostics (read-only)"); IonDivider()
                    IonRow("About SpectroCAP™")
                } }
            }

            Spacer(modifier = Modifier.weight(1f))

            // FOOTER
            Divider(color = IonMetalColor.STROKE_SUBTLE)
            Text("Build ID • SCINGULAR Mark", color = IonMetalColor.TEXT_MUTED, style = MaterialTheme.typography.labelLarge)
        }
    }
}

@Composable
private fun IonSection(title: String, content: @Composable () -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(title, color = IonMetalColor.TEXT_SECONDARY, style = MaterialTheme.typography.labelLarge)
        IonSurface { Column(modifier = Modifier.fillMaxWidth()) { content() } }
    }
}

@Composable
private fun IonRow(label: String, onClick: (() -> Unit)? = null) {
    val base = Modifier
        .fillMaxWidth()
        .then(if (onClick != null) Modifier.clickable { onClick() } else Modifier)
        .padding(horizontal = 16.dp, vertical = 14.dp)

    IonPressable(modifier = base) { _, _ ->
        Column(modifier = Modifier.fillMaxWidth()) {
            Text(label, color = IonMetalColor.TEXT_PRIMARY, style = MaterialTheme.typography.bodyLarge)
        }
    }
}
