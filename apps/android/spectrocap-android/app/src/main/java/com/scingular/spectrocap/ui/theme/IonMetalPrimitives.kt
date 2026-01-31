package com.scingular.spectrocap.ui.theme

import androidx.compose.foundation.BorderStroke
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun IonSurface(
    modifier: Modifier = Modifier,
    elevated: Boolean = false,
    content: @Composable () -> Unit
) {
    Surface(
        modifier = modifier,
        color = if (elevated) IonMetalColor.BG_ELEVATED else IonMetalColor.BG_SURFACE,
        tonalElevation = 0.dp,
        border = BorderStroke(1.dp, IonMetalColor.STROKE_SUBTLE),
        content = content
    )
}

@Composable
fun IonDivider(modifier: Modifier = Modifier) {
    HorizontalDivider(
        modifier = modifier,
        color = IonMetalColor.STROKE_SUBTLE,
        thickness = 1.dp
    )
}
