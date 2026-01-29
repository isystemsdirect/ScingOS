package com.scingular.spectrocap.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

private val IonMetalScheme = darkColorScheme(
    primary = IonMetalColor.ACCENT_PRIMARY,
    onPrimary = IonMetalColor.BG_PRIMARY,

    secondary = IonMetalColor.ACCENT_WARNING,
    onSecondary = IonMetalColor.BG_PRIMARY,

    tertiary = IonMetalColor.ACCENT_CRITICAL,
    onTertiary = IonMetalColor.BG_PRIMARY,

    background = IonMetalColor.BG_PRIMARY,
    onBackground = IonMetalColor.TEXT_PRIMARY,

    surface = IonMetalColor.BG_SURFACE,
    onSurface = IonMetalColor.TEXT_PRIMARY,

    surfaceVariant = IonMetalColor.BG_ELEVATED,
    onSurfaceVariant = IonMetalColor.TEXT_SECONDARY,

    outline = IonMetalColor.STROKE_SUBTLE,
    outlineVariant = IonMetalColor.STROKE_ION,

    error = IonMetalColor.ACCENT_CRITICAL,
    onError = IonMetalColor.TEXT_PRIMARY
)

private val IonMetalTypography = Typography(
    // Quiet confidence: 400/500/600 only
    titleLarge = TextStyle(fontSize = 20.sp, fontWeight = FontWeight.SemiBold),
    titleMedium = TextStyle(fontSize = 16.sp, fontWeight = FontWeight.SemiBold),
    bodyLarge = TextStyle(fontSize = 16.sp, fontWeight = FontWeight.Normal),
    bodyMedium = TextStyle(fontSize = 14.sp, fontWeight = FontWeight.Normal),
    labelLarge = TextStyle(fontSize = 12.sp, fontWeight = FontWeight.Medium)
)

@Composable
fun IonMetalTheme(
    darkTheme: Boolean = true,
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = IonMetalScheme,
        typography = IonMetalTypography,
        content = content
    )
}
