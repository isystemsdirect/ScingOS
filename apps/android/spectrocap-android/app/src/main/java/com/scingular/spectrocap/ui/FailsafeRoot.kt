package com.scingular.spectrocap.ui

import android.util.Log
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.scingular.spectrocap.ui.theme.IonMetalColor
import com.scingular.spectrocap.ui.theme.IonMetalTheme

private const val TAG = "SpectroCAP_FAILSAFE"

/**
 * If anything throws while building the root UI, we render a deterministic
 * failsafe screen so the device never looks "dead".
 */
@Composable
fun FailsafeRoot(content: @Composable () -> Unit) {
    try {
        IonMetalTheme { content() }
    } catch (t: Throwable) {
        Log.e(TAG, "UI crash caught in FailsafeRoot", t)
        IonMetalTheme {
            Surface(color = IonMetalColor.BG_PRIMARY) {
                Column(
                    modifier = Modifier.fillMaxSize().padding(18.dp),
                    verticalArrangement = androidx.compose.foundation.layout.Arrangement.Center,
                    horizontalAlignment = Alignment.Start
                ) {
                    Text(
                        text = "SPECTROCAP — UI FAILSAFE",
                        color = IonMetalColor.TEXT_PRIMARY,
                        style = MaterialTheme.typography.titleLarge
                    )
                    Spacer(Modifier.height(10.dp))
                    Text(
                        text = "A runtime error occurred while rendering the UI.",
                        color = IonMetalColor.TEXT_SECONDARY,
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Spacer(Modifier.height(14.dp))
                    Text(
                        text = (t::class.java.name + ": " + (t.message ?: "")),
                        color = IonMetalColor.ACCENT_CRITICAL,
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Spacer(Modifier.height(10.dp))
                    Text(
                        text = "Check logcat tag: $TAG",
                        color = IonMetalColor.TEXT_MUTED,
                        style = MaterialTheme.typography.labelLarge
                    )
                }
            }
        }
    }
}
