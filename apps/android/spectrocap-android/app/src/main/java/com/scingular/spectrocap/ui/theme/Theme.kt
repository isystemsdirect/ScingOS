package com.scingular.spectrocap.ui.theme

import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = Color(0xFF7FAFB2),
    onPrimary = Color(0xFF0E1113),
    secondary = Color(0xFFB89B5E),
    onSecondary = Color(0xFF0E1113),
    tertiary = Color(0xFF9E4A4A),
    onTertiary = Color(0xFF0E1113),
    background = Color(0xFF0E1113),
    surface = Color(0xFF14181B),
    onSurface = Color(0xFFE6E8EA),
)

@Composable
fun SpectroCAPTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = Typography,
        content = content
    )
}
