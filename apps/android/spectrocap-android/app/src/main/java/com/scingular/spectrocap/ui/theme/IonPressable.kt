package com.scingular.spectrocap.ui.theme

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

/**
 * IonPressable: engineered press feedback.
 * - Scale: 1.00 -> 0.985 while pressed
 * - Overlay: subtle ion tint (~6–8% alpha)
 */
@Composable
fun IonPressable(
    modifier: Modifier = Modifier,
    overlayColor: Color = IonMetalColor.ACCENT_PRIMARY.copy(alpha = 0.08f),
    content: @Composable BoxScope.(interaction: MutableInteractionSource, pressed: Boolean) -> Unit
) {
    val interaction = remember { MutableInteractionSource() }
    val pressed = interaction.collectIsPressedAsState().value

    val scale = animateFloatAsState(
        targetValue = if (pressed) 0.985f else 1.0f,
        animationSpec = tween(IonMotion.PRESS_MS, easing = IonMotion.Ease),
        label = "ion_press_scale"
    ).value

    Box(modifier = modifier.scale(scale)) {
        content(interaction, pressed)

        if (pressed) {
            Surface(
                color = overlayColor,
                tonalElevation = 0.dp,
                modifier = Modifier.fillMaxSize()
            ) {}
        }
    }
}
