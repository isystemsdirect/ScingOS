package com.scingular.spectrocap.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun LegalScreen(onBack: () -> Unit) {
    Surface(color = MaterialTheme.colorScheme.background) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 20.dp, vertical = 18.dp)
        ) {
            // Minimal top bar
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Documents & Legal", color = MaterialTheme.colorScheme.onBackground, style = MaterialTheme.typography.titleLarge)
                TextButton(onClick = onBack) { Text("Back", color = MaterialTheme.colorScheme.onSurfaceVariant) }
            }
            HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))

            // Viewer (typography-first dark reader)
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text("SpectroCAP™", color = MaterialTheme.colorScheme.onBackground, style = MaterialTheme.typography.titleMedium)
                Text("Powered by SCINGULAR™", color = MaterialTheme.colorScheme.onSurface)
                Text("© 2026 Inspection Systems Direct Inc.", color = MaterialTheme.colorScheme.onSurface)

                HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))

                Text("Terms of Use", color = MaterialTheme.colorScheme.onBackground, style = MaterialTheme.typography.titleMedium)
                Text("Placeholder. Replace with legal content.", color = MaterialTheme.colorScheme.onSurface)

                HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))

                Text("Privacy Policy", color = MaterialTheme.colorScheme.onBackground, style = MaterialTheme.typography.titleMedium)
                Text("Placeholder. Replace with legal content.", color = MaterialTheme.colorScheme.onSurface)
            }
        }
    }
}
