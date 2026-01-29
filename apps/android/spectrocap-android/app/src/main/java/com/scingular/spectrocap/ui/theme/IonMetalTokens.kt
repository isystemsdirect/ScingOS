package com.scingular.spectrocap.ui.theme

import androidx.compose.ui.graphics.Color

/**
 * IonMetal Tokens — Design Authority
 * Metallic / graphite / slate surfaces
 * Restrained electric accent (never blue/white)
 * Calm, engineered, confident
 */
object IonMetalColor {
    // Surfaces (NO pure white canvases)
    val BG_PRIMARY   = Color(0xFF0E1113) // graphite black
    val BG_SURFACE   = Color(0xFF14181B) // machined slate
    val BG_ELEVATED  = Color(0xFF1A1F23) // depth layer

    // Text
    val TEXT_PRIMARY   = Color(0xFFE6E8EA) // soft white (not pure)
    val TEXT_SECONDARY = Color(0xFFA8B0B6)
    val TEXT_MUTED     = Color(0xFF6E767C)

    // Accents (restrained)
    val ACCENT_PRIMARY  = Color(0xFF7FAFB2) // ion teal (default)
    val ACCENT_WARNING  = Color(0xFFB89B5E) // muted amber
    val ACCENT_CRITICAL = Color(0xFF9E4A4A) // controlled red

    // Lines / dividers
    val STROKE_SUBTLE   = Color(0xFF22282D)
    val STROKE_ION      = Color(0xFF2A3A3B)
}

object IonMetalDimen {
    // Rhythm: 8dp system
    const val RADIUS = 10 // dp
}
