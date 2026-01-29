package com.scingular.spectrocap.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
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
import com.scingular.spectrocap.ui.theme.ionEnter

@Composable
fun LegalScreen(onBack: () -> Unit) {
    Surface(color = IonMetalColor.BG_PRIMARY) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 20.dp, vertical = 18.dp)
                .ionEnter()
        ) {
            // Minimal top bar
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Documents & Legal", color = IonMetalColor.TEXT_PRIMARY, style = MaterialTheme.typography.titleLarge)
                TextButton(onClick = onBack) { Text("Back", color = IonMetalColor.TEXT_SECONDARY) }
            }
            Divider(color = IonMetalColor.STROKE_SUBTLE, modifier = Modifier.padding(vertical = 12.dp))

            // Viewer (typography-first dark reader)
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text("SpectroCAP™", color = IonMetalColor.TEXT_PRIMARY, style = MaterialTheme.typography.titleMedium)
                Text("Powered by SCINGULAR™", color = IonMetalColor.TEXT_SECONDARY)
                Text("© 2026 Inspection Systems Direct Inc.", color = IonMetalColor.TEXT_SECONDARY)

                IonDivider(modifier = Modifier.padding(vertical = 12.dp))

                Text("Terms of Use", color = IonMetalColor.TEXT_PRIMARY, style = MaterialTheme.typography.titleMedium)
                Text("Placeholder. Replace with legal content.", color = IonMetalColor.TEXT_SECONDARY)

                IonDivider(modifier = Modifier.padding(vertical = 12.dp))

                Text("Privacy Policy", color = IonMetalColor.TEXT_PRIMARY, style = MaterialTheme.typography.titleMedium)
                Text("Placeholder. Replace with legal content.", color = IonMetalColor.TEXT_SECONDARY)
            }
        }
    }
}
