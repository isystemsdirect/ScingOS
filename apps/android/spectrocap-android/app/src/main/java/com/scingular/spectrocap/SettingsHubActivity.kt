package com.scingular.spectrocap

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.scingular.spectrocap.ui.screens.settings.SettingsHubScreen
import com.scingular.spectrocap.ui.theme.SpectroCAPTheme

class SettingsHubActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SpectroCAPTheme {
                SettingsHubScreen { finish() }
            }
        }
    }
}
