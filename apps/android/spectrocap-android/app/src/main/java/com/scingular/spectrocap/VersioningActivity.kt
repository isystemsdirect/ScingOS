package com.scingular.spectrocap

import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.scingular.spectrocap.ui.theme.SpectroCAPTheme

class VersioningActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SpectroCAPTheme {
                VersioningScreen { finish() }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VersioningScreen(onBack: () -> Unit) {
    val context = LocalContext.current

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Versioning") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).padding(16.dp)) {
            VersionInfoRow("App Name", stringResource(R.string.app_name))
            VersionInfoRow("Version Name", "1.0.0") // Replace with BuildConfig if available
            VersionInfoRow("Version Code", "1") // Replace with BuildConfig if available
            VersionInfoRow("Build Type", "Debug") // Replace with BuildConfig if available
            VersionInfoRow("Package Name", context.packageName)
            VersionInfoRow("OS Version", "${Build.VERSION.RELEASE} (API ${Build.VERSION.SDK_INT})")
            VersionInfoRow("Device", "${Build.MANUFACTURER} ${Build.MODEL}")
        }
    }
}

@Composable
fun VersionInfoRow(label: String, value: String) {
    Row(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
        Text(text = label, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
        Text(text = value, modifier = Modifier.weight(1f))
    }
}
