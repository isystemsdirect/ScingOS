package com.scingular.spectrocap.ui

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.AbstractComposeView
import com.scingular.spectrocap.ui.theme.SpectroCAPTheme

class ThemedComposeView(context: Context) : AbstractComposeView(context) {
    private var content: @Composable () -> Unit = {}

    fun setContent(content: @Composable () -> Unit) {
        this.content = content
    }

    @Composable
    override fun Content() {
        SpectroCAPTheme {
            content()
        }
    }
}