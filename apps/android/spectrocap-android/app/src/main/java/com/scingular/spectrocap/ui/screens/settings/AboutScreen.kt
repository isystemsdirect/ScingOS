package com.scingular.spectrocap.ui.screens.settings

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@Composable
fun AboutScreen() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        AppIdentityCard()
        VersioningCard()
        SupportCard()
    }
}

@Composable
private fun AppIdentityCard() {
    Card(modifier = Modifier.fillMaxWidth()) {
        Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            // TODO: Add app icon
            Column {
                Text("SpectroCAP", style = MaterialTheme.typography.titleLarge)
                Text("Clipboard bridge (Beta)", style = MaterialTheme.typography.bodyMedium)
            }
        }
    }
}

@Composable
private fun VersioningCard() {
    val context = LocalContext.current
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Versioning", style = MaterialTheme.typography.titleLarge)
            Spacer(modifier = Modifier.height(16.dp))
            StatusRow("Version", "1.0.0-beta")
            StatusRow("Build", "12345")
            StatusRow("Channel", "Beta")
            Spacer(modifier = Modifier.height(16.dp))
            Button(onClick = { /* TODO: Copy build info */ }, modifier = Modifier.fillMaxWidth()) {
                Text("Copy build info")
            }
        }
    }
}

@Composable
private fun SupportCard() {
    val context = LocalContext.current
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("Support", style = MaterialTheme.typography.titleLarge)
            Button(
                onClick = { /* TODO: Implement issue reporting */ },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Report an issue")
            }
            Button(
                onClick = { /* TODO: Implement feedback mechanism */ },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Send feedback")
            }
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
