package com.scingular.spectrocap.ui.theme

import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

/**
 * IonMetalTheme — STATIC, COMPLETE ColorScheme
 * Non-negotiable: no dynamic colors; no missing roles; no Material fallback to system palette.
 */
private val IonMetalScheme: ColorScheme = darkColorScheme(
    // --- Primary roles
    primary = IonMetalColor.ACCENT_PRIMARY,
    onPrimary = IonMetalColor.BG_PRIMARY,
    primaryContainer = IonMetalColor.BG_ELEVATED,
    onPrimaryContainer = IonMetalColor.TEXT_PRIMARY,

    // --- Secondary roles
    secondary = IonMetalColor.ACCENT_WARNING,
    onSecondary = IonMetalColor.BG_PRIMARY,
    secondaryContainer = IonMetalColor.BG_ELEVATED,
    onSecondaryContainer = IonMetalColor.TEXT_PRIMARY,

    // --- Tertiary roles
    tertiary = IonMetalColor.ACCENT_CRITICAL,
    onTertiary = IonMetalColor.BG_PRIMARY,
    tertiaryContainer = IonMetalColor.BG_ELEVATED,
    onTertiaryContainer = IonMetalColor.TEXT_PRIMARY,

    // --- Background roles
    background = IonMetalColor.BG_PRIMARY,
    onBackground = IonMetalColor.TEXT_PRIMARY,

    // --- Surface roles (lock these hard; most “blue/white” leaks come from surface defaults)
    surface = IonMetalColor.BG_SURFACE,
    onSurface = IonMetalColor.TEXT_PRIMARY,
    surfaceVariant = IonMetalColor.BG_ELEVATED,
    onSurfaceVariant = IonMetalColor.TEXT_SECONDARY,
    surfaceTint = IonMetalColor.ACCENT_PRIMARY,

    // --- Inverse roles (for components that use inverse palettes)
    inverseSurface = IonMetalColor.TEXT_PRIMARY,
    inverseOnSurface = IonMetalColor.BG_PRIMARY,
    inversePrimary = IonMetalColor.ACCENT_PRIMARY,

    // --- Error roles
    error = IonMetalColor.ACCENT_CRITICAL,
    onError = IonMetalColor.TEXT_PRIMARY,
    errorContainer = IonMetalColor.BG_ELEVATED,
    onErrorContainer = IonMetalColor.TEXT_PRIMARY,

    // --- Outline roles
    outline = IonMetalColor.STROKE_SUBTLE,
    outlineVariant = IonMetalColor.STROKE_ION,

    // --- Scrim (lock to black)
    scrim = Color(0xFF000000)
)

private val IonMetalTypography = Typography(
    titleLarge  = TextStyle(fontSize = 20.sp, fontWeight = FontWeight.SemiBold),
    titleMedium = TextStyle(fontSize = 16.sp, fontWeight = FontWeight.SemiBold),
    bodyLarge   = TextStyle(fontSize = 16.sp, fontWeight = FontWeight.Normal),
    bodyMedium  = TextStyle(fontSize = 14.sp, fontWeight = FontWeight.Normal),
    labelLarge  = TextStyle(fontSize = 12.sp, fontWeight = FontWeight.Medium)
)

@Composable
fun IonMetalTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = IonMetalScheme,
        typography = IonMetalTypography,
        content = content
    )
}
