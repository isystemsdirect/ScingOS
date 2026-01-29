package com.scingular.spectrocap.ui.theme

import androidx.compose.animation.core.CubicBezierEasing

object IonMotion {
    // Duration spec (ms)
    const val PRESS_MS = 120
    const val ENTER_MS = 160
    const val EXIT_MS  = 140

    // Engineered easing (no bounce)
    val Ease = CubicBezierEasing(0.2f, 0.0f, 0.0f, 1.0f)
}
