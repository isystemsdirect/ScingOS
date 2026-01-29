package com.scingular.spectrocap.ui.theme

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha

/**
 * IonEnter: subtle enter fade for screens (engineered).
 */
@Composable
fun Modifier.ionEnter(): Modifier {
    var shown by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { shown = true }

    val a by animateFloatAsState(
        targetValue = if (shown) 1f else 0f,
        animationSpec = tween(IonMotion.ENTER_MS, easing = IonMotion.Ease),
        label = "ion_enter_alpha"
    )
    return this.alpha(a)
}
