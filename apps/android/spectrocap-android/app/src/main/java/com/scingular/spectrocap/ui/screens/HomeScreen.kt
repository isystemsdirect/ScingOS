package com.scingular.spectrocap.ui.screens

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.unit.dp
import com.scingular.spectrocap.BuildConfig
import com.scingular.spectrocap.ui.theme.IonMetalColor
import com.scingular.spectrocap.ui.theme.IonSurface
import com.scingular.spectrocap.ui.theme.IonPressable
import com.scingular.spectrocap.ui.theme.ionEnter

@Composable
fun HomeScreen(onOpenSettings: () -> Unit) {
    Surface(color = IonMetalColor.BG_PRIMARY) {
        Column(
            modifier = androidx.compose.ui.Modifier
                .fillMaxSize()
                .padding(horizontal = 20.dp, vertical = 18.dp)
                .ionEnter(),
            verticalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(16.dp)
        ) {
            // DEBUG THEME PROBE (remove anytime)
            if (BuildConfig.DEBUG) {
                Surface(color = IonMetalColor.BG_SURFACE, tonalElevation = 0.dp) {
                    Row(
                        modifier = androidx.compose.ui.Modifier
                            .fillMaxWidth()
                            .padding(10.dp),
                        horizontalArrangement = androidx.compose.foundation.layout.Arrangement.SpaceBetween
                    ) {
                        Text(
                            "IONMETAL ACTIVE",
                            color = IonMetalColor.TEXT_PRIMARY,
                            style = MaterialTheme.typography.labelLarge
                        )
                        Text(
                            "ACCENT",
                            color = IonMetalColor.ACCENT_PRIMARY,
                            style = MaterialTheme.typography.labelLarge
                        )
                    }
                }
            }
            // STATUS BAND
            Column(verticalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(4.dp)) {
                Text("Device: Connected", color = IonMetalColor.TEXT_PRIMARY, style = MaterialTheme.typography.titleMedium)
                Text("Mode: Clipboard Ready", color = IonMetalColor.TEXT_SECONDARY, style = MaterialTheme.typography.bodyMedium)
            }

            // PRIMARY ACTION (Ion accent ring concept = outlined + motion)
            IonPressable(modifier = androidx.compose.ui.Modifier.fillMaxWidth().height(56.dp)) { interaction, _ ->
                OutlinedButton(
                    onClick = { /* UI-only here */ },
                    interactionSource = interaction,
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = IonMetalColor.ACCENT_PRIMARY
                    ),
                    border = ButtonDefaults.outlinedButtonBorder.copy(
                        width = 1.dp
                    ),
                    modifier = androidx.compose.ui.Modifier
                        .fillMaxSize()
                ) {
                    Text("Send Clipboard", style = MaterialTheme.typography.titleMedium)
                }
            }

            // CONTEXT PANEL
            IonSurface(modifier = androidx.compose.ui.Modifier.fillMaxWidth()) {
                Column(
                    modifier = androidx.compose.ui.Modifier.padding(16.dp),
                    verticalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(6.dp)
                ) {
                    Text("Status", color = IonMetalColor.TEXT_PRIMARY, style = MaterialTheme.typography.titleMedium)
                    Text("Receiver Offline", color = IonMetalColor.TEXT_MUTED, style = MaterialTheme.typography.bodyMedium)
                }
            }

            Spacer(modifier = androidx.compose.ui.Modifier.weight(1f))

            // SETTINGS DISCOVERABILITY (redundant + bottom bar present)
            TextButton(
                onClick = onOpenSettings,
                modifier = androidx.compose.ui.Modifier.align(Alignment.CenterHorizontally)
            ) {
                Text("Settings", color = IonMetalColor.TEXT_SECONDARY)
            }
        }
    }
}
