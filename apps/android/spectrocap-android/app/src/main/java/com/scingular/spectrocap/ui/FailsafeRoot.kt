package com.scingular.spectrocap.ui

import androidx.compose.runtime.Composable
import com.scingular.spectrocap.ui.theme.SpectroCAPTheme

@Composable
fun FailsafeRoot(content: @Composable () -> Unit) {
    SpectroCAPTheme {
        content()
    }
}
